import { defineStore, storeToRefs } from 'pinia';
import { ref } from 'vue';
import type { AppNavigationMenuItem, LabelValue } from "~/types/common";
import type { FavoriteMenu } from '~/types/models';

export const useAppStore = defineStore('appStore', () => {
  // const { initialAppNav } = useMenu();
  const permissions = ref<string[]>([]);
  const appNavigations = ref<AppNavigationMenuItem[][]>([]);

  const favoriteMenus = ref<FavoriteMenu[]>([]);

  const setPermissions = async (items: string[]) => {
    permissions.value = items;
    // await initialAppNav();
  }

  const setAppNavigations = (items: AppNavigationMenuItem[][]) => {
    appNavigations.value = items;
  }
  const setFavoriteMenus = (items?: FavoriteMenu[]) => {
    favoriteMenus.value = items || [];
  }
  const addFavoriteMenus = (item: FavoriteMenu) => {
    favoriteMenus.value.push(item)
  }
  return {
    permissions,
    setPermissions,
    appNavigations,
    setAppNavigations,
    favoriteMenus,
    setFavoriteMenus,
    addFavoriteMenus,
  }
});
