import type { AppNavigationMenuItem, LoginRequest, ResponseMessage } from '~/types/common';
import type { AppUser, FavoriteMenu } from '~/types/models';
import { useAppBroadcastChannels } from './useAppBroadcastChannels';
import { useBase } from './useBase';
export const useAuth = () => {
  const api = useApi();
  const { sendBroradcastChanelReload } = useAppBroadcastChannels()
  const { getDeviceId } = useAppDevice()
  const loading = ref<boolean>(false);
  const { appNavigateTo } = useBase();
  const { t } = useLang();
  const confirm = useConfirmDialog();
  const loader = useLoader();
  const { inputSanitizeHtml } = useBase()

  const auth = useState<AppUser | null>('auth:user', () => null)
  const appNavigations = useState<AppNavigationMenuItem>('auth:navigations', () => [])
  const favoriteMenus = useState<FavoriteMenu[]>('auth:favoriteMenus', () => [])
  const isLoggedIn = computed(() => !!auth.value)
  const setAuth = (payload: AppUser) => {
    auth.value = payload
  }

  const clearAuth = () => {
    auth.value = null
  }

  const setAppNavigations = (items: AppNavigationMenuItem[][]) => {
    appNavigations.value = items
  }
  const setFavoriteMenus = (items?: FavoriteMenu[]) => {
    favoriteMenus.value = items || [];
  }
  const addFavoriteMenus = (item: FavoriteMenu) => {
    favoriteMenus.value.push(item)
  }
  const signin = async (req: LoginRequest): Promise<AppUser | null> => {

    loading.value = true
    const deviceId = await getDeviceId()
    try {
      const response = await api<AppUser>('/api/auth/login', {
        method: 'POST',
        body: {
          emailOrUsername: inputSanitizeHtml(req.emailOrUsername),
          password: inputSanitizeHtml(req.password),
          loginFrom: 'WEB',
          deviceId: deviceId,
        }
      })

      if (response) {
        setAuth(response)
      }

      return new Promise((resolve) => {
        resolve(response);
      });
    } catch (error) {
      console.error('Failed to fetch profile', error)

      return new Promise((resolve) => resolve(null));
    } finally {
      loading.value = false
    }

  }
  const signout = async () => {
    const conf = await confirm({
      title: t("app.monogram"),
      description: t("helper.logoutConfirm"),
    });
    if (conf) {
      loader.open();
      await api<ResponseMessage>('/api/auth/logout', {
        method: 'POST',
      })

      clearAuth();
      await sendBroradcastChanelReload();
      loader.close();
      appNavigateTo('/auth/login', { replace: true })
    }
    return new Promise((resolve) => resolve(true));
  };

  const fetchMe = async (): Promise<AppUser | null> => {
    try {
      const res = await api<AppUser>('/api/auth/me', {
        method: 'GET',
      })
      setAuth(res)
      return res
    } catch {
      clearAuth()
      return null
    }
  }

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
    favoriteMenus
  }

}
