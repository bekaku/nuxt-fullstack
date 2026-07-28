<script setup lang="ts" generic="T">
import type { TableColumn, TableRow } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";
import { upperFirst } from "scule";
import { SearchOperation } from "~/libs/constants";
import {
  ICrudListHeaderOptionSearchType,
  type ICrudAction,
  type ICrudFilterOptions,
  type IPagination,
  type ISort,
  type ISortModeType,
  type ITextValue,
} from "~/types/common";
import type { RBACProps } from "~/types/props";

const {
  showPaging = true,
  loading = false,
  firstLoaded = false,
  showCheckbox = true,
  showNewBtn = true,
  showSearchBtn = true,
  showKewordSearch = false,
  showFilter = true,
  list,
  crudName,
  viewPermission,
  addPermission,
  editPermission,
  deletePermission,
  byPassPermission = false,
  showActions = true,
  columns,
} = defineProps<{
  crudName?: string;
  title?: string;
  description?: string;
  icon?: string;
  list: T[];
  columns: TableColumn<T>[];
  viewPermission?: RBACProps;
  addPermission?: RBACProps;
  editPermission?: RBACProps;
  deletePermission?: RBACProps;
  byPassPermission?: boolean;
  pages?: IPagination;
  firstLoaded?: boolean;
  loading?: boolean;
  showPaging?: boolean;
  showActions?: boolean;
  showCheckbox?: boolean;
  showNewBtn?: boolean;
  showSearchBtn?: boolean;
  showKewordSearch?: boolean;
  showFilter?: boolean;
  sticky?: boolean;
  tableClass?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}>();

const emit = defineEmits<{
  "on-page-no-change": [v: number | undefined];
  "on-items-perpage-change": [v: number | undefined];
  "on-sort": [column: string, mode: ISortModeType];
  "on-item-copy": [index: number];
  "on-item-click": [index: number, type: ICrudAction];
  "on-item-delete": [indexOrIds: number | number[]];
  "on-new-form": [];
  "on-reload": [];
  "on-search": [q: string];
  "on-keyword-search": [q: string];
  "on-col-click": [event: any, index: number, headerOption: any, colValue: any];
}>();
const { t } = useLang();

const paging = defineModel<IPagination | undefined>("paging", {
  default: undefined,
});
const sorts = defineModel<ISort[] | undefined>("sorts", {
  default: undefined,
});
const sortingColumns = defineModel<any[]>("sorting-columns", {
  default: () => [],
});

const filterItems = ref<ICrudFilterOptions[]>([]);
const operationOptions = [
  { label: t("base.match"), value: SearchOperation.MATCH },
  { label: t("base.equa"), value: SearchOperation.EQUA },
  { label: t("base.notEqua"), value: SearchOperation.NOT_EQUA },
  { label: t("base.greaterThan"), value: SearchOperation.GREATER_THAN },
  {
    label: t("base.greaterThanEqua"),
    value: SearchOperation.GREATER_THAN_EQUA,
  },
  { label: t("base.lessThan"), value: SearchOperation.LESS_THAN },
  { label: t("base.lessThanEqua"), value: SearchOperation.LESS_THAN_EQUA },
];

// const operationOptions = [
//   { label: ":", value: ":" },
//   { label: ">", value: ">" },
//   { label: ">=", value: ">=" },
//   { label: "<", value: "<" },
//   { label: "<=", value: "<=" },
//   { label: "=", value: "=" },
//   { label: "!=", value: "!=" },
// ];
const showSearch = ref(false);
const confirm = useConfirmDialog();
const { writeToClipboard, inputSanitizeHtml } = useBase();
const UCheckbox = resolveComponent("UCheckbox");
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const { hasPermission } = useRbac();
const table = useTemplateRef<any>("table");
const rowSelection = ref<Record<string, boolean>>({});
const filterText = ref("");
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

