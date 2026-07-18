import { LazyBaseConfirmDialog } from '#components'
import type { ButtonProps } from '@nuxt/ui';

export interface ConfirmDialogOptions {
  title: string
  description?: string
  confirmButton?: ButtonProps;
  cancelButton?: ButtonProps;
}

export const useConfirmDialog = () => {
  const overlay = useOverlay()

  return (options: ConfirmDialogOptions): Promise<boolean> => {
    const modal = overlay.create(LazyBaseConfirmDialog, {
      destroyOnClose: true,
      props: options
    })

    return modal.open()
  }
}
