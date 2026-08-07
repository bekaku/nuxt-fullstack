<script setup lang="ts">
import type { PlyrOptions } from "~/types/common";
import type { FileManager } from "~/types/models";

const {
  file,
  replaceUrl = true,
  options = { autoplay: false },
} = defineProps<{
  file: FileManager;
  options?: PlyrOptions;
  replaceUrl?: boolean;
}>();
const emit = defineEmits<{
  "on-close": [];
}>();
const { isMobileOrTablet } = useAppDevice();
const show = defineModel<boolean>("show", { default: false });
const { onReplaceUrl, getCurrentPath, appNavigateTo } = useBase();
const appTO = ref<any>();
const onClose = () => {
  console.log("onClose");
  emit("on-close");
  show.value = false;
};
const onManualClose = () => {
  console.log("onManualClose");
  onClose();
  show.value = false;
};
const onOpenWatch = () => {
  appNavigateTo(`/watch/v/${file.id}`);
  onManualClose();
};
onMounted(() => {
  if (replaceUrl) {
    appTO.value = setTimeout(() => {
      onReplaceUrl(`/watch/v/${file.id}`);
    }, 500);
  }
});
onBeforeUnmount(() => {
  onReplaceUrl(getCurrentPath(true));
  if (appTO.value) {
    clearTimeout(appTO.value);
    appTO.value = null;
  }
});
</script>
<template>
  <LazyUModal v-if="show" v-model:open="show" fullscreen>
    <template #header>
      <div class="flex w-full gap-4 justify-between">
        <div>
          {{ file.title || file.fileName }}
        </div>
        <div>
          <UTooltip :text="$t('base.openWatch')">
            <UButton
              icon="lucide:maximize"
              variant="ghost"
              class="rounded-full"
              @click="onOpenWatch"
            />
          </UTooltip>
          <UTooltip :text="$t('base.close')">
            <UButton
              variant="ghost"
              icon="lucide:x"
              class="rounded-full"
              @click="onManualClose"
            />
          </UTooltip>
        </div>
      </div>
    </template>
    <template #body>
      <div class="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
        <div class="md:col-span-8 h-full bg-neutral-950">
          <BaseVideoPlayer
            :style="{ width: isMobileOrTablet ? '100%' : '80%' }"
            :options
            :file
          />
        </div>

        <div class="md:col-span-4 px-4">
          <BaseVideoPlayerDetail :file="file" />
        </div>
      </div>
    </template>
  </LazyUModal>
</template>
