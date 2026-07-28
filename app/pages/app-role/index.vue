<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  ICrudListHeaderOptionSearchType,
  type ICrudFilterOptions,
} from "~/types/common";
import type { AppRole, Permission } from "~/types/models";

definePageMeta({
  pageName: 'model.role.table',
  requiresPermission: ["app_role_list"],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
const UAvatar = resolveComponent("UAvatar");
const UButton = resolveComponent("UButton");
const UBadge = resolveComponent("UBadge");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const UCheckbox = resolveComponent("UCheckbox");
const { t } = useLang();
const toast = useToast();
const {
  dataList,
  loading,
  firstLoaded,
  pages,
  sorts,
  onPageChange,
  onPerPageChange,
  onSort,
  onReload,
  onSearch,
  onItemDelete,
  onNewForm,
  onItemClick,
  onItemCopy,
  crudName,
  onKeywordSearch,
  headers,
} = useCrudList<AppRole>({
  crudName: "AppRole", //PascalCase only eg: User, AppRole
  apiEndpoint: "/api/app-role", //KebabCase only eg: app-role
  headers: [],
  itemsPerPage: 10,
  defaultSorts: [
    {
      column: "name",
      mode: "asc",
    },
  ],
});
const columns = ref<TableColumn<AppRole>[]>([
  {
    accessorKey: "name",
    header: t("model.role.name"),
    cell: ({ row }) => row.getValue("name"),
    meta: {
      options: {
        sortable: true,
        searchable: true,
        searchType: ICrudListHeaderOptionSearchType.TEXT,
        searchOperation: ":",
        searchModel: "",
      } as ICrudFilterOptions,
    } as any,
  },
  {
    accessorKey: "active",
    header: t("base.enable"),
    cell: ({ row }) => {
      const t = row.getValue("active");
      return h(
        UButton,
        {
          variant: "ghost",
          color: t ? "primary" : "neutral",
          icon: t ? "lucide:circle-check" : "lucide:circle-x",
          size: "xl",
          onClick: () => {
            onCellTypeClick(row.index);
          },
        },
        () => t,
      );
    },
    meta: {
      options: {
        sortable: true,
        searchable: true,
        searchType: ICrudListHeaderOptionSearchType.BOOLEAN,
        searchOperation: "=",
        searchModel: "",
      } as ICrudFilterOptions,
    } as any,
  },
]);

const onCellTypeClick = (index: number) => {
  let rowItem = dataList.value[index];
  console.log("rowItem", rowItem);
  if (rowItem) {
    rowItem.active = !rowItem.active;
  }
};
</script>

<template>
  <BaseDashboardPanel id="app-role-index" :title="$t('model.role.table')">
    <BaseTable
      icon="lucide:users-round"
      :title="$t('model.role.table')"
      :crud-name="crudName"
      :list="dataList"
      :show-checkbox="true"
      :loading="loading"
      :first-loaded="firstLoaded"
      :columns="columns"
      v-model:sorts="sorts"
      v-model:paging="pages"
      @on-item-delete="onItemDelete"
      @on-page-no-change="onPageChange"
      @on-items-perpage-change="onPerPageChange"
      @on-new-form="onNewForm"
      @on-item-click="onItemClick"
      @on-item-copy="onItemCopy"
      @on-sort="onSort"
      @on-reload="onReload"
      @on-keyword-search="onKeywordSearch"
      @on-search="onSearch"
    >
    </BaseTable>
  </BaseDashboardPanel>
</template>
