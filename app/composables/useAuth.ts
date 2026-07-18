import type { LoginRequest, RefreshTokenResponse, ResponseMessage } from '~/types/common';
import { useAppBroadcastChannels } from './useAppBroadcastChannels';
import { useBase } from './useBase';
import { useAuthenStore } from '~/stores/authenStore';
export const useAuth = () => {
  const api = useApi();
  const { sendBroradcastChanelReload } = useAppBroadcastChannels()
  const { setAuthenToken, removeAuthToken, getCurrentUserToken, switchUser } = useAppCookie();
  const { getDeviceId } = useAppDevice()
  const { isServer } = useConfiguration()
  const authenStore = useAuthenStore();
  const loading = ref<boolean>(false);
  const { appNavigateTo } = useBase();
  const { t } = useLang();
  const confirm = useConfirmDialog();
  const loader = useLoader();
  const { inputSanitizeHtml } = useBase()
  const signin = async (req: LoginRequest): Promise<RefreshTokenResponse | null> => {

    loading.value = true
    const deviceId = await getDeviceId()
    try {
      const response = await api<RefreshTokenResponse>('/api/auth/login', {
        method: 'POST',
        body: {
          data: {
            emailOrUsername: inputSanitizeHtml(req.emailOrUsername),
            password: inputSanitizeHtml(req.password),
            loginFrom: 'WEB',
            deviceId: deviceId,
          }
        }
      })

      if (response && response.authenticationToken) {
        await setAuthenToken(response);
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
      const currentToken = await getCurrentUserToken();
      await api<ResponseMessage>('/api/auth/logout', {
        method: 'POST',
        body: {
          data: {
            refreshToken: currentToken?.refreshToken,
          }
        }
      })

      await removeAuthToken();
      await authenStore.onLogout();
      await sendBroradcastChanelReload();
      loader.close();
      appNavigateTo('/auth/login', { replace: true })
    }
    return new Promise((resolve) => resolve(true));
  };

  const onSwithUser = async (userId: number | string) => {
    if (!isServer() || !userId) {
      return;
    }
    await switchUser(userId)
    await sendBroradcastChanelReload();
    setTimeout(() => {
      window.location.replace('/')
    }, 100)
  }
  return {
    loading,
    signin,
    signout,
    onSwithUser
  }

}
