<script setup lang="ts">
definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "Watch page",
});

import type { FileManager } from "~/types/models";

const videoItem: FileManager = {
  id: "999",
  fileMime: "video/mp4",
  fileName: "View_From_A_Blue_Moon_Trailer-HD.mp4",
  filePath:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-1080p.mp4",
  fileThumbnailPath:
    "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
  fileSize: 9999,
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
const tabsItems = [
  {
    label: "All",
  },
  {
    label: "From this user",
  },
  {
    label: "Live",
  },
];
</script>

<template>
  <BaseDashboardPanel id="watch-v-id" title="Watch page">
    <div class="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
      <div class="md:col-span-8 h-full">
        <div class="w-full bg-neutral-950">
          <ClientOnly>
            <BaseVideoPlayer
              style="width: 100%"
              :options="{
                autoSetSource: true,
              }"
              :file="videoItem"
            />
          </ClientOnly>
        </div>
        <div class="p-4">
          <BaseVideoPlayerDetail :file="videoItem" />
        </div>
      </div>

      <div class="md:col-span-4 px-4">
        <UTabs
          :items="tabsItems"
          color="neutral"
          variant="link"
          :content="false"
          class="w-fit"
        />
        <div class="my-2">
          <BaseFileItem
            v-for="(item, index) in 5"
            :key="index"
            :item="videoItem"
            :index="index"
            layout="list"
            image-class="w-48 h-auto"
            :show-size="false"
            :bordered="false"
            :play-icon="false"
          >
            <div class="flex flex-col gap-1">
              <div class="text-sm">
                <BaseContentText
                  v-if="videoItem.fileName"
                  :rows="2"
                  text-class="text-sm font-bold"
                  :content="videoItem.fileName"
                />
              </div>
              <div class="text-xs text-muted">John Doe</div>
              <div class="flex items-center gap-2 text-xs text-muted">
                <Icon name="lucide:play" size="12px" />
                <span class="font-light">1.1M</span>
                <span class="font-light">2 days ago</span>
              </div>
            </div>
          </BaseFileItem>
        </div>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
