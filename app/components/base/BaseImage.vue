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
    class="relative overflow-hidden inline-block"
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
      :class="['w-full h-full', objectFitClass, attrs.class]"
      loading="lazy"
    />
    <div
      v-if="$slots.default"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-auto"
    >
      <slot />
    </div>
  </div>
</template>
