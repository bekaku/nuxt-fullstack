<script setup lang="ts">
import type { FileUploadProps } from "@nuxt/ui";
import { max } from "date-fns";
import type { AppColor, ImageDimensions } from "~/types/common";
import type { FileManager } from "~/types/models";

const {
  multiple = false,
  accept,
  layout = "list",
  preview = false,
  interactive = false,
  dropzone = true,
  limitFileSize,
  strictMode = true,
  videoEditor,
  maxFiles = 10,
  disabled,
  priview = true,
} = defineProps<{
  icon?: string;
  label?: string;
  color?: AppColor;
  description?: string;
  limitFileSize?: number; //LimitFileSizeMB * 1024 * 1024;
  multiple?: boolean;
  dropzone?: boolean;
  videoEditor?: boolean;
  variant?: FileUploadProps["variant"]; //The button variant is only available when multiple is false.
  size?: FileUploadProps["size"];
  layout?: FileUploadProps["layout"]; //The layout of how files are displayed. Only works when variant is area.
  position?: FileUploadProps["position"];
  ui?: FileUploadProps["ui"];
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  preview?: boolean;
  interactive?: boolean;
  strictMode?: boolean;
  maxFiles?: number; //0 = unlimited pick
  priview?: boolean;
}>();

const emit = defineEmits<{
  "on-file-add": [files: File[] | File | null | undefined];
  "on-remove": [index: number];
  "on-click": [index: number];
  "on-soft-delete": [index: number];
}>();
const { t } = useLang();
const modelValue = defineModel<FileManager[]>({ default: () => [] });
const modelFile = ref<File[] | File | null>(null);
const toast = useToast();
const config = useRuntimeConfig();

