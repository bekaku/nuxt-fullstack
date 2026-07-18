import type { AppNavigationMenuItem, LoginRequest, ResponseMessage } from '~/types/common';
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
  const favoriteMenus = useState<FavoriteMenu[]>('auth:favoriteMenus', () => []);
  const isLoggedIn = computed(() => !!auth.value);
  const loginedAvatar = computed(() => getMockAvatarByIndex(19));
  const loginedDisplay = computed(() => auth.value?.username || auth.value?.email);
  const ttlDays = Number(refreshTokenDays) || 7;
  const loggedInCookie = useCookie('is_logged_in', {
    maxAge: 60 * 60 * 24 * ttlDays,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  const setAuth = (payload: AppUser) => {
    auth.value = payload;
  };

  const clearAuth = () => {
    auth.value = null;
  };

  const setAppNavigations = (items: AppNavigationMenuItem[]) => {
    appNavigations.value = items;
  };

  const setFavoriteMenus = (items?: FavoriteMenu[]) => {
    favoriteMenus.value = items || [];
  };

  const addFavoriteMenus = (item: FavoriteMenu) => {
    favoriteMenus.value.push(item);
  };

  const signin = async (req: LoginRequest): Promise<AppUser | null> => {
    loading.value = true;

    // ย้ายมาเรียกข้างในนี้ จะได้ไม่ทำงานตอน Middleware โหลด
    const { getDeviceId } = useAppDevice();
    const deviceId = await getDeviceId();

    try {
      const response = await api<AppUser>('/api/auth/login', {
        method: 'POST',
        body: {
          emailOrUsername: req.emailOrUsername,
          password: req.password,
          loginFrom: 'WEB',
          deviceId: deviceId,
        }
      });

      if (response) {
        setAuth(response);
        loggedInCookie.value = 'true';
      }

      return response; // ไม่จำเป็นต้องห่อ new Promise
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

    // ย้าย Composables ที่เกี่ยวกับการแสดงผล/UI มาไว้ในนี้
    const { appNavigateTo } = useBase();
    const confirm = useConfirmDialog();
    const loader = useLoader();

    const conf = await confirm({
      title: t("app.monogram"),
      description: t("helper.logoutConfirm"),
    });

    if (conf) {
      loader.open();
      await api<ResponseMessage>('/api/auth/logout', {
        method: 'POST',
      });

      clearAuth();
      loggedInCookie.value = null;
      await sendBroradcastChanelReload();
      loader.close();
      appNavigateTo('/auth/login', { replace: true });
    }
    return true;
  };

  const fetchMe = async (): Promise<AppUser | null> => {
    try {
      const res = await api<AppUser>('/api/auth/me', {
        method: 'GET',
      });
      setAuth(res);
      return res;
    } catch {
      clearAuth();
      return null;
    }
  };

  return {
    auth,
    isLoggedIn,
    loading,
    signin,
    signout,
    fetchMe,
    setAuth,
    clearAuth,
    appNavigations,
    setAppNavigations,
    favoriteMenus,
    addFavoriteMenus,
    loginedAvatar,
    loginedDisplay
  };
};
