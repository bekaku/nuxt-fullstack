import type { AppNavigationMenuItem } from "~/types/common";
import type { FavoriteMenu } from "~/types/models";

export const useMenu = () => {
  const nuxtApp = useNuxtApp();
  const t = nuxtApp.$i18n.t;
  const { hasPermissionLazy } = useRbac();
  const { auth, appNavigations, setAppNavigations } = useAuth();
  const appNavs: AppNavigationMenuItem[][] = [
    [
      {
        label: t("nav.dashboard"),
        icon: "lucide:home",
        to: "/",
      },
      {
        label: t("nav.developers"),
        icon: "lucide:file-code",
        slot: 'developer-label' as const,
        defaultOpen: true,
        children: [
          {
            label: t("model_permission"),
            icon: "lucide:lock-keyhole",
            to: "/permission",
            permissions: ['permission_list'],
          },
        ]
      },
      {
        label: t("nav.forAdmin"),
        icon: "lucide:folder-cog",
        slot: 'admin-label' as const,
        defaultOpen: true,
        children: [
          {
            label: t("nav.userRole"),
            icon: "lucide:users",
            to: "/app-role",
            permissions: ['app_role_list'],
          },
          {
            label: t("nav.appUser"),
            icon: "lucide:user",
            to: "/app-user",
            permissions: ['app_user_list'],
          },
        ]
      },
      {
        label: t("nav.more"),
        icon: 'lucide:more-horizontal',
        slot: 'more-label' as const,
        defaultOpen: true,
        children: [
          {
            label: t("drive.title"),
            icon: "lucide:folder",
            to: "/my-drive/folder/0",
            permissions: ['file_manager_manage'],
          },
        ]
      },
    ],
    [
      {
        label: t("base.setting"),
        to: "/settings",
        icon: "i-lucide-settings",
        defaultOpen: true,
        type: "trigger",
        slot: 'settings-label' as const,
        children: [
          {
            label: t('base.general'),
            to: "/settings",
            exact: true,
          },
          {
            label: "Members",
            to: "/settings/members",
          },
          {
            label: t('base.notification'),
            to: "/settings/notifications",
          },
          {
            label: t('base.security'),
            to: "/settings/security",
          },
        ],
      },
      {
        label: 'Example',
        icon: 'lucide:file',
        defaultOpen: true,
        slot: 'example-label' as const,
        children: [
          {
            label: "Blank",
            icon: "lucide:panels-top-left",
            to: "/example/blank",
          },
          {
            label: "Chats",
            icon: "lucide:message-circle",
            to: "/example/chats",
          },
          {
            label: "Charts",
            icon: "lucide:chart-line",
            to: "/example/charts",
          },
          {
            label: "Content text",
            icon: "lucide:file-text",
            to: "/example/content-text",
          },
          {
            label: "Customers",
            icon: "i-lucide-users",
            to: "/example/customers",
          },
          {
            label: "Forms",
            icon: "i-lucide-card-sim",
            to: "/example/form",
          },
          {
            label: "Inbox",
            icon: "i-lucide-inbox",
            to: "/example/inbox",
            badge: "4",
          },
          {
            label: "Infinite scroll",
            icon: "lucide:mouse-left",
            to: "/example/infinite-scroll",
          },
          {
            label: "Infinite page",
            icon: "lucide:mouse-left",
            to: "/example/infinite-scroll-page",
          },
          {
            label: "File viewer",
            icon: 'lucide:square-play',
            to: "/example/file-viewer",
          },
          {
            label: "Modal",
            icon: 'lucide:copy',
            to: "/example/modal",
          },
          {
            label: "Markdown editor",
            icon: 'bi:markdown',
            to: "/example/markdown-editor",
          },
          {
            label: "RBAC",
            icon: 'lucide:user-key',
            to: "/example/rbac",
          },
          {
            label: "Social",
            icon: "lucide:panel-right",
            to: "/example/feed",
          },
          {
            label: "Transitions",
            icon: "lucide:layers",
            to: "/example/transitions",
          },
          {
            label: "Upload files",
            icon: "lucide:cloud-upload",
            to: "/example/upload-files",
          },
          {
            label: "Websocket",
            icon: "lucide:unplug",
            to: "/example/websocket",
          },

        ]
      },
      {
        label: "Test Page",
        icon: "lucide:bug",
        to: "/test",
      },
    ]
  ];

  const isPermitted = async (permissions?: string[]): Promise<boolean> => {
    if (!permissions || permissions.length === 0) return true;
    return await hasPermissionLazy({ permissions });
  }
  const getFavoriteNavigations = computed<AppNavigationMenuItem[][]>(() => {

    if (!auth.value || !auth.value.favoriteMenus || auth.value.favoriteMenus.length == 0) {
      return []
    }
    const items: AppNavigationMenuItem[] = [];

    for (const menu of auth.value.favoriteMenus) {
      if (menu.url) {
        const result = findByUrl(appNavigations.value as AppNavigationMenuItem[][], menu.url);
        if (result) {
          items.push({ ...result });
        }
      }
    }

    if (items.length > 0) {
      return [
        [
          {
            label: t('base.faveoriteMenuTitle'),
            icon: 'lucide:star',
            slot: 'favorite-label' as const,
            defaultOpen: false,
            badge: items.length,
            children: items

          }
        ]
      ];
    }

    return [];
  });
  const filterNavItems = async (items: AppNavigationMenuItem[]): Promise<AppNavigationMenuItem[]> => {
    const filteredItems: AppNavigationMenuItem[] = [];

    for (const item of items) {
      const newItem = { ...item };

      const hasAccess = await isPermitted(newItem.permissions);
      if (!hasAccess) continue;

      if (newItem.children) {
        newItem.children = await filterNavItems(newItem.children);

        if (newItem.children.length === 0) {
          continue;
        }
      }

      filteredItems.push(newItem);
    }

    return filteredItems;
  }
  const initialAppNav = async (): Promise<boolean> => {
    const aclFinal: AppNavigationMenuItem[][] = [];

    for (const navGroup of appNavs) {
      const filteredGroup = await filterNavItems(navGroup);

      if (filteredGroup.length > 0) {
        aclFinal.push(filteredGroup);
      }
    }

    if (aclFinal.length > 0) {
      setAppNavigations(aclFinal);
    }
    return true;
  }

  const isFaveroteExist = (url: string) => {
    if (!auth.value || !auth.value.favoriteMenus || auth.value.favoriteMenus.length == 0) {
      return false
    }
    return auth.value.favoriteMenus.some((item: FavoriteMenu) => item.url === url);
  }
  const getFaveroteIndex = (url: string) => {
    if (!auth.value || !auth.value.favoriteMenus || auth.value.favoriteMenus.length == 0) {
      return
    }
    return auth.value.favoriteMenus.findIndex((item: FavoriteMenu) => item.url === url);
  }
  const findByUrl = (groups: AppNavigationMenuItem[][], to: string): AppNavigationMenuItem | null => {
    const searchRecursive = (items: AppNavigationMenuItem[]): AppNavigationMenuItem | null => {
      for (const item of items) {
        if (item.to === to) return item;
        if (item.children) {
          const found = searchRecursive(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    for (const group of groups) {
      const found = searchRecursive(group);
      if (found) return found;
    }

    return null;
  }
  return {
    appNavs,
    initialAppNav,
    isFaveroteExist,
    getFaveroteIndex,
    findByUrl,
    getFavoriteNavigations
  }

}
