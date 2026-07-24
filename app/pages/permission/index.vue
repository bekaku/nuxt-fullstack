<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/table-core";
import type { Permission } from "~/types/models";

definePageMeta({
  requiresPermission: ["permission_list"],
  // breadcrumbs: ExampleHomeBreadcrumb,
  // tabs: TabTest,
});
useSeoMeta({
  title: "Permission page",
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
  onSortColumn,
  onSortMode,
  onReload,
  onAdvanceSearch,
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
function getRowItems(row: Row<Permission>) {
  return [
    {
      type: "label",
      label: t("base.tool"),
    },
    {
      label: "Copy customer ID",
      icon: "i-lucide-copy",
      onSelect() {
        if (!row.original.id) {
          return;
        }
        navigator.clipboard.writeText(row.original.id.toString());
        toast.add({
          title: "Copied to clipboard",
          description: "Customer ID copied to clipboard",
        });
      },
    },
    {
      type: "separator",
    },
    {
      label: "View customer details",
      icon: "i-lucide-list",
    },
    {
      label: "View customer payments",
      icon: "i-lucide-wallet",
    },
    {
      type: "separator",
    },
    {
      label: "Delete customer",
      icon: "i-lucide-trash",
      color: "error",
      onSelect() {
        toast.add({
          title: "Customer deleted",
          description: "The customer has been deleted.",
        });
      },
    },
  ];
}
const columns: TableColumn<Permission>[] = [
  {
    accessorKey: "module",
    header: "Module",
    cell: ({ row }) => row.getValue("module"),
  },
  {
    accessorKey: "code",
    header: t("model_permission_name"),
    cell: ({ row }) => row.getValue("code"),
  },
  {
    accessorKey: "description",
    header: t("model_permission_description"),
    cell: ({ row }) => row.getValue("description"),
  },
  {
    accessorKey: "operationType",
    header: "Type",
    cell: ({ row }) => {
      const t = row.getValue("operationType");
      if (!t) {
        return null;
      }
      let type = "";
      if (t === 1) {
        type = "crud";
      } else if (t === 2) {
        type = "report";
      } else if (t === 3) {
        type = "other";
      }
      return h(
        UBadge,
        { class: "capitalize", variant: "subtle", color: "neutral" },
        () => type,
      );
    },
  },
];
</script>

<template>
  <BaseDashboardPanel id="permission-index" title="Permission page">
    <BaseCrudList
      icon="lucide:shield-keyhole"
      :title="$t('model_permission')"
      :crud-name="crudName"
      :list="dataList"
      :columns="columns"
      :show-checkbox="true"
      :loading="loading"
      :first-loaded="firstLoaded"
      :pages="pages"
      :sorts="sorts"
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
    />
  </BaseDashboardPanel>
</template>
