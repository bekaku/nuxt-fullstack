<script setup lang="ts">
import type { FileManager } from "~/types/models";

const { file } = defineProps<{
  file: FileManager;
}>();
const contentUniqeId = useId();
const { formatDistanceFromNow } = useDateFns();
const { locale } = useLang();
const getViews = computed(() => readableNumber(file.view || 0));
</script>
<template>
  <div v-bind="$attrs" class="flex flex-col gap-4">
    <div class="text-xl font-bold">
      {{ file.title || file.fileName }}
    </div>
    <div class="flex items-center gap-2 p-2">
      <span v-if="file.createdDate" class="text-sm text-muted">{{
        formatDistanceFromNow(file.createdDate, locale, true)
      }}</span>

      <UButton variant="soft">
        <Icon name="lucide:eye" />
        <span class="ml-2">
          {{
            `${getViews} ${file.view && file.view > 1 ? $t("drive.views") : $t("drive.view")}`
          }}
        </span>
      </UButton>
      <UButton variant="soft">
        <Icon name="lucide:share-2" />
        <span class="ml-2">{{ $t("base.share") }}</span>
      </UButton>
      <UButton variant="soft">
        <Icon name="lucide:download" />
        <span class="ml-2">{{ $t("base.download") }}</span>
      </UButton>
    </div>
    <UUser
      name="John Doe"
      description="Software Engineer"
      :avatar="{
        src: 'https://i.pravatar.cc/150?u=john-doe',
        loading: 'lazy',
        icon: 'i-lucide-image',
      }"
    />
    <div class="py-2">
      <BaseContentText
        v-if="file.description"
        :rows="3"
        :content="file.description"
        show-more
        text-class="app-text"
        expand-text="Read more"
        collapse-text="Show less"
        :urlify="true"
      />
    </div>
  </div>
</template>
