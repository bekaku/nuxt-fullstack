<script setup lang="ts">
import type { NavigationMenuItem, SelectItem, SelectMenuItem } from "@nuxt/ui";
import type { FeedItem } from "~/types";

useSeoMeta({
  title: "Feed page",
});
const authenStore = useAuthenStore();
const { isMobile } = useDevice();
const { t } = useLang();
const api = useApi();
const links: NavigationMenuItem[][] = [
  [
    {
      label: "Menu",
      type: "label",
    },
    {
      label: "Home",
      icon: "i-lucide-house",
      to: "/",
    },
    {
      label: "Friends",
      icon: "lucide:square-user-round",
      badge: "4",
    },
    {
      label: "Groups",
      icon: "i-lucide-users",
    },
    {
      label: "Memories",
      icon: "lucide:history",
    },
    {
      label: "Saved",
      icon: "lucide:bookmark",
    },
    {
      label: "Reels",
      icon: "i-lucide-circle-play",
    },
    {
      label: "Marketplace",
      icon: "i-lucide-store",
    },
    {
      label: "Groups",
      icon: "i-lucide-users",
    },
    {
      label: "Gamming",
      icon: "i-lucide-gamepad",
    },
    {
      label: "Messages",
      icon: "lucide:message-circle",
    },
    {
      label: "Social",
      type: "label",
    },
    {
      label: "Feeds",
      icon: "lucide:newspaper",
    },
    {
      label: "Pages",
      icon: "lucide:flag",
    },
    {
      label: "Events",
      icon: "lucide:calendar-fold",
    },
  ],
];

const storyItems = [
  {
    you: true,
    image:
      "https://images.unsplash.com/photo-1783095593983-7936ec02f205?q=80&w=830&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=200&auto=format&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=11",
    name: "Sam Brown",
  },
  {
    image:
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?q=80&w=200&auto=format&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=20",
    name: "Laura Fisher",
  },
  {
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=200&auto=format&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=33",
    name: "Diana Vooss",
  },
  {
    image:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=200&auto=format&fit=crop",
    avatar: "https://i.pravatar.cc/150?img=60",
    name: "Roger Miller",
  },
  {
    image:
      "https://plus.unsplash.com/premium_photo-1747851393136-5423d8cb248f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    avatar: "https://i.pravatar.cc/150?img=1",
    name: "Roger Miller",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782519143849-c86633a0a9ab?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    avatar: "https://i.pravatar.cc/150?img=2",
    name: "Roger Miller",
  },
  {
    image:
      "https://images.unsplash.com/photo-1783494403679-1c791dc71d7b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    avatar: "https://i.pravatar.cc/150?img=6",
    name: "Roger Miller",
  },
  {
    image:
      "https://images.unsplash.com/photo-1783093905430-712b0a88b115?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    avatar: "https://i.pravatar.cc/150?img=3",
    name: "Roger Miller",
  },
  {
    image:
      "https://images.unsplash.com/photo-1783420373423-4f0c6b5ca471?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    avatar: "https://i.pravatar.cc/150?img=4",
    name: "Roger Miller",
  },
  {
    image:
      "https://images.unsplash.com/photo-1782925766439-0ad60593e946?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    avatar: "https://i.pravatar.cc/150?img=5",
    name: "Roger Miller",
  },
];

const contactItems = [
  {
    name: "Amanda Miles",
    avatar: "https://i.pravatar.cc/150?img=32",
    online: true,
  },
  {
    name: "Melissa Byron",
    avatar: "https://i.pravatar.cc/150?img=44",
  },
  {
    name: "Ronald Bezos",
    avatar: "https://i.pravatar.cc/150?img=15",
    online: true,
  },
  {
    name: "Billy Rosewood",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    name: "Katty Monroe",
    avatar: "https://i.pravatar.cc/150?img=25",
    online: true,
  },
  {
    name: "Kurt Williamson",
    avatar: "https://i.pravatar.cc/150?img=52",
  },
];
const sortItems = ref<SelectItem[]>([
  {
    label: t("sort.post.NEW_POST"),
    id: "NEW_POST",
    icon: "lucide:clock",
    description: t("sort.post.NEW_POST_DESC"),
  },
  {
    label: t("sort.post.NEW_ACTIVITY"),
    id: "NEW_ACTIVITY",
    icon: "lucide:rocket",
    description: t("sort.post.NEW_ACTIVITY_DESC"),
  },
  {
    label: t("sort.post.TOP_POST"),
    id: "TOP_POST",
    icon: "lucide:flame",
    description: t("sort.post.TOP_POST_DESC"),
  },
]);
const sortModel = ref("NEW_POST");

