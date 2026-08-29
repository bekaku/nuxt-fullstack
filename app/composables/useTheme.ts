import type { IThemeItem } from "~/types/common";
type LayoutMode = 'fluid' | 'boxed';
export const useTheme = () => {
  const colorMode = useColorMode()

    const appLayout = useState<LayoutMode>('theme:layout', () => 'fluid');
  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set(_isDark) {
      colorMode.preference = _isDark ? 'dark' : 'light'
    }
  })
  const availableThemes: IThemeItem[] = [
    { key: 'light', text: 'theme.light', icon: 'i-lucide-moon' },
    { key: 'dark', text: 'theme.dark', icon: 'i-lucide-sun' },
    // { key: 'system', text: 'theme.systemTheme', icon: biLaptop },
    // { key: 'realtime', text: 'theme.realtimeTheme', icon: biClock },
  ];

  return {
    colorMode,
    appLayout,
    isDark,
    availableThemes
  }
};
