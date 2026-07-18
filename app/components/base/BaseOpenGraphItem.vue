<script setup lang="ts">
import type { he } from "date-fns/locale";
import type { OgMeta } from "~/types/common";
import type { OgProps } from "~/types/props";

const {
  short = false,
  showBg = true,
  textLines = 1,
  descriptionLines = 2,
  imageSize = "125px",
  imageMaxHeight = "250px",
} = defineProps<OgProps>();
</script>
<template>
  <div v-if="item" class="flex flex-col bg-neutral-50 dark:bg-neutral-800">
    <ULink :to="item.url" target="_blank">
      <div v-if="!short && item.image" :style="{ maxHeight: imageMaxHeight, overflow: 'hidden' }">
        <NuxtImg
          v-if="item.image"
          :src="item.image"
          class="w-full"
          fit="cover"
        />
      </div>

      <BaseItem class="hover:opacity-80" :separator="false">
        <template v-if="short && item.image" #start>
          <NuxtImg
            v-if="item.image"
            :src="item.image"
            :style="{ width: `${imageSize}`, height: 'auto' }"
            fit="cover"
          />
        </template>
        <div class="flex flex-col gap-1">
          <p v-if="item.domain" class="text-neutral-900 dark:text-neutral-50">
            {{ item.domain }}
          </p>
          <BaseContentText
            v-if="item.title"
            :rows="1"
            :content="item.title"
            text-class="text-neutral-900 dark:text-neutral-50"
          />
          <BaseContentText
            v-if="item.desc"
            text-class="text-sm text-muted font-light"
            :rows="2"
            :content="item.desc"
          />
        </div>
        <template #end>
          <UIcon name="lucide:square-arrow-out-up-right" />
        </template>
      </BaseItem>
    </ULink>
  </div>
</template>
