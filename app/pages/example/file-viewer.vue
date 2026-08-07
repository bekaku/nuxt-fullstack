<script setup lang="ts">
import type { FileManager } from "~/types/models";
import { rgb } from "pdf-lib";
definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "File viewer page",
});

const pdfFromServer = ref<string>();
const videoPlayerDialog = ref(false);
const videoItem: FileManager = {
  id: "9999",
  fileMime: "video/mp4",
  fileName: "View_From_A_Blue_Moon_Trailer-HD.mp4",
  filePath:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4",
  fileThumbnailPath:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
  fileSize: 1925325,
  fileMimeType: "VIDEO",
  createdDate: "2025-05-31 18:31:00",
  duration: 185,
  view: 78945,
  title: "This 525sqft House Has an Amazing Floor Plan! Full Tour!",
  description: `Today I talk/walk you through 24 hours of off-grid living in a cozy cabin, alone in the woods with my dog. I talk about my off-grid systems for heating, running water, electricity, cooking and more. I also find the time for some skiing, firewood chores, banjo pickin', and a wood fired sauna. Hope you enjoy! CHECK OUT MY WEBSITE for access to my channels original music or my Norman and cabin merchandise:

https://alaskacabinadventures.com

Here's is the link to the EcoFlow fridge and power stations I use,
Check out the Delta 2 MAX and the Glacier Fridge: EcoFlow Website: https://bit.ly/3si1QDK`,
  videoSources: [
    {
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
      type: "video/mp4",
      size: 576,
    },
    {
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4",
      type: "video/mp4",
      size: 720,
    },
    {
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4",
      type: "video/mp4",
      size: 1080,
    },
  ],
  videoTracks: [
    {
      kind: "captions",
      label: "English",
      srclang: "en",
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.en.vtt",
      default: true,
    },
    {
      kind: "captions",
      label: "Français",
      srclang: "fr",
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.fr.vtt",
      default: false,
    },
  ],
};

const imageSelectIndex = ref<number>(0);
const showImageView = ref(false);
const { data: imageItems } = await useFetch<FileManager[]>(
  "/api/mock/file/imageItemsData",
);
const showPdfView = ref(false);
const pdfSrc = ref<string>();
const pdfName = ref<string>();
const showPdfViewWatermark1 = ref(false);
const showPdfViewWatermark2 = ref(false);
const showPdfViewWatermark3 = ref(false);
const dummyPdfUrl =
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const { data: pdfItems } = await useFetch<FileManager[]>(
  "/api/mock/file/pdfItemsData",
);

const showMixFiles = ref(false);
const fileMixImageSelectIndex = ref<number>(0);
const fileImageItemsForView = ref<FileManager[]>([]);
const fileMixForView = ref<FileManager>();
const mixItems = ref<FileManager[]>([]);
mixItems.value.push(videoItem);

onMounted(() => {
  if (imageItems.value) {
    mixItems.value.push(...imageItems.value);
  }
  if (pdfItems.value) {
    mixItems.value.push(...pdfItems.value);
  }
  mixItems.value.push(videoItem);
});

const onVideoClick = (event: any, index: number) => {
  console.log("onVideoClick", index);
  videoPlayerDialog.value = true;
};

const onPdfPreviewClick = async (event: any, index: number) => {
  if (!pdfItems.value) {
    return;
  }
  const item = pdfItems.value[index];
  if (item) {
    pdfSrc.value = item.filePath;
    pdfName.value = item.fileName;
    showPdfView.value = true;
  }
};
const onClosePefView = () => {
  pdfSrc.value = undefined;
  pdfName.value = undefined;
  showPdfView.value = false;
};
</script>

