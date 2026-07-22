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
            <!-- <BaseImage
              src="https://images.unsplash.com/photo-1784146930322-6e7eca40f176?q=80&w=687&auto=format&fit=crop"
              alt="image"
              class="w-96 h-96 rounded-xl"
              fit="contain"
            >
              <div class="absolute inset-0 bg-black/40"></div>

              <div
                class="relative z-10 flex flex-col items-center justify-center"
              >
                <div
                  class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-sm mb-2"
                >
                  +
                </div>
                <span class="text-sm font-bold text-white drop-shadow-md">
                  Add Story
                </span>
              </div>
            </BaseImage>
            <BaseImage
              src="https://images.unsplash.com/photo-1782346056252-c3699920bf19?q=80&w=1170&auto=format&fit=crop"
              alt="image"
              class="w-48 rounded-xl"
              fit="cover"
            >
              <UButton
                class="absolute top-2 right-2 z-20 flex items-center justify-center w-7 h-7 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors shadow-md"
                label="Remove image"
              >
                <UIcon name="lucide:x" />
              </UButton>
            </BaseImage> -->

            files {{ files.length }}
            <BaseFileUpload
              description="Upload multiple files"
              multiple
              class="my-2"
              icon="lucide:image"
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