const filterItems = shallowRef<SelectMenuItem[]>([
  {
    label: "News",
    id: "news",
    icon: "lucide:newspaper",
  },
  {
    label: "Newest",
    id: "newest",
    icon: "lucide:file-clock",
  },
  {
    label: "Ask",
    id: "ask",
    icon: "lucide:file-question-mark",
  },
  {
    label: "Show",
    id: "show",
    icon: "lucide:spotlight",
  },
  {
    label: "Jobs",
    id: "jobs",
    icon: "lucide:briefcase-business",
  },
]);
const page = ref(1);
const maxPage = 10;
const hasPrev = computed(() => page.value > 1);
const hasNext = computed(() => page.value < maxPage);
const firstLoad = ref(false);
const data = ref<FeedItem[]>([]);
const currentFeed = ref("news");

const getCurrentTabText = computed<SelectMenuItem | undefined>(() => {
  const selectedItem = filterItems.value.find(
    (item: any) => item && item.id === currentFeed.value,
  );

  if (!selectedItem) return undefined;

  if (
    typeof selectedItem === "object" &&
    selectedItem !== null &&
    "label" in selectedItem
  ) {
    return selectedItem.label;
  }
  return undefined;
});
const onLoadData = async (): Promise<void> => {
  if (!data.value) {
    data.value = [];
  }
  try {
    const response = await api<FeedItem[]>(`/${currentFeed.value}`, {
      method: "GET",
      baseURL: "https://api.hackerwebapp.com",
      params: {
        page: page.value,
      },
    });
    data.value.push(...response);
    return;
  } catch (err) {
    console.error("Error:", err);
    return;
  } finally {
    if (!firstLoad.value) {
      firstLoad.value = true;
    }
  }
};
const handleFilter = (ev: any) => {
  console.log("handleFilter", ev);
  page.value = 1;
  data.value = [];
  firstLoad.value = false;
  onLoadData();
};
onLoadData();
</script>