<template>
  <BaseDashboardPanel id="example-file-viewer" title="File viewer">
    <UCard title="Video" class="mb-8">
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm font-bold text-muted">Dialog</div>
          <BaseFileItem
            :item="videoItem"
            :index="0"
            layout="grid"
            image-class="h-auto"
            :show-size="false"
            :show-name="false"
            @on-click="onVideoClick"
          >
          </BaseFileItem>
        </div>
        <div>
          <div class="text-sm font-bold text-muted">Inline</div>
          <ClientOnly>
            <BaseVideoPlayer
              :options="{
                autoSetSource: true,
              }"
              :file="videoItem"
            />
          </ClientOnly>
        </div>
      </div>
    </UCard>
    <UCard title="Image" class="mb-8">
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div class="text-sm font-bold text-muted">Grid</div>
          <BaseFileItems
            v-if="imageItems"
            :items="imageItems"
            :format-size="false"
            image-class="h-32"
            show-view-dialog
          />
        </div>
        <div>
          <div class="text-sm font-bold text-muted">List</div>
          <UScrollArea class="max-h-115">
            <BaseFileItems
              v-if="imageItems"
              :items="imageItems"
              :format-size="false"
              :bordered="false"
              layout="list"
              show-view-dialog
            />
          </UScrollArea>
        </div>
      </div>
    </UCard>

    <UCard title="Image slide" class="mb-8">
      <div class="h-[350px]">
        <ClientOnly>
          <BaseImageView :files="imageItems" />
        </ClientOnly>
      </div>
    </UCard>

    <UCard title="Pdf" class="mb-8">
      <div class="text-sm font-bold text-muted">Dialog</div>
      <!-- <BaseFileItems
        v-if="pdfItems"
        grid-class="md:grid-cols-6 border"
        :items="pdfItems"
        :format-size="false"
        :bordered="false"
        layout="grid"
        show-view-dialog
      /> -->
      <div class="w-36 my-4">
        <BaseFileItem
          v-if="pdfItems != undefined && pdfItems.length > 0 && pdfItems[0]"
          :index="0"
          :item="pdfItems[0]"
          layout="grid"
          @on-click="onPdfPreviewClick"
        >
        </BaseFileItem>
      </div>

      <div class="text-sm font-bold text-muted">Watermark</div>
      <div class="flex gap-4 my-4">
        <UButton
          label="Defult watermark"
          @click="showPdfViewWatermark1 = true"
        />
        <UButton
          label="Custom watermark"
          @click="showPdfViewWatermark2 = true"
        />
        <UButton
          label="Custom position, text, image"
          @click="showPdfViewWatermark3 = true"
        />
      </div>

      <div class="text-sm font-bold text-muted my-4">Inline display</div>
      <USeparator />
      <BasePdfView
        :src="dummyPdfUrl"
        :closeable="false"
        title="compressed.tracemonkey-pldi-09.pdf"
        :all-page="false"
        :watermark-options="{
          image: '/logo/logo.png',
        }"
      />
    </UCard>

    <UCard title="Mix item View" class="mb-8">
      <BaseFileItems
        v-if="mixItems"
        :items="mixItems"
        grid-class="md:grid-cols-6"
        image-class="h-32"
        :show-size="false"
        show-view-dialog
      />
    </UCard>
  </BaseDashboardPanel>

  <LazyBaseVideoPlayerDialog
    v-if="videoPlayerDialog"
    v-model:show="videoPlayerDialog"
    :file="videoItem"
    :options="{ autoSetSource: true, autoplay: false }"
  />

  <LazyBasePdfViewDialog
    v-if="showPdfView && pdfSrc"
    v-model="showPdfView"
    :src="pdfSrc"
    :title="pdfName"
    @on-close="() => onClosePefView"
  />
  <LazyBasePdfViewDialog
    v-if="showPdfViewWatermark1"
    v-model="showPdfViewWatermark1"
    :src="dummyPdfUrl"
    title="Defult watermark"
    :watermark-options="{
      text: 'Defult watermark',
    }"
  />
  <LazyBasePdfViewDialog
    v-if="showPdfViewWatermark2"
    v-model="showPdfViewWatermark2"
    :src="dummyPdfUrl"
    title="Custom watermark"
    :watermark-options="{
      text: 'Watermark',
      fontSize: 28,
      rows: 3,
      columns: 3,
      rotation: 0,
      opacity: 0.7,
      color: rgb(0.1, 1, 0.1),
    }"
  />
  <LazyBasePdfViewDialog
    v-if="showPdfViewWatermark3"
    v-model="showPdfViewWatermark3"
    :src="dummyPdfUrl"
    title="Custom position"
    :watermark-options="{
      image: '/logo/logo.png',
      items: [
        {
          text: 'Top left',
          position: 'top-left',
        },
        {
          text: 'Top right',
          position: 'top-right',
        },
        {
          text: 'Bottom left',
          position: 'bottom-left',
        },
        {
          text: 'Bottom right',
          position: 'bottom-right',
        },
      ],
    }"
  />
</template>
