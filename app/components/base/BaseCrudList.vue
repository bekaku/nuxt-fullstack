<script setup lang="ts" generic="T">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";
import { upperFirst } from "scule";
import type {
  ICrudAction,
  IPagination,
  ISort,
  ISortModeType,
} from "~/types/common";
import type { RBACProps } from "~/types/props";

const {
  showPaging = true,
  loading = false,
  firstLoaded = false,
  showCheckbox = true,
  showNewBtn = true,
  showSearchBtn = true,
  showSearchTextBox = false,
  showThreeDot = true,
  showFilter = true,
  showSort = true,
  pages,
  list,
  crudName,
  viewPermission,
  addPermission,
  editPermission,
  deletePermission,
  byPassPermission = false,
  rowClickable = true,
  showActions = true,
  columns = [],
} = defineProps<{
  crudName?: string;
  title?: string;
  icon?: string;
  list: T[];
  columns?: TableColumn<T>[];
  viewPermission?: RBACProps;
  addPermission?: RBACProps;
  editPermission?: RBACProps;
  deletePermission?: RBACProps;
  byPassPermission?: boolean;
  sorts?: ISort[];
  pages?: IPagination;
  firstLoaded?: boolean;
  loading?: boolean;
  showPaging?: boolean;
  showActions?: boolean;
  showCheckbox?: boolean;
  showNewBtn?: boolean;
  showSearchBtn?: boolean;
  showSearchTextBox?: boolean;
  showThreeDot?: boolean;
  showFilter?: boolean;
  showSort?: boolean;
  rowClickable?: boolean;
}>();

const emit = defineEmits<{
  "on-page-no-change": [v: number | undefined];
  "on-items-perpage-change": [v: number | undefined];
  "update-search": [v: any];
  "on-sort": [column: string | undefined];
  "on-sort-mode": [mode: ISortModeType];
  "on-item-copy": [index: number];
  "on-item-click": [index: number, type: ICrudAction];
  "on-item-delete": [indexOrIds: number | number[]];
  "on-new-form": [];
  "on-reload": [];
  "on-advance-search": [q: string];
  "on-keyword-search": [q: string];
  "on-col-click": [event: any, index: number, headerOption: any, colValue: any];
}>();
const { t } = useLang();
const confirm = useConfirmDialog();
const { writeToClipboard } = useBase();
const UCheckbox = resolveComponent("UCheckbox");
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const { hasPermission } = useRbac();
const table = useTemplateRef<any>("table");
const rowSelection = ref({});

const checkBoxColumn: TableColumn<T> = {
  id: "select",
  header: ({ table }) =>
    h(UCheckbox, {
      modelValue: table.getIsSomePageRowsSelected()
        ? "indeterminate"
        : table.getIsAllPageRowsSelected(),
      "onUpdate:modelValue": (value: boolean | "indeterminate") =>
        table.toggleAllPageRowsSelected(!!value),
      ariaLabel: "Select all",
    }),
  cell: ({ row }) =>
    h(UCheckbox, {
      modelValue: row.getIsSelected(),
      "onUpdate:modelValue": (value: boolean | "indeterminate") =>
        row.toggleSelected(!!value),
      ariaLabel: "Select row",
    }),
};
const isHaveViewPermission = computed(() => {
  if (byPassPermission) {
    return true;
  }
  return viewPermission &&
    viewPermission?.permissions &&
    viewPermission?.permissions?.length > 0
    ? hasPermission(viewPermission)
    : crudName
      ? hasPermission({ permissions: [`${pascalToSnake(crudName)}_view`] })
      : true;
});
const isHaveAddPermission = computed(() => {
  if (byPassPermission) {
    return true;
  }
  return addPermission &&
    addPermission?.permissions &&
    addPermission?.permissions?.length > 0
    ? hasPermission(addPermission)
    : crudName
      ? hasPermission({ permissions: [`${pascalToSnake(crudName)}_add`] })
      : true;
});
const isHaveEditPermission = computed(() => {
  if (byPassPermission) {
    return true;
  }
  return editPermission &&
    editPermission?.permissions &&
    editPermission?.permissions?.length > 0
    ? hasPermission(editPermission)
    : crudName
      ? hasPermission({ permissions: [`${pascalToSnake(crudName)}_edit`] })
      : true;
});
const isHaveDeletePermission = computed(() => {
  if (byPassPermission) {
    return true;
  }
  return deletePermission &&
    deletePermission?.permissions &&
    deletePermission?.permissions?.length > 0
    ? hasPermission(deletePermission)
    : crudName
      ? hasPermission({ permissions: [`${pascalToSnake(crudName)}_delete`] })
      : true;
});
const isHaveManagePermission = computed(() => {
  if (byPassPermission) {
    return true;
  }

  return (
    isHaveDeletePermission.value ||
    isHaveEditPermission.value ||
    isHaveAddPermission.value
  );
});

