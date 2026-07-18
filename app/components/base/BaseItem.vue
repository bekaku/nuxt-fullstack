<script setup lang="ts">
const {
  button = false,
  disabled = false,
  separator = true,
  titleBold = true,
  whitespaceNowrap = false,
  dense = false,
  to,
} = defineProps<{
  title?: string;
  description?: string;
  button?: boolean;
  separator?: boolean;
  disabled?: boolean;
  whitespaceNowrap?: boolean;
  titleBold?: boolean;
  titleClass?: string;
  to?: string;
  id?: string;
  index?: number;
  top?: boolean;
  dense?: boolean;
}>();
const { appNavigateTo } = useBase();

const emit = defineEmits<{
  "on-click": [payload: any];
}>();
const handleClick = (e: any) => {
  if (!disabled) {
    if (to) {
      appNavigateTo(to);
    }
    emit("on-click", e);
  }
};
</script>
<template>
  <div
    v-bind="$attrs"
    class="flex flex-row items-center justify-between pl-2.5 pr-2.5"
    :class="{
      'active:bg-muted cursor-pointer hover:bg-muted': button && !disabled,
      'opacity-50': disabled,
      'border-b border-solid border-muted': separator,
      'items-center': !top,
      'items-start': top,
      'py-2': dense,
      'py-2.5': !dense,
    }"
    :id="id"
    @click="handleClick"
  >
    <div
      class="flex flex-row flex-1 gap-1.5"
      :class="{
        'items-center': !top,
        'items-start': top,
      }"
    >
      <slot v-if="$slots.start" name="start" />

      <div
        class="flex flex-col flex-1 justify-start"
        :class="{
          'pl-2': $slots.start,
          'pr-2': $slots.end,
        }"
      >
        <div
          v-if="title"
          :class="
            cssMerge(
              whitespaceNowrap ? 'whitespace-nowrap' : '',
              titleBold ? 'font-bold' : '',
              titleClass,
            )
          "
        >
          {{ title }}
        </div>

        <div
          v-if="description"
          class="text-sm text-muted mt-0.5"
          :class="{ 'whitespace-nowrap': whitespaceNowrap }"
        >
          {{ description }}
        </div>
        <div v-if="$slots.default">
          <slot />
        </div>
      </div>
    </div>

    <div
      v-if="$slots.end"
      class="flex flex-row justify-end"
      :class="{
        'items-center': !top,
        'items-start': top,
      }"
    >
      <slot name="end" />
    </div>
  </div>
</template>
