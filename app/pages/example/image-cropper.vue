<script setup lang="ts">
import type { RadioGroupItem } from "@nuxt/ui";
import type { LabelValue } from "~/types/common";

useSeoMeta({
  title: "Image cropper",
});
const showImageCroper = ref(false);
const cropedUrl = ref<string | undefined>("/images/no_picture.jpg");
const cropedFile = ref<any>();

const ratioSelected = ref<number>(1);
const ratioOptions: RadioGroupItem[] = [
  { label: "1", value: 1 },
  { label: "4/3", value: 4 / 3 },
  { label: "16/9", value: 16 / 9 },
];
const onCloseImageCropper = () => {
  showImageCroper.value = false;
};
const onDeleteFile = () => {
  cropedUrl.value = undefined;
  cropedFile.value = undefined;
};
const onCropImage = async (f: any) => {
  console.log("onCropImage", f);
  const imageUrl = await getImgUrlFromFile(f);
  if (imageUrl) {
    cropedUrl.value = imageUrl;
  }
  cropedFile.value = f;
};

const onCropImageEnd = (imageUrl: string) => {
  console.log("onCropImageEnd");
};
</script>

<template>
  <BaseDashboardPanel id="example-image-cropper" title="Image cropper">
    <UCard title="Usage">
      <URadioGroup
        orientation="horizontal"
        v-model="ratioSelected"
        :items="ratioOptions"
        class="my-4"
      />

      <ClientOnly>
        <BaseImageCropper
          initial-src="/images/no_picture.jpg"
          :ratio="ratioSelected"
          @on-close="onCloseImageCropper"
          @on-submit="onCropImage"
        />
      </ClientOnly>
      <USeparator class="my-4" />

      <div v-if="cropedUrl" class="flex flex-wrap gap-4">
        <BaseImage
          :src="cropedUrl"
          fit="cover"
          style="height: 250px; max-width: 250px"
          class="bg-neutral-950"
        >
          <div
            class="absolute top-0 inset-x-0 max-h-[50%] min-h-10 bg-black/60 backdrop-blur-sm flex flex-col justify-center px-3 z-10 text-white"
          >
            <p>cover</p>
          </div>
        </BaseImage>

        <BaseImage
          :src="cropedUrl"
          fit="fill"
          style="height: 450px; width: 250px"
        >
         <div
            class="absolute top-0 inset-x-0 max-h-[50%] min-h-10 bg-black/60 backdrop-blur-sm flex flex-col justify-center px-3 z-10 text-white"
          >
            <p>fill</p>
          </div>
        </BaseImage>

        <div class="bg-neutral-950 h-[450px] max-w-[250px]">
          <BaseImage
            :src="cropedUrl"
            fit="contain"
            class="h-[450px] max-w-[250px]"
          >
            <div
              class="absolute top-0 inset-x-0 max-h-[50%] min-h-10 bg-black/60 backdrop-blur-sm flex flex-col justify-center px-3 z-10 text-white"
            >
              <p>contain</p>
            </div>
          </BaseImage>
        </div>

        <BaseImage
          :src="cropedUrl"
          fit="inside"
          style="height: 450px; max-width: 250px"
          class="bg-neutral-950"
        >
          <div
            class="absolute top-0 inset-x-0 max-h-[50%] min-h-10 bg-black/60 backdrop-blur-sm flex flex-col justify-center px-3 z-10 text-white"
          >
            <p>inside</p>
          </div>
        </BaseImage>
        <BaseImage
          :src="cropedUrl"
          fit="outside"
          style="height: 450px; max-width: 250px"
        >
         <div
            class="absolute top-0 inset-x-0 max-h-[50%] min-h-10 bg-black/60 backdrop-blur-sm flex flex-col justify-center px-3 z-10 text-white"
          >
            <p>outside</p>
          </div>
        </BaseImage>
      </div>
    </UCard>
  </BaseDashboardPanel>
</template>
