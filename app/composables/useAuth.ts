import type { AppNavigationMenuItem, LoginRequest, ResponseEntity, ResponseMessage } from '~/types/common';
import type { AppUser, FavoriteMenu } from '~/types/models';
import { useAppBroadcastChannels } from './useAppBroadcastChannels';
import { useBase } from './useBase';

export const useAuth = () => {
  const nuxtApp = useNuxtApp();
  const { refreshTokenDays } = useConfiguration()
  const api = useApi();
  const loading = ref<boolean>(false);
  const t = nuxtApp.$i18n.t;
  const { sendBroradcastChanelReload } = useAppBroadcastChannels();
  const auth = useState<AppUser | null>('auth:user', () => null);
  const appNavigations = useState<AppNavigationMenuItem[]>('auth:navigations', () => []);
  const isLoggedIn = computed(() => !!auth.value);
  const loginedAvatar = computed(() => auth.value?.avatar ? auth.value?.avatar.image : '/images/user.png');
  const loginedDisplay = computed(() => auth.value?.email || auth.value?.username);
  const setAuth = (payload: AppUser) => {
    auth.value = payload;
  };

  const clearAuth = () => {
    auth.value = null;
  };

  const setAppNavigations = (items: AppNavigationMenuItem[]) => {
    appNavigations.value = items;
  };


  const addFavoriteMenus = (item: FavoriteMenu) => {
    if (!auth.value || !auth.value.favoriteMenus) {
      return
    }
    auth.value.favoriteMenus.push(item);
  };
  const removeFavoriteMenus = (index: number) => {
    if (!auth.value || !auth.value.favoriteMenus) {
      return
    }
    auth.value.favoriteMenus.splice(index, 1);;
  };


  const signin = async (req: LoginRequest): Promise<AppUser | null> => {
    loading.value = true;

    // ย้ายมาเรียกข้างในนี้ จะได้ไม่ทำงานตอน Middleware โหลด
    const { getDeviceId } = useAppDevice();
    const deviceId = await getDeviceId();

    try {
      const response = await api<ResponseEntity<AppUser>>('/api/auth/login', {
        method: 'POST',
        body: {
          emailOrUsername: req.emailOrUsername,
          password: req.password,
          loginFrom: 'WEB',
          deviceId: deviceId,
        }
      });

      if (response && response.status == 200 && response.data) {
        setAuth(response.data);
      }

      return response.data || null;
    } catch (error) {
      console.error('Failed to fetch profile', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const signout = async () => {
    const { isServer } = useConfiguration();
    if (isServer()) {
      return;
    }

    const confirm = useConfirmDialog();


    const conf = await confirm({
      title: t("app.monogram"),
      description: t("helper.logoutConfirm"),
    });

    if (conf) {
      await signoutProcess()
    }
  };

  const signoutProcess = async (): Promise<void> => {
    const loader = useLoader();
    loader.open();
    await api<ResponseEntity<void>>('/api/auth/logout', {
      method: 'POST',
    });

    clearAuth();
    await sendBroradcastChanelReload();
    loader.close();
    navigateTo('/auth/login', { replace: true });
  }

  const fetchMe = async (): Promise<AppUser | null> => {
    try {
      const response = await api<ResponseEntity<AppUser>>('/api/auth/me', {
        method: 'GET',
      });
      if (response && response.status == 200 && response.data) {
        setAuth(response.data);
      }

      return response.data || null;
    } catch (e) {
      return null;
    }
  };

  return {
    auth,
    isLoggedIn,
    loading,
    signin,
    signout,
    signoutProcess,
    fetchMe,
    setAuth,
    clearAuth,
    appNavigations,
    setAppNavigations,
    addFavoriteMenus,
    removeFavoriteMenus,
    loginedAvatar,
    loginedDisplay
  };
};