const onSort = (column: string | undefined, mode: ISortModeType) => {
  if (column) {
    emit("on-sort", column, mode);
  }
};
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
        console.log("View row", row.index);
        if (row.index == undefined) {
          return;
        }
        emit('on-item-click', row.index, 'view');
      },
    });
  }
  if (isHaveEditPermission.value) {
    items.push({
      label: t("base.edit"),
      icon: "lucide:pencil",
      onSelect() {
          console.log("Edit row", row.index);
        if (row.index == undefined) {
          return;
        }
        emit('on-item-click', row.index, 'edit');
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

const getColumns = computed(() => {
  if (!columns) {
    return [];
  }
  // const columnItems = [...columns];
  const columnItems = columns.map((col) => {
    const colDef = col as Record<string, any>;
    const colId = colDef.id || colDef.accessorKey;

    const options = colDef.meta?.options as ICrudFilterOptions | undefined;
    const isSortable = options?.sortable === true;
    // const isSortable = sortingColumns.value.some(
    //   (sortCol) => sortCol.id === colId,
    // );

    if (isSortable) {
      const targetSortColumn = options?.sortColunm || colId;
      const originalHeader =
        typeof colDef.header === "string"
          ? colDef.header
          : colDef.accessorKey || colDef.id;

      return {
        ...col,
        id: colId,
        enableSorting: false,
        header: (/*{ column }: any*/) => {
          // const currentSort = sorts.value?.find((s) => s.column === colId);
          const currentSort = sorts.value?.find(
            (s) => s.column === targetSortColumn,
          );
          const currentMode = currentSort ? currentSort.mode : undefined;
          return h(UButton, {
            color: "neutral",
            variant: "ghost",
            label: originalHeader,
            icon: currentMode
              ? currentMode === "asc"
                ? "i-lucide-arrow-up-narrow-wide"
                : "i-lucide-arrow-down-wide-narrow"
              : "i-lucide-arrow-up-down",
            class: "-mx-2.5",
            onClick: () => {
              // Pulling meta from the original colDef.
              //const meta = colDef.meta;
              // Example of how to use the options we've included in the meta tag.
              // if (meta?.options) {
              //   console.log("options:", meta.options);
              // }
              const nextMode = currentMode === "asc" ? "desc" : "asc";
              // column.toggleSorting(column.getIsSorted() === "asc")
              onSort(colId, nextMode);
            },
          });
        },
      };
    }

    return col;
  });

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

const onPageChange = async (v: number | undefined) => {
  if (v && paging.value) {
    paging.value.current = v;
    emit("on-page-no-change", v);
  }
};
const onPerPageChange = async (v: number | undefined) => {
  if (v && paging.value) {
    paging.value.itemsPerPage = v;
    emit("on-items-perpage-change", v);
  }
};
const onKeywordSearch = () => {
  if (!filterText.value || filterText.value?.trim().length == 0) {
    return;
  }
  // if (filterText.value?.trim().length >= SearchMinCharactor) {
  emit("on-keyword-search", inputSanitizeHtml(filterText.value.trim()));
  // }
};

const handleSearch = () => {
  const queryParts: string[] = [];

  filterItems.value.forEach((item) => {
    if (
      item.searchModel === undefined ||
      item.searchModel === null ||
      item.searchModel === ""
    ) {
      return;
    }

    console.log("item", item);

    const col = item.searchColunm;
    const op = item.searchOperation || ":"; // default operation

    let val = item.searchModel;
    if (item.searchType === ICrudListHeaderOptionSearchType.BOOLEAN) {
    }
    if (Array.isArray(val)) {
      val = val.join(",");
    }

    // สร้าง String ${colunm}${operation}${val}
    queryParts.push(`${col}${op}${val}`);
  });

  const queryString = queryParts.join("&");

  console.log("Generated Query:", queryString, queryParts);

  emit("on-search", queryString);
};

const clearFilters = () => {
  filterItems.value.forEach((item) => {
    item.searchModel = undefined;
  });
  handleSearch();
};
const onSelect = (e: Event, row: TableRow<T>) => {
  console.log("onSelect", row);
  /* If you decide to also select the column you can do this  */
  row.toggleSelected(!row.getIsSelected());
};

watch(
  () => columns as any,
  (newColumns) => {
    if (newColumns && newColumns.length > 0 && filterItems.value.length === 0) {
      filterItems.value = newColumns
        .filter(
          (col: any) =>
            col.meta?.options && col.meta.options?.searchable === true,
        )
        .map((col: any) => ({
          ...col.meta.options,
          searchColunm:
            col.meta.options.searchColunm || col.accessorKey || col.id,
          searchModel: col.meta.options.searchModel || "",
          searchOperation:
            col.meta.options.searchType ===
            ICrudListHeaderOptionSearchType.BOOLEAN
              ? "="
              : col.meta.options.searchOperation || ":",
          label:
            typeof col.header === "string"
              ? col.header
              : col.accessorKey || col.id,
        }));
    }
  },
  { immediate: true },
);
</script>
<template>
  <div>
    <UCard :ui="{ header: 'p-2' }">
      <template #header>
        <slot name="header">
          <div class="flex flex-col">
            <BaseItem :separator="false">
              <template v-if="icon" #start>
                <UAvatar :icon="icon" />
              </template>
              <div v-if="title" class="text-xl font-bold">
                {{ title }}
              </div>
              <div v-if="description" class="text-sm text-muted">
                {{ description }}
              </div>
            </BaseItem>
          </div>
        </slot>
      </template>
      <div class="flex flex-wrap items-center justify-between gap-1.5 pb-4">
        <slot name="table-header">
          <div>
            <slot name="table-header-start">
              <UForm
                v-if="showKewordSearch && !showSearch"
                class="space-y-4"
                @submit="onKeywordSearch"
              >
                <div class="flex gap-2 items-center">
                  <UTooltip :text="$t('base.searchHelp3')">
                    <UInput
                      v-model="filterText"
                      class="max-w-lg"
                      icon="i-lucide-search"
                      :placeholder="$t('base.searchHelp3')"
                    />
                  </UTooltip>
                  <UButton
                    v-if="filterText"
                    icon="lucide:eraser"
                    variant="outline"
                    @click="
                      () => {
                        clearFilters();
                        filterText = '';
                      }
                    "
                    >{{ $t("base.clear") }}</UButton
                  >
                </div>
              </UForm>
            </slot>
          </div>

          <div class="flex flex-wrap items-center gap-1.5 my-4 md:my-0">
            <slot name="table-header-end">
              <UTooltip v-if="showSearchBtn" :text="$t('base.search')">
                <UButton
                  icon="i-lucide-search"
                  variant="ghost"
                  class="rounded-full"
                  @click="showSearch = !showSearch"
                />
              </UTooltip>
              <UButton
                v-if="getSelectedRowCount > 0"
                :label="$t('base.delete')"
                color="error"
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
                icon="lucide:plus"
                color="primary"
                @click="$emit('on-new-form')"
              />
              <UDropdownMenu
                v-if="showFilter"
                :items="
                  table?.tableApi
                    ?.getAllColumns()
                    .filter((column: any) => column.getCanHide())
                    .map((column: any) => ({
                      label:
                        typeof column.columnDef.header === 'string'
                          ? column.columnDef.header
                          : upperFirst(column.id),
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
                  trailing-icon="i-lucide-settings-2"
                />
              </UDropdownMenu>
            </slot>
          </div>
        </slot>
      </div>
      <div v-if="showSearch" class="flex flex-col flex-wrap gap-2 pb-4">
        <div
          class="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg mb-4 border border-default/80"
        >
          <div class="text-xl font-bold pb-2">{{ $t("base.search") }}</div>
          <slot name="search-inner-top" />
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <div
              v-for="item in filterItems"
              :key="item.searchColunm"
              class="flex flex-col gap-1.5"
            >
              <label
                class="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                {{ item.label || item.searchColunm }}
              </label>

              <div class="flex gap-2 items-center">
                <USelect
                  v-model="item.searchOperation"
                  :items="operationOptions"
                  :disabled="
                    item.searchOperationReadonly ||
                    item.searchType === ICrudListHeaderOptionSearchType.BOOLEAN
                  "
                  value-key="value"
                  class="min-w-28.75 max-w-41.25 shrink-0"
                />

                <UInput
                  v-if="
                    item.searchType === ICrudListHeaderOptionSearchType.TEXT
                  "
                  v-model="item.searchModel"
                  type="text"
                  :placeholder="`${$t('base.search')}...`"
                  class="flex-1"
                />

                <!-- NUMBER -->
                <UInput
                  v-else-if="
                    item.searchType === ICrudListHeaderOptionSearchType.NUMBER
                  "
                  v-model="item.searchModel"
                  type="number"
                  class="flex-1"
                />

                <!-- BOOLEAN -->
                <USwitch
                  v-else-if="
                    item.searchType === ICrudListHeaderOptionSearchType.BOOLEAN
                  "
                  v-model="item.searchModel"
                />

                <!-- DATE -->
                <UInput
                  v-else-if="
                    item.searchType === ICrudListHeaderOptionSearchType.DATE
                  "
                  v-model="item.searchModel"
                  type="date"
                  class="flex-1"
                />

                <!-- DATETIME -->
                <UInput
                  v-else-if="
                    item.searchType === ICrudListHeaderOptionSearchType.DATETIME
                  "
                  v-model="item.searchModel"
                  type="datetime-local"
                  class="flex-1"
                />

                <!-- OPTIONS -->
                <USelectMenu
                  v-else-if="
                    item.searchType === ICrudListHeaderOptionSearchType.OPTIONS
                  "
                  v-model="item.searchModel"
                  :items="item.selectOption?.items as any || []"
                  :multiple="item.selectOption?.multiple"
                  value-attribute="value"
                  option-attribute="label"
                  :placeholder="`${$t('base.choose')}...`"
                  class="flex-1"
                />
              </div>
            </div>
            <slot name="search-inner" />
          </div>
          <slot name="search-inner-bottom" />
          <div class="mt-4 flex justify-end gap-2">
            <slot name="search-actions-start" />
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              @click="showSearch = !showSearch"
              >{{ $t("base.close") }}</UButton
            >
            <UButton
              icon="lucide:eraser"
              variant="outline"
              @click="clearFilters"
              >{{ $t("base.clear") }}</UButton
            >

            <UButton
              color="primary"
              icon="i-lucide-search"
              @click="handleSearch"
              >{{ $t("base.search") }}
            </UButton>
            <slot name="search-actions-end" />
          </div>
        </div>
      </div>
      <UTable
        ref="table"
        :data="list"
        :columns="getColumns"
        v-model:row-selection="rowSelection"
        v-model:sorting="sortingColumns"
        :loading="loading"
        :sticky
        :class="['flex-1', tableClass]"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: 'mb-4 [&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-3 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default',
          separator: 'h-0',
        }"
        @select="onSelect"
      >
        <template #empty>
          <UEmpty
            v-if="loading || !firstLoaded"
            :title="$t('base.pleaseWait')"
            :description="$t('base.pleaseWaitWhileLoading2')"
            loading
          />
          <UEmpty
            v-else
            :ui="{ avatar: 'size-12' }"
            icon="lucide:inbox"
            :title="emptyTitle || $t('error.dataNotfound')"
            :description="emptyDescription || $t('helper.emptyDescription')"
            :actions="
              isHaveAddPermission && showNewBtn
                ? [
                    {
                      icon: 'lucide:plus',
                      label: $t('base.addNew'),
                      variant: 'solid',
                      color: 'primary',
                      onClick: () => emit('on-new-form'),
                    },
                    {
                      icon: 'lucide:refresh-cw',
                      label: $t('base.reload'),
                      color: 'neutral',
                      variant: 'subtle',
                      onClick: () => emit('on-reload'),
                    },
                  ]
                : [
                    {
                      icon: 'lucide:refresh-cw',
                      label: $t('base.reload'),
                      color: 'neutral',
                      variant: 'subtle',
                      onClick: () => emit('on-reload'),
                    },
                  ]
            "
          />
        </template>

        <template
          v-for="(_, slotName) in $slots"
          :key="slotName"
          #[slotName]="slotProps"
        >
          <slot :name="slotName" v-bind="slotProps"></slot>
        </template>
      </UTable>

      <slot name="paging">
        <BasePaging
          v-if="showPaging && paging && paging.totalPages > 0"
          class="mt-4 px-4"
          v-model="paging"
          @update-current="onPageChange"
          @update-perpage="onPerPageChange"
        >
          <template #start>
            <div class="text-xs text-muted">
              {{
                $t("base.selectdItemsOf", {
                  count: getSelectedRowCount,
                  selected: getSelectedRowCount,
                  total: paging.totalElements,
                })
              }}
            </div>
          </template>
        </BasePaging>
      </slot>
    </UCard>
  </div>
</template>
