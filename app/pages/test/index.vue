<script setup lang="ts">
definePageMeta({
  layout: false,
});
useSeoMeta({
  title: "Test page",
});

const { fetchMe } = useAuth();
</script>
<template>
  <div class="flex flex-col gap-4 p-4">
    <UButton
      label="Home"
      icon="lucide:arrow-left"
      to="/"
      class="w-fit"
      variant="ghost"
    />

    <div class="w-full flex flex-col gap-4">
      <UCard title="Variant">
        <div class="flex flex-col gap-4">
          <div class="flex gap-2 items-center">
            <span>Subtle</span>
            <UButton
              label="บันทึก"
              icon="lucide:save"
              class="w-fit"
              @click="fetchMe"
            />
            <UButton
              label="ยืนยัน"
              icon="lucide:circle-check"
              color="success"
              class="w-fit"
            />
            <UButton
              label="ลบ"
              icon="lucide:trash"
              color="error"
              class="w-fit"
            />
            <UButton
              label="รอตรวจ"
              icon="lucide:clock"
              color="warning"
              class="w-fit"
            />
            <UButton
              label="เพิ่มเติม"
              icon="lucide:ellipsis"
              color="neutral"
              class="w-fit"
            />
          </div>
          <div class="flex gap-2 items-center">
            <span>Outline</span>
            <UButton
              label="ส่งออก"
              icon="lucide:arrow-down-to-line"
              class="w-fit"
              variant="outline"
            />
            <UButton
              label="ตัวกรอง"
              icon="lucide:funnel"
              color="neutral"
              class="w-fit"
              variant="outline"
            />
          </div>
          <div class="flex gap-2 items-center">
            <span>Ghost</span>
            <UButton
              label="รีเฟรช"
              icon="lucide:rotate-cw"
              class="w-fit"
              variant="ghost"
            />
            <UButton
              label="ตั้งค่าผู้ใช้งาน"
              icon="lucide:settings"
              color="neutral"
              class="w-fit"
              variant="ghost"
            />
          </div>
          <div class="flex gap-2 items-center">
            <span>Icon only</span>
            <UButton icon="lucide:pencil" class="w-fit" />
            <UButton icon="lucide:trash" color="error" class="w-fit" />
            <UButton
              icon="lucide:ellipsis-vertical"
              class="w-fit rounded-full"
              variant="ghost"
              color="neutral"
            />
            <UButton icon="lucide:plus" class="w-fit rounded-full" />
          </div>
        </div>
      </UCard>

      <UBadge label="Badge" class="w-fit" />
    </div>
  </div>
</template>
