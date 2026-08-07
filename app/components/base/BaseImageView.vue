<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
import type { FileManager, ImageDto } from "~/types/models";

const props = defineProps<{
  showDeleteImage?: boolean;
  fetch?: boolean;
  showArrow?: boolean;
  files?: FileManager[];
  images?: ImageDto[];
  selectedIndex?: number;
  allowKeyboard?: boolean;
  height?: string;
  width?: string;
  dark?: boolean;
  closeable?: boolean;
  showThumbnails?: boolean;
}>();

const emit = defineEmits(["close"]);
const { t } = useLang();
const items = ref<any[]>([]);
const carousel = useTemplateRef("carousel");
const activeIndex = ref(0);

const scale = ref(1);
const maxScale = 4; // ซูมได้สูงสุด 4 เท่า
const minScale = 1; // ย่อสุดได้แค่ขนาดเดิม (1 เท่า)

const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);
const menuItems = ref<DropdownMenuItem[]>([
  {
    label: t("base.download") || "",
    icon: "lucide:download",
    onSelect: () => {
      console.log("download");
      download();
    },
  },
]);
onMounted(async () => {
  await setList();
  if (props.selectedIndex) {
    select(props.selectedIndex);
  }
});

const getTextColor = computed(() => {
  return !props.dark
    ? "text-black dark:text-white"
    : "text-white hover:bg-neutral-700";
});

const zoomIn = () => {
  if (scale.value < maxScale) scale.value += 0.5;
};

const zoomOut = () => {
  if (scale.value > minScale) {
    scale.value -= 0.5;
    // ถ้าย่อสุด ให้รีเซ็ตตำแหน่งกลับมาตรงกลาง
    if (scale.value === minScale) resetPan();
  }
};

const toggleZoom = () => {
  if (scale.value > 1) {
    scale.value = 1;
    resetPan();
  } else {
    scale.value = 2.5;
  }
};

const resetPan = () => {
  translateX.value = 0;
  translateY.value = 0;
};
const onPointerDown = (e: any) => {
  if (scale.value <= 1) return; // ถ้าไม่ได้ซูม ไม่ต้องทำอะไร ปล่อยให้ Carousel เลื่อนรูปตามปกติ

  e.stopPropagation(); // ป้องกันไม่ให้ Carousel ลากเปลี่ยนรูป
  isDragging.value = true;

  // รองรับทั้งเมาส์และทัชสกรีน
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  startX.value = clientX - translateX.value;
  startY.value = clientY - translateY.value;
};

const onPointerMove = (e: any) => {
  if (!isDragging.value) return;

  e.stopPropagation(); // ป้องกันไม่ให้ Carousel ลากเปลี่ยนรูป
  e.preventDefault(); // ป้องกันการไถลของเบราว์เซอร์

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  translateX.value = clientX - startX.value;
  translateY.value = clientY - startY.value;
};

const onPointerUp = () => {
  isDragging.value = false;
};
const download = async () => {
  if (items.value.length > 0) {
    const f = items.value[activeIndex.value];
    if (f) {
      downloadURI(f, generateimageFileName());
    }
  }
};
const setList = async () => {
  if (props.files && props.files.length > 0) {
    for (const f of props.files) {
      if (props.fetch) {
        // const src = await fetchImage(f.filePath)
        // if (src) items.value.push(src)
      } else {
        items.value.push(f.filePath);
      }
    }
  } else if (props.images && props.images.length > 0) {
    for (const img of props.images) {
      if (props.fetch) {
        // const src = await fetchImage(img.image)
        // if (src) items.value.push(src)
      } else {
        items.value.push(img.image);
      }
    }
  }

  return new Promise((resolve) => {
    resolve(true);
  });
};

function onClickPrev() {
  if (activeIndex.value === 0) return;
  activeIndex.value--;
  select(activeIndex.value);
}

function onClickNext() {
  if (activeIndex.value === items.value.length - 1) return;
  activeIndex.value++;
  select(activeIndex.value);
}

function onSelect(index: number) {
  activeIndex.value = index;
}

function select(index: number) {
  activeIndex.value = index;
  carousel.value?.emblaApi?.scrollTo(index);
}

// รองรับการกดปุ่มซ้าย-ขวา และ ESC บนคีย์บอร์ด
onMounted(() => {
  if (props.allowKeyboard) {
    window.addEventListener("keydown", handleKeydown);
  }
});

