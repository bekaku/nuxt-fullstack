import { useSafeBroadcastChannel } from "./useSafeBroadcastChannel"

export const useAppBroadcastChannels = () => {
  const {
    send: sendReloadBroadcast,
    reopen: reopenReloadBroadcast,
    isClosed,
  } = useSafeBroadcastChannel<boolean>('app-reload-bradcast-channel')
  const sendBroradcastChanelReload = (): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      if (isClosed.value) {
        reopenReloadBroadcast()
      }
      sendReloadBroadcast(true)
      resolve(true)
    })
  }
  return {
    sendBroradcastChanelReload
  }
}
