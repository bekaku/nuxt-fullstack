<script setup lang="ts">
import type { SortableEvent } from "vue-draggable-plus";
import { VueDraggable } from "vue-draggable-plus";
useSeoMeta({
  title: "Darg and Drop",
});
const { isMobile } = useDevice();
// const drgaGroup = 'people';
const listHeight = "65vh";
const draging = ref(false);
const draging2= ref(false);
const todoItems = ref<any[]>([
  {
    id: 1,
    task: "Task 1",
    description: "Analyze the new requirements gathered from the customer.",
    chips: ["Meeting"],
    avatar: "https://cdn.quasar.dev/img/avatar1.jpg",
  },
  {
    id: 2,
    task: "Task 10",
    description: "Show the retrieved data from the server in grid control.",
    chips: ["Database", "SQL"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 3,
    task: "Task 3",
    description:
      "Arrange a web meeting with the customer to get new requirements.",
    chips: ["Meeting"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 4,
    task: "Task 20",
    description: "Enhance editing functionality.",
    chips: ["Editting"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 5,
    task: "Task 22",
    description: "Arrange web meeting with the customer to show editing demo.",
    chips: ["Editting", "Meeting"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);
const inProgressItems = ref<any[]>([
  {
    id: 6,
    task: "Task 2",
    description: "Improve application performance",
    chips: ["Improvment"],
    avatar: "https://cdn.quasar.dev/img/avatar4.jpg",
  },
  {
    id: 7,
    task: "Task 4",
    description: "Fix the issues reported in the IE browser.",
    chips: ["IE"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 8,
    task: "Task 11",
    description: "Fix cannot open user’s default database SQL error.",
    chips: ["Database", "Sql2020"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 9,
    task: "Task 20",
    description: "Enhance editing functionality.",
    chips: ["Editting"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 10,
    task: "Task 21",
    description: "Improve the performance of the editing functionality.",
    chips: ["Performance"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);
const testingItems = ref<any[]>([
  {
    id: 11,
    task: "Task 24",
    description: "Fix the issues reported by the customer.",
    chips: ["Customer"],
    avatar: "https://cdn.quasar.dev/img/avatar4.jpg",
  },
  {
    id: 12,
    task: "Task 25",
    description: "Fix the issues reported in Safari browser.",
    chips: ["Fix", "Safari"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 13,
    task: "Task 26",
    description: "Check Login page validation.",
    chips: ["Testing"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 14,
    task: "Task 27",
    description: "Fix the issues reported in data binding.",
    chips: ["Editting", "Test"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
  {
    id: 15,
    task: "Task 29",
    description: "Fix editing issues reported in Firefox.",
    chips: ["Fix"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);
const doneItems = ref<any[]>([
  {
    id: 16,
    task: "Task 8",
    description: "Test the application in the IE browser.",
    chips: ["REview", "IE"],
    avatar: "https://cdn.quasar.dev/img/avatar4.jpg",
  },
  {
    id: 17,
    task: "Task 13",
    description: "Analyze SQL server 2008 connection.",
    chips: ["Analyze"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 18,
    task: "Task 16",
    description: "Stored procedure for initial data binding of the grid.",
    chips: ["Databinding"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);
const deployItems = ref<any[]>([
  {
    id: 19,
    task: "Task 19",
    description: "Test the application in the IE browser.",
    chips: ["REview", "IE"],
    avatar: "https://cdn.quasar.dev/img/avatar4.jpg",
  },
  {
    id: 20,
    task: "Task 20",
    description: "Analyze SQL server 2008 connection.",
    chips: ["Analyze"],
    avatar: "https://cdn.quasar.dev/img/avatar2.jpg",
  },
  {
    id: 21,
    task: "Task 21",
    description: "Stored procedure for initial data binding of the grid.",
    chips: ["Databinding"],
    avatar: "https://cdn.quasar.dev/img/avatar3.jpg",
  },
]);


const log = (ctx: any) => {
  console.log("log", ctx);
};
const onStartDrag2 = (event: SortableEvent) => {
  draging2.value = true;
};
const onEndDrag2 = (event: SortableEvent) => {
  draging2.value = false;
};
const onDragStart = (event: any) => {
  draging.value = true;
  console.log("event", event);
};

const onDragEnd = (event: any) => {
  console.log("event", event);
  draging.value = false;
};
</script>

<template>
  <BaseDashboardPanel id="example-drag-drop" title="Darg and Drop">
    <UScrollArea
      orientation="horizontal"
      class="w-full data-[orientation=vertical]:h-96 p-4"
    >
      <div class="flex flex-none gap-4">
        <!-- Todo -->
        <div
          class="w-[350px] min-h-full bg-neutral-100 dark:bg-neutral-700 border border-default rounded-md"
          :class="{ 'border-primary border-dashed': draging }"
        >
          <BaseItem
            :separator="true"
            title="Todo"
            class="bg-white dark:bg-neutral-800 rounded-t-md"
          >
            <template #end>
              <UBadge color="neutral" :label="todoItems.length" />
            </template>
          </BaseItem>
          <UScrollArea orientation="vertical" class="w-full h-[75vh]">
            <VueDraggable
              v-model="todoItems"
              :animation="250"
              group="my-tasks"
              class="drop-zone px-2"
              @start="onDragStart"
              @end="onDragEnd"
            >
              <div
                v-for="(element, index) in todoItems"
                :key="element.id"
                class="my-4 bg-white dark:bg-neutral-800 p-2 rounded-md"
              >
                <div class="flex flex-col gap-2">
                  <div class="text-md font-bold">{{ element.task }}</div>
                  <div>{{ element.description }}</div>
                  <div class="flex gap-2 pt-2">
                    <UBadge
                      v-for="(chip, chipIndex) in element.chips"
                      :key="`${index}-chip-${chipIndex}-${chip}`"
                    >
                      {{ chip }}
                    </UBadge>
                  </div>
                </div>
                <BaseItem :separator="false">
                  <template #start>
                    <Icon name="lucide:file" class="text-warning" />
                  </template>
                  <template #end>
                    <UAvatar :src="element.avatar" loading="lazy" />
                  </template>
                </BaseItem>
              </div>
            </VueDraggable>
          </UScrollArea>
        </div>
        <!-- In Progress -->
        <div
          class="w-[350px] min-h-full bg-neutral-100 dark:bg-neutral-700 border border-default rounded-md"
          :class="{ 'border-primary border-dashed': draging }"
        >
          <BaseItem
            :separator="true"
            title="In Progress"
            class="bg-white dark:bg-neutral-800 rounded-t-md"
          >
            <template #end>
              <UBadge color="neutral" :label="inProgressItems.length" />
            </template>
          </BaseItem>
          <UScrollArea orientation="vertical" class="w-full h-[75vh]">
            <VueDraggable
              v-model="inProgressItems"
              :animation="250"
              group="my-tasks"
              class="drop-zone px-2"
              @start="onDragStart"
              @end="onDragEnd"
            >
              <div
                v-for="(element, index) in inProgressItems"
                :key="element.id"
                class="my-4 bg-white dark:bg-neutral-800 p-2 rounded-md"
              >
                <div class="flex flex-col gap-2">
                  <div class="text-md font-bold">{{ element.task }}</div>
                  <div>{{ element.description }}</div>
                  <div class="flex gap-2 pt-2">
                    <UBadge
                      v-for="(chip, chipIndex) in element.chips"
                      :key="`${index}-chip-${chipIndex}-${chip}`"
                    >
                      {{ chip }}
                    </UBadge>
                  </div>
                </div>
                <BaseItem :separator="false">
                  <template #start>
                    <Icon name="lucide:clock" class="text-primary" />
                  </template>
                  <template #end>
                    <UAvatar :src="element.avatar" loading="lazy" />
                  </template>
                </BaseItem>
              </div>
            </VueDraggable>
          </UScrollArea>
        </div>
        <!-- Testing -->
        <div
          class="w-[350px] min-h-full bg-neutral-100 dark:bg-neutral-700 border border-default rounded-md"
          :class="{ 'border-primary border-dashed': draging }"
        >
          <BaseItem
            :separator="true"
            title="Testing"
            class="bg-white dark:bg-neutral-800 rounded-t-md"
          >
            <template #end>
              <UBadge color="neutral" :label="testingItems.length" />
            </template>
          </BaseItem>
          <UScrollArea orientation="vertical" class="w-full h-[75vh]">
            <VueDraggable
              v-model="testingItems"
              :animation="250"
              group="my-tasks"
              class="drop-zone px-2"
              @start="onDragStart"
              @end="onDragEnd"
            >
              <div
                v-for="(element, index) in testingItems"
                :key="element.id"
                class="my-4 bg-white dark:bg-neutral-800 p-2 rounded-md"
              >
                <div class="flex flex-col gap-2">
                  <div class="text-md font-bold">{{ element.task }}</div>
                  <div>{{ element.description }}</div>
                  <div class="flex gap-2 pt-2">
                    <UBadge
                      v-for="(chip, chipIndex) in element.chips"
                      :key="`${index}-chip-${chipIndex}-${chip}`"
                    >
                      {{ chip }}
                    </UBadge>
                  </div>
                </div>
                <BaseItem :separator="false">
                  <template #start>
                    <Icon name="lucide:bug" class="text-error" />
                  </template>
                  <template #end>
                    <UAvatar :src="element.avatar" loading="lazy" />
                  </template>
                </BaseItem>
              </div>
            </VueDraggable>
          </UScrollArea>
        </div>
        <!-- Done -->
        <div
          class="w-[350px] min-h-full bg-neutral-100 dark:bg-neutral-700 border border-default rounded-md"
          :class="{ 'border-primary border-dashed': draging }"
        >
          <BaseItem
            :separator="true"
            title="Done"
            class="bg-white dark:bg-neutral-800 rounded-t-md"
          >
            <template #end>
              <UBadge color="neutral" :label="doneItems.length" />
            </template>
          </BaseItem>
          <UScrollArea orientation="vertical" class="w-full h-[75vh]">
            <VueDraggable
              v-model="doneItems"
              :animation="250"
              group="my-tasks"
              class="drop-zone px-2"
              @start="onDragStart"
              @end="onDragEnd"
            >
              <div
                v-for="(element, index) in doneItems"
                :key="element.id"
                class="my-4 bg-white dark:bg-neutral-800 p-2 rounded-md"
              >
                <div class="flex flex-col gap-2">
                  <div class="text-md font-bold">{{ element.task }}</div>
                  <div>{{ element.description }}</div>
                  <div class="flex gap-2 pt-2">
                    <UBadge
                      v-for="(chip, chipIndex) in element.chips"
                      :key="`${index}-chip-${chipIndex}-${chip}`"
                    >
                      {{ chip }}
                    </UBadge>
                  </div>
                </div>
                <BaseItem :separator="false">
                  <template #start>
                    <Icon name="lucide:check" class="text-success" />
                  </template>
                  <template #end>
                    <UAvatar :src="element.avatar" loading="lazy" />
                  </template>
                </BaseItem>
              </div>
            </VueDraggable>
          </UScrollArea>
        </div>
      </div>
    </UScrollArea>

    <UCard
      title="Draggable Component"
      class="mt-16 w-[350px] min-h-45 rounded-md"
      :ui="{ body: 'p-0! sm:p-0!' }"
       :class="{ 'border border-error border-dashed': draging2 }"
    >
      <UScrollArea orientation="vertical" class="w-full h-[75vh]">
        <BaseDragable
          v-model="deployItems"
          group="deploy-group"
          label-key="task"
          value-key="id"
          @on-drag-start="draging2=true"
          @on-drag-end="draging2=false"
        >
          <template #item="{ item, index }">
            <div
              v-if="item"
              class="my-4 mx-2 bg-white dark:bg-neutral-800 p-2 rounded-md"
            >
              <div class="flex flex-col gap-2">
                <div class="text-md font-bold">{{ item.task }}</div>
                <div>{{ item.description }}</div>
                <div class="flex gap-2 pt-2">
                  <UBadge
                    v-for="(chip, chipIndex) in item.chips"
                    :key="`${index}-chip-${chipIndex}-${chip}`"
                  >
                    {{ chip }}
                  </UBadge>
                </div>
              </div>
              <BaseItem :separator="false">
                <template #start>
                  <Icon name="lucide:check" class="text-success" />
                </template>
                <template #end>
                  <UAvatar :src="item.avatar" loading="lazy" />
                </template>
              </BaseItem>
            </div>
          </template>
        </BaseDragable>
      </UScrollArea>
    </UCard>
  </BaseDashboardPanel>
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