onBeforeUnmount(() => {
  if (props.allowKeyboard) {
    window.removeEventListener("keydown", handleKeydown);
  }
});

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "ArrowRight") onClickNext();
  if (e.key === "ArrowLeft") onClickPrev();
  if (e.key === "Escape" && props.closeable) emit("close");
};

watch(
  () => activeIndex.value,
  () => {
    scale.value = 1;
    resetPan();
  },
);
</script>
<template>
  <div
    class="flex flex-col w-full h-full overflow-hidden"
    :class="[!dark ? 'bg-neutral-50 dark:bg-neutral-950' : 'bg-neutral-950']"
  >
    <div
      class="flex items-center justify-between px-4 py-3 shrink-0 border-b"
      :class="[
        !dark
          ? 'bg-white dark:bg-neutral-800 border-default'
          : 'bg-neutral-900 border-neutral-700',
      ]"
    >
      <div class="text-sm font-medium w-24" :class="getTextColor">
        {{ `${$t("base.photo")} ${activeIndex + 1}/${items.length}` }}
      </div>

      <div class="flex items-center justify-center gap-2">
        <UButton
          variant="ghost"
          icon="hugeicons:zoom-out-area"
          class="rounded-full"
          :class="getTextColor"
          @click="zoomOut"
        />
        <UButton
          variant="ghost"
          icon="hugeicons:zoom-in-area"
          class="rounded-full"
          :class="getTextColor"
          @click="zoomIn"
        />
        <UButton
          variant="ghost"
          class="rounded-full"
          :class="getTextColor"
          icon="hugeicons:arrow-left-02"
          :disabled="activeIndex === 0"
          @click="onClickPrev"
        />
        <UButton
          variant="ghost"
          class="rounded-full"
          icon="hugeicons:arrow-right-02"
          :class="getTextColor"
          :disabled="activeIndex === items.length - 1"
          @click="onClickNext"
        />
      </div>

      <div class="flex items-center justify-end w-24 gap-2">
        <slot name="header-right-prepend" />

        <UTooltip :text="$t('base.download')">
          <UButton
            variant="ghost"
            color="neutral"
            icon="lucide:download"
            class="rounded-full"
            :class="getTextColor"
            @click="download"
          />
        </UTooltip>

        <slot name="header-right-apppend" />
      </div>
    </div>
    <!-- <div class="flex flex-col w-full h-full"> -->
    <div class="flex flex-col w-full flex-1 min-h-0">
      <div class="flex-1 min-h-0 w-full p-2">
        <UCarousel
          ref="carousel"
          v-slot="{ item }"
          :items="items"
          class="w-full h-full"
          :ui="{
            root: 'w-full h-full',
            viewport: 'h-full',
            container: 'h-full min-h-0',
            item: 'basis-full h-full min-h-0 min-w-0 flex items-center justify-center overflow-hidden',
          }"
          @select="onSelect"
        >
          <!-- <img
            :src="item"
            class="max-w-full max-h-full w-auto h-auto object-contain block"
            draggable="false"
            loading="lazy"
          /> -->
          <img
            :src="item"
            class="max-w-full max-h-full w-auto h-auto object-contain block origin-center select-none"
            :class="[
              !isDragging ? 'transition-transform duration-300' : '',
              scale > 1
                ? isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-zoom-in',
            ]"
            :style="{
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            }"
            draggable="false"
            loading="lazy"
            @dblclick="toggleZoom"
            @mousedown="onPointerDown"
            @mousemove="onPointerMove"
            @mouseup="onPointerUp"
            @mouseleave="onPointerUp"
            @touchstart="onPointerDown"
            @touchmove="onPointerMove"
            @touchend="onPointerUp"
          />
        </UCarousel>
      </div>

      <div
        v-if="showThumbnails"
        class="flex gap-1 justify-between pt-4 pb-4 max-w-xs mx-auto shrink-0"
      >
        <div
          v-for="(item, index) in items"
          :key="index"
          class="size-11 opacity-25 hover:opacity-100 transition-opacity cursor-pointer"
          :class="{ 'opacity-100': activeIndex === index }"
          @click="select(index)"
        >
          <img
            :src="item"
            width="44"
            height="44"
            class="rounded-sm object-cover w-full h-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </div>
</template>
