<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  ICrudListHeaderOptionSearchType,
  type ICrudFilterOptions,
} from "~/types/common";
import type { Permission } from "~/types/models";

definePageMeta({
  pageName: "model_permission",
  requiresPermission: ["permission_list"],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
const UButton = resolveComponent("UButton");
const { t } = useLang();
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
} = useCrudList<Permission>({
  crudName: "Permission", //PascalCase only eg: User, AppRole
  apiEndpoint: "/api/permission", //KebabCase only eg: app-role
  headers: [],
  itemsPerPage: 10,
  defaultSorts: [
    {
      column: "code",
      mode: "asc",
    },
    {
      column: "id",
      mode: "desc",
    },
  ],
});
const columns = ref<TableColumn<Permission>[]>([
  {
    accessorKey: "module",
    header: "Module",
    cell: ({ row }) => row.getValue("module"),
  },
  {
    accessorKey: "code",
    header: t("model_permission_name"),
    cell: ({ row }) => row.getValue("code"),
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
    accessorKey: "description",
    header: t("model_permission_description"),
    cell: ({ row }) => row.getValue("description"),
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
    accessorKey: "operationType",
    header: "Type",
    cell: ({ row }) => {
      const t = row.getValue("operationType");
      if (!t) {
        return null;
      }
      // let type = "";
      // if (t === 1) {
      //   type = "crud";
      // } else if (t === 2) {
      //   type = "report";
      // } else if (t === 3) {
      //   type = "other";
      // }
      return h(
        UButton,
        {
          class: "rounded-full",
          variant: "soft",
          color: "primary",
          size: "xs",
          onClick: () => {
            onCellTypeClick(row.index);
          },
        },
        () => t,
      );
    },
    // meta: {
    //   options: {
    //     searchType: ICrudListHeaderOptionSearchType.OPTIONS,
    //     searchOperation: ":",
    //     searchModel: "",
    //     selectOption:{
    //       items: [
    //         {
    //           label: "crud",
    //           value: 1,
    //         },
    //         {
    //           label: "report",
    //           value: 2,
    //         },
    //         {
    //           label: "other",
    //           value: 3,
    //         },
    //       ]
    //     }
    //   } as ICrudFilterOptions,
    // } as any,
  },
]);

const onCellTypeClick = (index: number) => {
  let rowItem = dataList.value[index];
  console.log("rowItem", rowItem);
};
</script>

<template>
  <BaseDashboardPanel id="permission-index" :title="$t('model_permission')">
    <BaseTable
      icon="lucide:shield-cog-corner"
      :title="$t('model_permission')"
      description="Permission management"
      :crud-name="crudName"
      :list="dataList"
      :show-checkbox="true"
      :loading="loading"
      :first-loaded="firstLoaded"
      :columns="columns"
      v-model:sorts="sorts"
      v-model:paging="pages"
      show-keword-search
      :view-permission="{
        permissions: ['permission_view'],
      }"
      :add-permission="{
        permissions: ['permission_add'],
      }"
      :edit-permission="{
        permissions: ['permission_edit'],
      }"
      :delete-permission="{
        permissions: ['permission_delete'],
      }"
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
      <!--
    accessorKey or id of column can be used as slots everywhere in side BaseCrudList
    <template #actions-cell="{ row }">
     Action slot
    </template>
    <template #code-cell="{ row }">
     Code slot
    </template>
    -->
    </BaseTable>
  </BaseDashboardPanel>
</template>