const isHAveAnyPermission = computed(() => {
  return (
    byPassPermission ||
    isHaveViewPermission.value ||
    isHaveAddPermission.value ||
    isHaveEditPermission.value ||
    isHaveDeletePermission.value
  );
});
const getRowActionItems = (row: Row<any>) => {
  const items: any = [
    {
      type: "label",
      label: t("base.tool"),
    },
    {
      label: t("base.copyID"),
      onSelect() {
        if (!row.original.id) {
          return;
        }
        writeToClipboard(row.original.id.toString());
        console.log("Copied to clipboard");
      },
    },
    {
      type: "separator",
    },
  ];

  if (isHaveViewPermission.value) {
    items.push({
      label: t("base.view"),
      icon: "lucide:eye",
      onSelect() {
        console.log("View row");
      },
    });
  }
  if (isHaveEditPermission.value) {
    items.push({
      label: t("base.edit"),
      icon: "lucide:pencil",
      onSelect() {
        console.log("Edit row");
      },
    });
  }
  if (isHaveAddPermission.value) {
    items.push({
      label: t("base.copy"),
      icon: "lucide:copy",
      onSelect() {
        console.log("Copy row");
      },
    });
  }
  if (isHaveDeletePermission.value) {
    items.push({ type: "separator" });

    items.push({
      label: t("base.delete"),
      icon: "lucide:trash",
      color: "error",
      onSelect() {
        row.index;
        if (row.index == undefined) {
          return;
        }
        onDelete(row.index);
        console.log("Delete row index:", row.index);
      },
    });
  }
  return items;
};
const getRowSelectedIndexItems = computed(() => {
  if (!rowSelection.value) {
    return [];
  }
  return Object.keys(rowSelection.value).map(Number);
});
const getSelectedRowCount = computed(() => {
  if (
    !table.value ||
    !table.value?.tableApi ||
    !table.value?.tableApi?.getFilteredSelectedRowModel()
  ) {
    return 0;
  }
  return table.value?.tableApi?.getFilteredSelectedRowModel().rows.length || 0;
});

const filter = computed({
  get: (): string => {
    return (
      (table.value?.tableApi?.getColumn("code")?.getFilterValue() as string) ||
      ""
    );
  },
  set: (value: string) => {
    table.value?.tableApi
      ?.getColumn("code")
      ?.setFilterValue(value || undefined);
  },
});

const getColumns = computed(() => {
  if (!columns) {
    return [];
  }
  const columnItems = [...columns];
  if (showCheckbox && showActions) {
    columnItems.unshift(checkBoxColumn);
  }

  if (isHAveAnyPermission.value) {
    columnItems.push({
      id: "actions",
      cell: ({ row }) => {
        return h(
          "div",
          { class: "text-right" },
          h(
            UDropdownMenu,
            {
              content: {
                align: "end",
              },
              items: getRowActionItems(row),
            },
            () =>
              h(UButton, {
                icon: "i-lucide-ellipsis-vertical",
                color: "neutral",
                variant: "ghost",
                class: "ml-auto rounded-full",
              }),
          ),
        );
      },
    });
  }
  return columnItems;
});

const onDeleteSelected = async () => {
  if (
    getRowSelectedIndexItems.value &&
    getRowSelectedIndexItems.value.length > 0
  ) {
    onDelete(getRowSelectedIndexItems.value, getSelectedRowCount.value);
  }
};
const onDelete = async (
  index: number | number[],
  deleteCountount: number = 1,
) => {
  if (index == undefined) {
    return;
  }
  const conf = await confirm({
    title: !deleteCountount
      ? t("base.deleteConfirmHelp")
      : t("base.deleteCountConfirm", { count: deleteCountount }),
    description: t("base.deleteConfirmHelp"),
    confirmButton: {
      label: t("base.delete"),
      color: "error",
      icon: "lucide:trash",
    },
  });
  if (conf) {
    emit("on-item-delete", index);
  }
};
</script>
<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-1.5 pb-4">
      <UInput
        v-model="filter"
        class="max-w-sm"
        icon="i-lucide-search"
        placeholder="Filter emails..."
      />

      <div class="flex flex-wrap items-center gap-1.5">
        <UButton
          v-if="getSelectedRowCount > 0"
          :label="$t('base.delete')"
          color="error"
          variant="subtle"
          icon="i-lucide-trash"
          @click="onDeleteSelected"
        >
          <template #trailing>
            <UKbd>
              {{ getSelectedRowCount }}
            </UKbd>
          </template>
        </UButton>
        <UButton
          v-if="isHaveAddPermission && showNewBtn"
          :label="$t('base.addNew')"
          color="primary"
          icon="lucide:plus"
        />
        <UDropdownMenu
          v-if="showFilter"
          :items="
            table?.tableApi
              ?.getAllColumns()
              .filter((column: any) => column.getCanHide())
              .map((column: any) => ({
                label: upperFirst(column.id),
                type: 'checkbox' as const,
                checked: column.getIsVisible(),
                onUpdateChecked(checked: boolean) {
                  table?.tableApi
                    ?.getColumn(column.id)
                    ?.toggleVisibility(!!checked);
                },
                onSelect(e?: Event) {
                  e?.preventDefault();
                },
              }))
          "
          :content="{ align: 'end' }"
        >
          <UButton
            :label="$t('base.filterField')"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-settings-2"
          />
        </UDropdownMenu>
      </div>
    </div>
    <UTable
      ref="table"
      :data="list"
      :columns="getColumns"
      v-model:row-selection="rowSelection"
      :loading="loading"
      class="flex-1"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
        separator: 'h-0',
      }"
    />

    <div
      class="flex items-center justify-between gap-3 border-t border-default pt-4 mt-auto"
    >
      <div class="text-sm text-muted">
        {{ getSelectedRowCount }} of
        {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s)
        selected.
      </div>

      <div class="flex items-center gap-1.5">
        <UPagination
          :default-page="
            (table?.tableApi?.getState().pagination.pageIndex || 0) + 1
          "
          :items-per-page="table?.tableApi?.getState().pagination.pageSize"
          :total="table?.tableApi?.getFilteredRowModel().rows.length"
          @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
        />
      </div>
    </div>
  </div>
</template>
