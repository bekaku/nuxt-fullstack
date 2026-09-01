<script setup lang="ts">
import z from "zod";
import type {
  AiDocumentMeta,
  FileManager,
  IngestionResponse,
} from "~/types/models";

definePageMeta({
  pageName: "model.ai_document_meta.table",
  requiresPermission: ["ai_document_meta_add"],
});

const { t } = useLang();
const { onUploadChunk } = useUpload();
const { public: config } = useRuntimeConfig();
const api = useApi();
const schema = z.object({
  files: z
    .array(z.any())
    .describe(
      uiConfig({
        label: t("base.chooseFile"),
        ui: {
          type: "file",
          layout: "list",
          multiple: true,
          acceptFiles: config.acceptIngestFiles.join(","),
          max: 10,
          class: "w-full",
        },
      }),
    )
    .optional(),
});
type Schema = z.output<typeof schema>;
const state = ref<Partial<Schema>>({
  files: [],
});

const {
  crudAction,
  loading,
  crudName,
  isEditMode,
  onDelete,
  onBack,
  onEnableEditForm,
} = useCrudForm<AiDocumentMeta>(
  {
    crudName: "AiDocumentMeta",
    methodPutIncludeId: false,
    methodPut: "POST",
    fectchDataOnLoad: true,
  },
  state,
);
const uploadFileTotal = ref<number>(0);
const uploadFileSuccess = ref<number>(0);
const ingestITems = ref<IngestionResponse[]>([]);

const uploadSuccessPercent = computed<number>(() => {
  if (uploadFileTotal.value === 0 || uploadFileSuccess.value === 0) {
    return 0;
  }
  const percent = (uploadFileSuccess.value / uploadFileTotal.value) * 100;
  return Math.round(percent);
});

const onSubmit = async () => {
  if (!state.value.files || state.value.files.length === 0) {
    return;
  }
  uploadFileTotal.value = state.value.files.length;
  loading.value = true;

  for (const f of state.value.files) {
    await onUploadAndIngest(f);
  }
  loading.value = false;
  state.value.files = [];
};
const onUploadAndIngest = async (f: FileManager) => {
  if (!f || !f.file) {
    return;
  }

  try {
    const response = await onUploadChunk(f.file, {
      setProgress: false,
    });
    if (response && response.id) {
      //ingest file
      const ingestResponse = await api.raw<IngestionResponse>(
        `/api/aiDocumentMeta/ingest/${response.id}`,
        {
          method: "POST",
        },
      );
      if (
        ingestResponse &&
        ingestResponse?.status == 200 &&
        ingestResponse._data &&
        !isAppException(ingestResponse._data)
      ) {
        uploadFileSuccess.value++;
        ingestITems.value.push(ingestResponse._data);
      }
    }
  } catch (error) {
    console.error("An error occurred while uploading the file.:", error);
  }
};

const testIngest = async () => {
  await api.raw<IngestionResponse>(
    "/api/aiDocumentMeta/ingest/353086428084703232",
    {
      method: "POST",
    },
  );
};
</script>
<template>
  <BaseDashboardPanel
    id="ai-document-meta-crud"
    :title="$t('model.ai_document_meta.table')"
  >
    <BaseForm
      :zod-schema="schema"
      v-model="state"
      :edit-mode="isEditMode"
      :crud-action="crudAction"
      :loading="loading"
      :crud-name="crudName"
      icon="lucide:brain-circuit"
      :title="$t('model.ai_document_meta.table')"
      orientation="horizontal"
      class="max-w-[1020px]"
      @on-back="onBack"
      @on-edit-enable="onEnableEditForm"
      @on-submit="onSubmit"
      @on-delete="onDelete"
    >
      <UProgress
        :model-value="Math.min(Math.max(uploadSuccessPercent, 0), 100)"
        status
      />
      <UCard
        v-if="ingestITems && ingestITems.length > 0"
        :title="$t('drive.uploadComplete')"
      >
        <UScrollArea class="w-full max-h-96">
          <BaseItem
            v-for="(item, index) in ingestITems"
            :key="item.id + ''"
            :title="item.fileName"
            :description="`${item.chunkCount} chunks`"
          >
            <template #start>
              <Icon
                :name="getFileTypeIcon(item.fileMime)"
                :class="['size-8']"
              />
            </template>
          </BaseItem>
        </UScrollArea>
      </UCard>

      <UButton label="Test Ingest" @click="testIngest"/>
    </BaseForm>
  </BaseDashboardPanel>
</template>
