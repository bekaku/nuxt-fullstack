<script setup lang="ts">
import type { OgMeta } from "~/types/common";
import type { OgProps } from "~/types/props";
import { catchUrlFromText } from "~/utils/appUtil";

const {
  short = false,
  showBg = true,
  textLines = 1,
  descriptionLines = 2,
  imageSize = "125px",
  imageMaxHeight = "250px",
  content,
} = defineProps<OgProps>();
const opengraphItem = ref<OgMeta>();
const showOg = ref(false);
onMounted(async () => {
  if (content) {
    const matches = catchUrlFromText(content);
    if (matches && matches.length > 0) {
      const res = await $fetch<OgMeta>(
        `/api/meta?url=${encodeURIComponent(matches[0])}`,
      );
      if (res) {
        opengraphItem.value = res;
        showOg.value = true;
      }
    }
  }
});
</script>
<template>
  <LazyBaseOpenGraphItem
    v-if="opengraphItem && showOg"
    v-bind="$attrs"
    :item="opengraphItem"
    :short="short"
    :text-lines="textLines"
    :description-lines="textLines"
    :show-bg="showBg"
    :image-size="imageSize"
    :image-max-height="imageMaxHeight"
  />
</template>