//Video
const showVdoEditor = ref<boolean>(false);
const vdoFile = ref<File | null | undefined>(undefined);
const videoEditorTimeout = ref<any>();
const isDisabled = computed(() => {
  if (disabled || maxFiles === 0) {
    return disabled;
  }
  return modelValue.value.length >= maxFiles;
});
const limitSize = computed(() => {
  if (limitFileSize) {
    return limitFileSize;
  }
  return config.public.limitFileUploadSize;
});
const getAccept = computed(() => {
  if (config.public.acceptFiles && config.public.acceptFiles.length > 0) {
    return config.public.acceptFiles;
  }
  return [];
});
const onEmitFileAdd = (items: File[]) => {
  emit("on-file-add", items);
};
const validateAndZipFile = async (files: File[]): Promise<any[]> => {
  const list: any[] = [];
  for (const f of files) {
    const type = f.type;

    console.log("validateAndZipFile", {
      size: f.size,
      limitSize: limitSize.value,
    });
    if (f.size > limitSize.value) {
      toast.add({
        description: t("error.limitEachFile2", [
          f.name,
          formatBytes(limitSize.value),
        ]),
        icon: "lucide:file-up",
        color: "error",
      });
    } else {
      if (!strictMode || getAccept.value.length === 0) {
        list.push(f);
      } else {
        const allowType = getAccept.value.includes(type);
        if (!allowType) {
          const ziped = await zipFile(f);
          if (ziped) {
            list.push(ziped);
          }
        } else {
          list.push(f);
        }
      }
    }
  }
  return new Promise((resolve) => {
    resolve(list);
  });
};
const onAddFilePreview = (
  f: File,
  fileMimeType: FileMimeType | undefined,
  dimensions?: ImageDimensions,
  pathUrl: string | undefined = undefined,
) => {
  if (modelValue.value && f) {
    modelValue.value.push({
      id: 0,
      uniqueId: idToString(generateSnowFlakeId()),
      fileMime: f.type,
      fileName: f.name,
      filePath: pathUrl ? pathUrl : "",
      fileThumbnailPath: "",
      fileSize: f.size,
      functionId: 0,
      fileMimeType: fileMimeType,
      file: f,
      width: dimensions?.width || 0,
      height: dimensions?.height || 0,
    });
  }
};
const onAddFile = async (f: any): Promise<void> => {
  if (f) {
    const fileMimeType = getFileMimeType(f);
    let url: string | undefined = undefined;
    let dimensions: ImageDimensions | undefined;
    let file: File = f;
    if (fileMimeType && fileMimeType == "IMAGE") {
      dimensions = await getImageDimensions(f);
      if (
        dimensions &&
        (dimensions.height > config.public.maxImageToResize ||
          dimensions.width > config.public.maxImageToResizeMb)
      ) {
        const coompressFile = await resizeImage(f, {
          maxSizeMB: config.public.maxImageToResizeMb,
          maxWidthOrHeight: config.public.maxImageToResize,
          useWebWorker: true,
        });
        if (coompressFile) {
          file = coompressFile;
        }
        console.log("resize", coompressFile);
      }
      url = await getImgUrlFromFile(file);
    }
    onAddFilePreview(file, fileMimeType, dimensions, url);
  }
};
const onChange = async (files: File[] | File | null | undefined) => {
  console.log("onChange", files);
  if (!files) {
    return;
  }
  const incomingFiles = Array.isArray(files) ? files : [files];
  const currentCount = modelValue.value.length;
  const remainingQuota = maxFiles - currentCount;
  if (remainingQuota <= 0) {
    toast.add({
      description: t("error.limitFile2", { total: maxFiles }),
      icon: "lucide:file-up",
      color: "error",
    });
    return;
  }
  const fileList = incomingFiles.slice(0, remainingQuota);
  if (!videoEditor) {
    const finalFiles = await validateAndZipFile(fileList);
    onEmitFileAdd(finalFiles);
    if (multiple) {
      if (finalFiles && finalFiles.length > 0) {
        for (const f of finalFiles) {
          await onAddFile(f);
        }
      }
    } else if (finalFiles) {
      modelValue.value = [];
      await onAddFile(finalFiles[0]);
    }
    modelFile.value = [];
  } else {
    const f = fileList[0];
    if (f && f?.type) {
      const type = getFileType(f?.type);
      if (type && type == "video") {
        vdoFile.value = f;
        videoEditorTimeout.value = setTimeout(() => {
          showVdoEditor.value = true;
        }, 350);
      } else {
        onEmitFileAdd(fileList);
      }
    }
  }
};
const onVideoEditorClose = () => {
  showVdoEditor.value = false;
  vdoFile.value = null;
  modelFile.value = null;
};
const onVideoAdd = (f: FileManager) => {
  console.log("onVideoAdd", f);
  if (f && f.file) {
    onEmitFileAdd([f.file]);
    modelValue.value.push(f);
  }
};
const onClick = async (event: any, index: number) => {
  console.log("onClick", { index, event });
};
const onRemove = (index: number) => {
  emit("on-remove", index);
  if (modelValue.value[index]) {
    modelValue.value.splice(index, 1);
  }
};
const onSoftDelete = (index: number) => {
  emit("on-soft-delete", index);
};
const onClearProcess = () => {
  modelValue.value = [];
  modelFile.value = null;
};
const clearAppTimeout = () => {
  if (videoEditorTimeout.value) {
    clearTimeout(videoEditorTimeout.value);
  }
};
onBeforeUnmount(() => {
  onClearProcess();
  clearAppTimeout();
});
</script>
<template>
  <UFileUpload
    v-bind="$attrs"
    v-model="modelFile"
    :label="label || $t('base.dragFile')"
    :icon
    :description="
      description
        ? `${description}(${$t('drive.limitFiles', { count: 2, limit: maxFiles })})`
        : `${$t('drive.limitFiles', { count: 2, limit: maxFiles })}`
    "
    :multiple="multiple"
    :dropzone
    :accept
    :layout
    :required
    :disabled
    :preview
    :ui
    :interactive
    @update:modelValue="onChange"
  >
    <template #files-top="{ removeFile, files, open }">
      <slot name="files-top" v-bind="{ removeFile, files, open }"> </slot>
    </template>
    <template #default="{ open, removeFile }">
      <slot v-bind="{ open, removeFile }"> </slot>
    </template>

    <template #actions="{ removeFile, files, open }">
      <slot name="actions" v-bind="{ removeFile, files, open }">
        <div class="w-full flex flex-col gap-2">
          <div class="w-full flex justify-center">
            <UButton
              :label="$t('base.chooseFile')"
              icon="lucide:upload"
              color="neutral"
              variant="outline"
              class="w-fit"
              @click="open()"
            />
          </div>

          <div
            v-if="priview"
            class="w-full flex-col overflow-hidden mt-4 text-left"
          >
            <BaseFileItem
              v-for="(item, index) in modelValue"
              :key="item.uniqueId || item.id + ''"
              :index="index"
              :item="item"
              @on-click="onClick"
              @on-remove="onRemove"
              @on-soft-delete="onSoftDelete"
            >
            </BaseFileItem>
          </div>
        </div>
      </slot>
    </template>

    <template #files-bottom="{ removeFile, files, open }">
      <slot name="files-bottom" v-bind="{ removeFile, files, open }"> </slot>
    </template>
  </UFileUpload>
</template>