<template>
  <main
    class="max-w-[1440px] mx-auto px-4 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-[16rem_minmax(0,1fr)_20rem] gap-8"
  >
    <!-- Left  -->
    <div
      v-if="!isMobile"
      class="w-full lg:w-64 shrink-0 lg:sticky lg:top-[6rem] lg:h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide hidden lg:flex flex-col gap-6"
    >
      <UserCard
        v-if="authenStore.auth"
        :avatar="{
          src: authenStore.auth?.avatar?.image,
        }"
        :cover-image="authenStore.loginedCover"
        :name="authenStore.loginedDisplay"
        description="Software Engineer"
        height="100px"
        avatar-top="70px"
        avatar-size="3xl"
        avartar-class="top-[95px]"
        :description-style="{ marginTop: '10px' }"
      />

      <div class="flex-1 overflow-y-auto">
        <UNavigationMenu
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
          :ui="{
            item: 'py-0.5',
            linkLeadingIcon: 'size-6',
            label: 'text-muted font-bold uppercase mt-1',
          }"
        />
      </div>

      <div class="h-4"></div>
    </div>

    <!-- Center  -->

    <div class="flex-1 flex flex-col gap-6 min-w-0">
      <!-- <BaseInfiniteScrollPage class="flex-1 flex flex-col gap-6 min-w-0"> -->
      <!-- Story  -->
      <div class="pb-2 w-full overflow-hidden">
        <UCarousel
          class="w-full"
          v-slot="{ item, index }"
          arrows
          :prev="{
            color: 'neutral',
          }"
          :next="{
            color: 'neutral',
          }"
          :items="storyItems"
          :ui="{
            item: 'basis-[130px] md:basis-[135px] lg:basis-[140px]',
            prev: 'sm:start-8',
            next: 'sm:end-8',
            container: 'gap-3 ms-0',
          }"
        >
          <template v-if="item.you">
            <div
              class="w-full aspect-9/16 shrink-0 rounded-xl bg-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-300 transition relative bg-cover"
              :style="`
              background-image: url(${item.image});
            `"
            >
              <div class="absolute inset-0 bg-white/40"></div>
              <div
                class="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold z-10 shadow-sm mb-2"
              >
                +
              </div>
              <span class="text-sm font-bold text-white z-10 drop-shadow-md"
                >Add Story</span
              >
            </div>
          </template>
          <div
            v-else
            class="w-full aspect-9/16 shrink-0 rounded-xl bg-cover bg-center relative cursor-pointer group shadow-md"
            :style="`
              background-image: url(${item.image});
            `"
          >
            <div
              class="absolute inset-0 bg-linear-to-b from-black/20 to-black/60 rounded-2xl"
            ></div>
            <UAvatar
              class="absolute top-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-blue-500"
              :src="getMockAvatarByIndex(index)"
              :alt="item.name"
              size="3xl"
              loading="lazy"
            />
            <span
              class="absolute bottom-3 left-0 w-full text-center text-white text-xs font-bold px-1"
              >{{ item.name }}</span
            >
          </div>
        </UCarousel>
      </div>

      <!-- Post area -->
      <div class="w-full">
        <UCard variant="outline">
          <div class="w-full flex flex-col gap-2">
            <div class="w-full flex gap-2">
              <UAvatar
                :src="authenStore.auth?.avatar?.image"
                loading="lazy"
                size="xl"
                class="shadow-sm"
              />
              <div
                class="flex-1 bg-neutral-100/60 dark:bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80"
              >
                <div class="py-4 px-3 text-muted">What's new, Petro?</div>

                <div class="flex items-center gap-1 px-2 pb-2">
                  <UTooltip text="Photo" arrow>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="lucide:image"
                    />
                  </UTooltip>
                  <UTooltip text="Video" arrow>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="lucide:square-play"
                    />
                  </UTooltip>
                  <UTooltip text="Files" arrow>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="lucide:paperclip"
                    />
                  </UTooltip>
                  <UTooltip text="Feeling" arrow>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="lucide:smile"
                    />
                  </UTooltip>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
      <!-- Sort section -->
      <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-2 px-4">
        <div class="flex gap-2 items-center">
          <span class="text-muted text-sm">{{ t("sort.sort") }}</span>
          <USelect
            v-model="sortModel"
            variant="ghost"
            value-key="id"
            :items="sortItems"
            class="w-48"
          />
        </div>
        <div class="flex gap-2 items-center md:justify-end">
          <span class="text-muted text-sm">Filter</span>
          <USelect
            v-model="currentFeed"
            @update:modelValue="handleFilter"
            variant="ghost"
            value-key="id"
            :items="filterItems"
            class="w-48"
          >
          </USelect>
        </div>
      </div>
      <!-- Post section -->

      <div v-if="getCurrentTabText" class="text-2xl font-bold px-4">
        {{ getCurrentTabText }}
      </div>

      <div class="w-full pb-10">
        <SkeletonPost v-if="!firstLoad" :items="3" />
        <template v-else-if="data.length > 0">
          <div v-for="(item, index) in data" :key="item.id">
            <ExampleFeedItem :item="item" :index="index" />
          </div>
        </template>
        <UEmpty
          v-else
          icon="lucide:pencil-line"
          title="No posts found"
          description="It looks like you haven't added any posts. Create one to get started."
        />
      </div>
      <!-- </BaseInfiniteScrollPage> -->
    </div>

    <!-- Right  -->
    <aside
      v-if="!isMobile"
      class="w-full lg:w-80 shrink-0 lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide hidden lg:flex flex-col gap-8"
    >
      <!-- INVITATIONS -->
      <div>
        <div
          class="flex items-center justify-between text-xs font-bold text-muted mb-4 px-2"
        >
          <span>INVITATIONS</span>
          <UBadge color="error">2</UBadge>
        </div>

        <div class="p-5 rounded-md border border-default">
          <div class="flex flex-col gap-4">
            <div
              class="h-32 bg-slate-800 rounded-xl bg-cover bg-center relative"
              style="
                background-image: url(https://images.unsplash.com/photo-1579762593217-46655e4e7efc?q=80&w=1217&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D);
              "
            >
              <div
                class="absolute inset-0 bg-black/40 rounded-xl flex items-end p-3"
              >
                <p class="text-white font-bold text-sm leading-tight">
                  How To Build A<br />Strong Company
                </p>
              </div>
              <UAvatar
                :src="getMockAvatarById(13)"
                loading="lazy"
                size="lg"
                class="rounded-full border-2 border-white absolute top-3 left-3"
              />
            </div>
            <div class="flex gap-2">
              <UButton
                class="flex-1 justify-center"
                color="primary"
                variant="solid"
                >Accept Invitation</UButton
              >
              <UButton
                class="text-sm rounded-full"
                variant="soft"
                color="neutral"
                icon="lucide:x"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- REQUESTS -->
      <div>
        <div
          class="flex items-center justify-between text-xs font-bold text-muted mb-4 px-2"
        >
          <span>REQUESTS</span>
          <UBadge color="error">2</UBadge>
        </div>
        <div class="p-5 rounded-md border border-default">
          <div class="flex flex-col gap-4">
            <div>
              <div class="flex gap-3 mb-4">
                <UAvatar
                  :src="getMockAvatarById(70)"
                  loading="lazy"
                  size="xl"
                  :chip="{
                    inset: true,
                    color: 'success',
                  }"
                />
                <p class="text-sm text-muted">
                  <span class="font-bold text-neutral-800 dark:text-white"
                    >Tyrell Barrows</span
                  >
                  wants to add you to friends
                </p>
              </div>
              <div class="flex gap-3">
                <UButton
                  class="flex-1 justify-center"
                  color="primary"
                  variant="solid"
                  >Accept</UButton
                >
                <UButton
                  class="flex-1 justify-center"
                  variant="soft"
                  color="neutral"
                  >Decline</UButton
                >
              </div>
            </div>
            <div>
              <div class="flex gap-3 mb-4">
                <UAvatar
                  :src="getMockAvatarById(5)"
                  loading="lazy"
                  size="xl"
                  :chip="{
                    inset: true,
                    color: 'warning',
                  }"
                />
                <p class="text-sm text-muted">
                  <span class="font-bold text-neutral-800 dark:text-white"
                    >Selena Gomez</span
                  >
                  wants to add you to friends
                </p>
              </div>
              <div class="flex gap-3">
                <UButton
                  class="flex-1 justify-center"
                  color="primary"
                  variant="solid"
                  >Accept</UButton
                >
                <UButton
                  class="flex-1 justify-center"
                  variant="soft"
                  color="neutral"
                  >Decline</UButton
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTACTS -->
      <div>
        <div
          class="flex items-center justify-between text-xs font-bold text-muted mb-4 px-2"
        >
          <span>CONTACTS</span>
          <UBadge color="neutral" variant="outline">68</UBadge>
        </div>

        <div class="p-4 rounded-lg border border-default flex flex-col gap-3">
          <UUser
            v-for="(item, index) in contactItems"
            :key="index"
            :name="item.name"
            :avatar="{
              src: item.avatar,
            }"
            to="/"
            :chip="
              item.online
                ? {
                    color: 'success',
                    position: 'top-right',
                  }
                : false
            "
            size="xl"
          />
        </div>
      </div>
    </aside>
  </main>
</template>
