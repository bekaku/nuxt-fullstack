export default defineAppConfig({
  icon: {
    size: '18px', // e.g., '1.5em', '24px', '1.5rem'
  },
  ui: {
    colors: {
      primary: 'blue',
      neutral: 'neutral',
      info: 'sky',
      secondary: 'slate',
      success: 'success',
      warning: 'warning',
      error: 'error'
    },
    button: {
      variants: {
        size: {
          md: {
            base: 'px-4 py-2 text-sm'
          }
        }
      },
      defaultVariants: {
        variant: 'subtle',
        color: 'neutral'
      }
    },
    card: {
      slots: {
        root: 'overflow-visible',
        header: 'p-4 sm:px-4',
        body: 'p-4! sm:p-4!',
      }
    },
  }
})
