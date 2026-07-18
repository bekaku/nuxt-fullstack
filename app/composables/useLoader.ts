import { LazyBaseLoader } from '#components'

let loaderInstance: any = null
export const useLoader = () => {
  const overlay = useOverlay()
  if (!loaderInstance) {
    loaderInstance = overlay.create(LazyBaseLoader)
  }
  const open = (props?: { title?: string; description?: string; icon?: string; iconClass?: string }) => {
    loaderInstance.open(props)
  }

  const close = () => {
    if (loaderInstance) {
      loaderInstance.close()
    }
  }

  return {
    open,
    close
  }
}
