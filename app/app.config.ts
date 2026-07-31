export default defineAppConfig({
  icon: {
    size: '18px', // e.g., '1.5em', '24px', '1.5rem'
  },
  ui: {
    colors: {
      primary: 'teal',
      neutral: 'mist',
      info: 'sky',
      secondary: 'slate',
      success: 'success',
      warning: 'warning',
      error: 'error'
    },
    avatar: {
      defaultVariants: {
        size: 'xl',
      }
    },
    button: {
      slots: {
        base: [
          'font-normal',
        ],
      },
      variants: {
        size: {
          md: {
            leadingIcon: 'size-5',
            trailingIcon: 'size-5'
          },
        },
      },
      compoundVariants: [
      ],
      defaultVariants: {
        variant: 'subtle',
        color: 'neutral',
        size: 'md'
      }
    },
    badge: {
      defaultVariants: {
        color: 'primary',
        variant: 'soft',
        size: 'md'
      }
    },
    card: {
      slots: {
        root: 'overflow-visible',
        header: 'p-4 sm:px-4',
        body: 'p-4! sm:p-4!',
      },
      variants: {
        variant: {
          solid: {
            root: 'bg-inverted text-inverted',
            title: 'text-inverted',
            description: 'text-dimmed'
          },
          outline: {
            root: 'bg-default'
          },
          soft: {
            root: 'bg-elevated/40 '
          },
          subtle: {
            root: 'bg-elevated/40'
          }
        }
      }
    },
    fileUpload: {
      variants: {
        dropzone: {
          true: 'border-dashed data-[dragging=true]:bg-elevated/55'
        },
      }
    },
    link: {
      variants: {
        active: {
          true: 'text-primary',
          false: 'text-primary'
        },
      },
      compoundVariants: [
        {
          class: [
            'hover:text-primary hover:underline',
          ]
        }
      ]
    }
  }
})
