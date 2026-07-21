<script setup lang="ts">
import type { ResponseEntity } from "~/types/common";
import type { FileManager } from "~/types/models";

definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "Upload files page",
});

const { files, uploading, progress, onStartUploadChunk, onUploadChunk } =
  useUpload();
const file = ref<File | null>(null);
const onChange = (f: File | null | undefined) => {
  console.log("onChange", f);
};
const uploadChunk = async () => {
  if (!file.value) {
    return;
  }
  uploading.value = true;
  const response = await onUploadChunk(file.value, {
    setProgress: false,
  });
  uploading.value = false;
  console.log("uploadChunk", response);
};
</script>

<template>
  <BaseDashboardPanel id="example-upload-files" title="Upload files page">
    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="w-full">
        <UCard title="Nuxt UI">
          <div class="flex flex-col gap-4">
            <UFileUpload
              v-model="file"
              label="Drop your file here"
              :multiple="false"
              dropzone
              class="w-96 min-h-48 my-2"
              @update:modelValue="
                (f: File | null | undefined) => {
                  onChange(f);
                }
              "
            />
            <UButton
              :loading="uploading"
              icon="lucide:hard-drive-upload"
              class="w-fit"
              @click="uploadChunk"
            >
              Upload
            </UButton>
          </div>
        </UCard>
      </div>
      <div class="w-full">
        <UCard title="Custom components">
          <div class="flex flex-col gap-4">
            <BaseFileUpload
              description="SVG, PNG, JPG or GIF (max. 2MB)"
              multiple
              class="w-96 my-2"
              icon="lucide:image"
              :max-files="2"
              v-model="files"
            />

            <UProgress v-model="progress" status />

            <UButton
              :loading="uploading"
              icon="lucide:hard-drive-upload"
              class="w-fit"
            >
              Upload
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
