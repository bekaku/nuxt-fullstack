<script setup lang="ts">
import type { LabelValue } from "~/types/common";

const infiniteRef = useTemplateRef<any>("infiniteRef");
const totalItems = 100;
const items = ref<LabelValue<any>[]>([]);
const page = ref(1);
const limit = 20;
const hasMore = ref(true);
const isFetching = ref(false);

const isScrollingoToTop = ref(false);

const fetchMoreData = async () => {
  console.log("Fetching older messages...");
  if (isFetching.value || !hasMore.value) return;
  const scrollEl = infiniteRef.value?.$el; // อ้างอิงถึงกล่อง Scroll
  const previousScrollHeight = scrollEl ? scrollEl.scrollHeight : 0;
  const previousScrollTop = scrollEl ? scrollEl.scrollTop : 0;

  isFetching.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // คำนวณหา ID เริ่มต้นของรอบนี้
  // รอบที่ 1: 100 - (1 * 25) + 1 = เริ่มที่ 76 (จบที่ 100)
  // รอบที่ 2: 100 - (2 * 25) + 1 = เริ่มที่ 51 (จบที่ 75)
  const startId = totalItems - page.value * limit + 1;

  const newItems = Array.from({ length: limit }, (_, i) => {
    return {
      label: `Item ${startId + i}`, // จะได้ Item 76, 77, 78 ... 100
      avatar: {
        src: getMockAvatarByIndex(i),
      },
    };
  });

  // ใช้ unshift เพื่อนำข้อมูลใหม่ (ข้อความเก่า) ไปแทรกไว้ "ด้านบนสุด" ของ Array เสมอ
  items.value.unshift(...newItems);

  // เช็กว่าโหลดจนถึง Item ที่ 1 หรือยัง
  if (startId <= 1) {
    hasMore.value = false; // ไม่มีให้โหลดแล้ว
  } else {
    page.value++; // ไปหน้าต่อไปสำหรับรอบหน้า
  }

  await nextTick();

  if (scrollEl) {
    // ความสูงของข้อความชุดใหม่ = ความสูงรวมใหม่ - ความสูงรวมเก่า
    const heightDifference = scrollEl.scrollHeight - previousScrollHeight;

    // ดันหน้าจอลงมาเท่ากับความสูงของข้อความที่เพิ่งแทรกเข้ามา
    scrollEl.scrollTo({
      top: previousScrollTop + heightDifference,
      behavior: "auto", // สำคัญมาก: ต้องใช้ auto เพื่อไม่ให้เห็นแอนิเมชันกระตุก
    });
  }
  // เคลียร์สถานะโหลดทีหลังสุด เพื่อไม่ให้ infinite scroll ทำงานซ้ำซ้อนตอนที่เรากำลังดันจอ
  setTimeout(() => {
    isFetching.value = false;
  }, 100);
};

const initData = async () => {
  await fetchMoreData(); // 1. ดึงข้อมูล 25 ข้อความล่าสุด
  await nextTick(); // 2. รอให้ Vue อัปเดต HTML (วาดกล่องข้อความลงจอ) ให้เสร็จ
  infiniteRef.value?.scrollToBottom(); // 3. เลื่อนจอลงไปล่างสุด
};
initData();

const reload = () => {
  items.value = [];
  page.value = 1;
  hasMore.value = true;
  initData();
};
const scrollingTop = (state: boolean) => {
  isScrollingoToTop.value = state;
};
</script>
<template>
  <UCard title="Usage scroll top">
    <template #description>
      <div class="flex gap-2 p-2">
        <UButton @click="reload">Reload</UButton>
        <UButton @click="infiniteRef?.scrollToTop()">Scroll to top</UButton>
        <UButton @click="infiniteRef?.scrollToBottom()"
          >Scroll to bottom</UButton
        >
      </div>
    </template>
    <BaseInfiniteScroll
      ref="infiniteRef"
      :is-fetching="isFetching"
      :has-more="hasMore"
      scroll-class="h-80"
      direction="top"
      @load-more="fetchMoreData"
      @scrolling-top="scrollingTop"
    >
      <div class="relative flex flex-col gap-3">
        <UUser
          v-for="(item, index) in items"
          :key="index"
          :name="item.label"
          :avatar="item.avatar"
          size="xl"
        />

        <div v-if="isScrollingoToTop" class="sticky bottom-4 self-center z-10">
          <UButton icon="lucide:arrow-down" class="rounded-full shadow-md" @click="infiniteRef?.scrollToBottom()" />
        </div>
      </div>
    </BaseInfiniteScroll>
  </UCard>
</template>
