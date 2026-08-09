<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
const {
  group = 'my-group',
  valueKey,
  showAction = false,
  includeIndexAsKey = false,
} = defineProps<{
  group?: string
  labelKey?: string
  valueKey: string
  showAction?: boolean
  includeIndexAsKey?: boolean
}>()
const { t } = useLang()
const modelValue = defineModel<any[]>({ default: () => [] })
const emit = defineEmits<{
  'on-sorting': [payload: any[]]
  'on-drag-start': [payload: any]
  'on-drag-end': [payload: any]
}>()
const setResquest = (): Promise<number[]> => {
  return new Promise((resolve) => {
    const list: number[] = []
    const items = modelValue.value
    if (items && items.length > 0) {
      for (const item of items) {
        if (item && valueKey && item[valueKey]) {
          list.push(item[valueKey])
        }
      }
    }

    resolve(list)
  })
}

const onSorting = async () => {
  const response = await setResquest()
  emit('on-sorting', response)
}
const onDragStart = (event: any) => {
  emit('on-drag-start', event)
}

const onDragEnd = (event: any) => {
  emit('on-drag-end', event)
}
</script>
<template>
  <div>
    <VueDraggable
      v-model="modelValue"
      :animation="250"
      :group="group"
      class="drop-zone bg-transparent"
      @start="onDragStart"
      @end="onDragEnd"
    >
      <template
        v-for="(item, i) in modelValue"
        :key="`${item[valueKey]}${includeIndexAsKey ? '-' + i : ''}`"
      >
        <slot name="item" v-bind="{ item, index: i }" />
      </template>
    </VueDraggable>
    <slot name="action">
      <div v-if="showAction">
        <USeparator />
        <div class="flex w-full justify-center">
          <UButton  @click="onSorting" color="primary" :label="t('base.save')" />
          <UButton  :label="t('base.close')" />
        </div>
      </div>
    </slot>
  </div>
</template>
<style lang="css" scoped>
.drop-zone {
  min-height: 100vh; /* ปรับตัวเลขได้ตามความเหมาะสมของ UI คุณ */
  background-color: var(--color-neutral-100);
  padding-bottom: 10px;
}
.dark {
  .drop-zone {
    background-color: var(--color-neutral-600);
  }
}
</style>
