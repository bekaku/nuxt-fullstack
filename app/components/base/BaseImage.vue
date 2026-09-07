<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();
const {
  alt = "img",
  placeholder = "/images/no_picture.jpg",
  format = "webp",
  fit = "cover",
  hoverEffect = false,
} = defineProps<{
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  sizes?: string;
  placeholder?: any;
  placeholderClass?: string;
  preset?: string;
  format?: "webp" | "avif" | "jpeg" | "jpg" | "png" | "gif" | "svg";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  quality?: string;
  hoverEffect?: boolean;
}>();
defineEmits<{
  "on-click": [payload: any];
}>();
const objectFitClass = computed(() => {
  switch (fit) {
    case "contain":
    case "inside":
      return "object-contain";
    case "fill":
      return "object-fill";
    case "outside":
    case "cover":
    default:
      return "object-cover";
  }
});
</script>
<template>
  <div
    class="group relative overflow-hidden inline-block"
    :class="attrs.class"
    @click="$emit('on-click', $event)"
  >
    <NuxtImg
      v-bind="attrs"
      :src="src"
      :width="width"
      :height="height"
      :sizes
      :alt
      :preset
      :placeholder
      :placeholder-class="placeholderClass"
      :format
      :quality
      :fit
      :class="[
        'w-full h-full ',
        objectFitClass,
        hoverEffect &&
          'transition-transform duration-200 group-hover:scale-105',
      ]"
      loading="lazy"
    />
    <div
      v-if="$slots.default"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
    >
      <!-- ถ้าใน slot มีปุ่มกด ให้ใส่ pointer-events-auto เฉพาะ element นั้น -->
      <div class="pointer-events-auto">
        <slot />
      </div>
    </div>
  </div>
</template>
