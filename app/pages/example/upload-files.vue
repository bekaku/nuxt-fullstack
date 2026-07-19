<script setup lang="ts">
definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "Upload files page",
});
const api = useApi();
const value = ref<File | null>(null);
const isUploading = ref(false);
const progress = ref(0);
const CHUNK_SIZE = 1024 * 1024;
const onChange = (f: File | null | undefined) => {
  console.log("onChange", f);
};

const onUpload = async () => {
  if (!value.value) {
    return;
  }

  isUploading.value = true;
  progress.value = 0;
  const file = value.value;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const filename = file.name;
  const uniqueId = generateSnowFlakeId().toString()

  try {
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("filename", filename);
      formData.append("uniqueId", uniqueId);
      formData.append("chunkIndex", chunkIndex.toString());
      formData.append("totalChunks", totalChunks.toString());

      const chunkRespone = await api<any>("/api/file-manager", {
        method: "POST",
        body: formData,
      });

      console.log("chunkRespone", chunkRespone);

      progress.value = Math.round(((chunkIndex + 1) / totalChunks) * 100);
    }

    console.log("Upload Complete!");
  } catch (error) {
    console.error("Upload failed:", error);
    alert("Upload Error");
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <BaseDashboardPanel id="example-upload-files" title="Upload files page">
    <div class="flex- flex-col gap-4">
      <UFileUpload
        v-model="value"
        label="Drop your file here"
        :multiple="false"
        class="w-96 min-h-48 my-2"
        @update:modelValue="
          (f: File | null | undefined) => {
            onChange(f);
          }
        "
      />
      progress {{ progress }}
      <UButton icon="lucide:hard-drive-upload" @click="onUpload">Upload</UButton>
    </div>
  </BaseDashboardPanel>
</template>
