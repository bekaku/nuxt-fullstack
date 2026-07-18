<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { AppNavigationMenuItem } from "~/types/common";

const { createFavorite, deleteFavorite } = useFavoriteMenuApi();

const route = useRoute();
const toast = useToast();
const { t } = useLang();
const appStore = useAppStore();
const { addFavoriteMenus } = appStore;
const { appNavigations, favoriteMenus } = storeToRefs(appStore);
const { getFavoriteNavigations, findByUrl, getFaveroteIndex, isFaveroteExist } =
  useMenu();
const open = ref(false);
const groups = computed(() => [
  {
    id: "links",
    label: t("base.goTo"),
    items: appNavigations.value.flat() as NavigationMenuItem[][],
  },
  {
    id: "code",
    label: "Code",
    items: [
      {
        id: "source",
        label: "View page source",
        icon: "i-simple-icons-github",
        to: `https://github.com/nuxt-ui-templates/dashboard/blob/main/app/pages${route.path === "/" ? "/index" : route.path}.vue`,
        target: "_blank",
      },
    ],
  },
]);

onMounted(async () => {
  const cookie = useCookie("cookie-consent");
  if (cookie.value === "accepted") {
    return;
  }

  toast.add({
    title: t("helper.cookiePolicyText"),
    duration: 0,
    close: false,
    actions: [
      {
        label: t("base.accept"),
        color: "neutral",
        variant: "outline",
        onClick: () => {
          cookie.value = "accepted";
        },
      },
      {
        label: t("base.optOut"),
        color: "neutral",
        variant: "ghost",
      },
    ],
  });
});

const onFav = async (e: any, item: AppNavigationMenuItem) => {
  appPreventDefult(e);
  if (!item || !item.to) {
    return;
  }
  const to = item.to as string;
  const existIndex = getFaveroteIndex(to);
  if (existIndex < 0) {
    const result = findByUrl(
      appNavigations.value as AppNavigationMenuItem[][],
      to,
    );
    if (result) {
      addFavoriteMenus({
        url: to,
      });
      await createFavorite({
        url: to,
      });
    }
  } else {
    toast.add({
      description: t("error.menuAlreadyInFavorite"),
      icon: "lucide:info",
      color: "warning",
    });
  }
};
const onUnFav = async (e: any, item: AppNavigationMenuItem) => {
  appPreventDefult(e);
  if (!item || !item.to) {
    return;
  }
  const to = item.to as string;
  const existIndex = getFaveroteIndex(to);
  if (existIndex >= 0) {
    favoriteMenus.value.splice(existIndex, 1);
    await deleteFavorite({
      url: to,
    });
    toast.add({
      description: t("success.success"),
      icon: "lucide:check",
      color: "success",
    });
  }
};
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          :label="$t('base.search')"
          class="bg-transparent ring-default"
        />

        <template v-if="getFavoriteNavigations.length > 0">
          <UNavigationMenu
            :collapsed="collapsed"
            :items="getFavoriteNavigations"
            orientation="vertical"
            tooltip
            class="overflow-hidden"
          >
            <template #item-trailing="{ item }">
              <div
                class="flex -mr-1.5 -my-0.5 translate-x-full group-hover:translate-x-0 has-data-[state=open]:translate-x-0 transition-transform"
              >
                <UButton
                  as="div"
                  icon="lucide:trash"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  class="text-muted hover:text-highlighted hover:bg-accented/50 data-[state=open]:bg-accented/50 mr-1.5 rounded-full"
                  @click="onUnFav($event, item as any)"
                />
              </div>
            </template>
          </UNavigationMenu>
          <USeparator />
        </template>
        <UNavigationMenu
          :collapsed="collapsed"
          :items="appNavigations"
          orientation="vertical"
          highlight
          tooltip
          popover
          class="overflow-x-hidden"
        >
          <template #item-trailing="{ item }">
            <div
              class="flex -mr-1.5 -my-0.5 translate-x-full group-hover:translate-x-0 has-data-[state=open]:translate-x-0 transition-transform"
            >
              <UButton
                as="div"
                icon="lucide:star"
                color="neutral"
                variant="ghost"
                size="xs"
                class="text-muted hover:text-highlighted hover:bg-accented/50 data-[state=open]:bg-accented/50 mr-1.5 rounded-full"
                @click="onFav($event, item as any)"
              />
            </div>
          </template>
        </UNavigationMenu>

        <!-- <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        /> -->
      </template>

      <template #footer="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch
      :groups="groups"
      :placeholder="$t('base.typeCommandForsearch')"
      :color-mode="false"
    />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
