<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import {
  ICrudListHeaderOptionSearchType,
  type ICrudFilterOptions,
} from "~/types/common";
import type { AiDocumentMeta } from "~/types/models";

definePageMeta({
  pageName: "model.ai_document_meta.table",
  requiresPermission: ["ai_document_meta_list"],
});

const toast = useToast();
const confirm = useConfirmDialog();
const loader = useLoader();
const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UIcon = resolveComponent("UIcon");
const { t } = useLang();
const api = useApi();
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
} = useCrudList<AiDocumentMeta>({
  crudName: "AiDocumentMeta", //PascalCase only eg: User, AppRole
  apiEndpoint: "/api/aiDocumentMeta",
  headers: [],
  itemsPerPage: 10,
  defaultSorts: [
    {
      column: "fileName",
      mode: "asc",
    },
  ],
});
const columns = ref<TableColumn<AiDocumentMeta>[]>([
  {
    accessorKey: "fileMime",
    header: t("model_files_manager_mime"),
    cell: ({ row }) => {
      const mime = row.getValue("fileMime") as string;

      return h(UIcon, {
        name: getFileTypeIcon(mime),
        color: "neutral",
      });
    },
  },
  {
    accessorKey: "fileName",
    header: t("model_files_manager_name"),
    cell: ({ row }) => row.getValue("fileName"),
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
    accessorKey: "metadata",
    header: t("model.ai_document_meta.metadata"),
    cell: ({ row }) => {
      const metas: string[] = row.getValue("metadata");
      return h(
        "div",
        { class: "flex flex-wrap gap-2" },
        Object.entries(metas).map(([key, value]) => {
          return h(
            UBadge,
            {
              variant: "subtle",
              color: "neutral",
            },
            () => `${key}: ${value}`,
          );
        }),
      );
    },
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
        searchModel: true,
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

const onManualDelete = async (index: number) => {
  const conf = await confirm({
    title: t("base.deleteCountConfirm", { count: 1 }),
    description: t("base.deleteConfirmHelp"),
    confirmButton: {
      label: t("base.delete"),
      color: "error",
      icon: "lucide:trash",
    },
  });
  if (!conf) {
    return;
  }
  onItemDelete(index);
};

const onSyncDatabaseSchema = async () => {
  const conf = await confirm({
    title: "Sync Database Schema",
    confirmButton: {
      label: t("base.okay"),
      color: "warning",
      icon: "lucide:database-backup",
    },
  });
  if (!conf) {
    return;
  }

  loader.open()
  try {
    const response = await api.raw<void>(
      "/api/aiDocumentMeta/ingestDatabaseSchemas",
      {
        method: "POST",
      },
    );
    if (response && response?.status == 200) {
      toast.add({
        description: t("success.success"),
        icon: "lucide:check",
        color: "success",
      });
    }
  } catch (error) {
    console.error("Failed to fetch profile ", error);
  } finally {
    loader.close()
  }
};
</script>

<template>
  <BaseDashboardPanel
    id="ai-document-meta-index"
    :title="$t('model.ai_document_meta.table')"
  >
    <BaseTable
      icon="lucide:brain-circuit"
      :title="$t('model.ai_document_meta.table')"
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
      <template #table-header-end-append>
        <UButton
          :label="$t('ai.syncDatabaseSchema')"
          icon="lucide:database-backup"
          color="warning"
          @click="onSyncDatabaseSchema"
        />
      </template>
      <template #actions-cell="{ row }">
        <UButton
          icon="lucide:trash"
          color="error"
          class="rounded-full"
          @click="onManualDelete(row.index)"
        />
      </template>
    </BaseTable>
  </BaseDashboardPanel>
</template>
