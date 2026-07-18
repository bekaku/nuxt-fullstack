<script setup lang="ts">
const modelValue = ref<string | undefined>("");
const showCommentTool = ref(false);
</script>
<template>
  <UCard
    v-bind="$attrs"
    :ui="{ root: 'ring-0 border-0 shadow-none' }"
    variant="soft"
  >
    <UTextarea
      class="w-full"
      :rows="1"
      v-model="modelValue"
      placeholder="Type something..."
      @click="
        () => {
          showCommentTool = true;
        }
      "
    />

    <BaseTransitionWrapper name="slide-down">
      <div
        v-if="showCommentTool"
        class="w-full grid grid-cols-1 items-center md:grid-cols-3 gap-2 py-2"
      >
        <div class="md:col-span-2">
          <div class="flex items-center gap-1">
            <UTooltip text="Photo" arrow>
              <UButton
                variant="ghost"
                size="sm"
                color="neutral"
                icon="lucide:image"
              />
            </UTooltip>
            <UTooltip text="Video" arrow>
              <UButton
                variant="ghost"
                color="neutral"
                icon="lucide:square-play"
                size="sm"
              />
            </UTooltip>
            <UTooltip text="Files" arrow>
              <UButton
                size="sm"
                variant="ghost"
                color="neutral"
                icon="lucide:paperclip"
              />
            </UTooltip>
            <UTooltip text="Feeling" arrow>
              <UButton
                size="sm"
                variant="ghost"
                color="neutral"
                icon="lucide:smile"
              />
            </UTooltip>
          </div>
        </div>
        <div class="flex md:col-span-1 justify-end gap-2">
          <UButton
            variant="soft"
            color="neutral"
            size="sm"
            @click="
              () => {
                showCommentTool = false;
              }
            "
          >
            Cancel
          </UButton>
          <UButton variant="solid" color="primary" size="sm"> Comment </UButton>
        </div>
      </div>
    </BaseTransitionWrapper>
  </UCard>
</template>
