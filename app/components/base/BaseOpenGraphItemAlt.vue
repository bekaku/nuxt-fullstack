<script setup lang="ts">
import type { OgMeta } from "~/types/common";
import { catchUrlFromText } from "~/utils/appUtil";

const {
  short = false,
  showBg = true,
  textLines = 1,
  descriptionLines = 2,
  imageSize = "125px",
  imageMaxHeight = "250px",
  content,
} = defineProps<{
  item?: OgMeta;
  content?: string;
  short?: boolean;
  showBg?: boolean;
  textLines?: number;
  descriptionLines?: number;
  imageSize?: string;
  imageMaxHeight?: string;
}>();
const opengraphItem = ref<OgMeta>();
const showOg = ref(false);
onMounted(async () => {
  if (content) {
    const matches = catchUrlFromText(content);
    if (matches && matches.length > 0) {
      // Best-effort preview: /api/meta requires login (same-origin cookie is sent by
      // the browser) and rejects private/unreachable URLs. Any failure simply hides
      // the preview, so plain $fetch is used instead of useApi() to avoid error toasts.
      try {
        const res = await $fetch<OgMeta>("/api/meta", {
          query: { url: matches[0] },
        });
        if (res) {
          opengraphItem.value = res;
          showOg.value = true;
        }
      } catch {
        showOg.value = false;
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
