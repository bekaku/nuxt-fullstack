import type { ChartPosition } from '~/types/chart'

export interface EchartLegendConfig {
  show: boolean
  orient: 'horizontal' | 'vertical'
  left?: string | number
  right?: string | number
  top?: string | number
  bottom?: string | number
}

export const normalizeCssSize = (value: string | undefined, fallback: string): string => {
  if (!value || value === 'auto') {
    return fallback
  }
  if (/^\d+(\.\d+)?$/.test(value)) {
    return `${value}px`
  }
  return value
}

export const resolveDarkMode = (dark: boolean | undefined, mode: string | undefined, isDark: boolean): boolean => {
  return dark === true || mode === 'dark' || isDark
}

export const echartTextColor = (darkMode: boolean): string => {
  return darkMode ? '#e4e4e7' : '#3f3f46'
}

export const echartSplitColor = (darkMode: boolean): string => {
  return darkMode ? '#3f3f46' : '#e4e4e7'
}

export const echartTooltipBg = (darkMode: boolean): string => {
  return darkMode ? '#27272a' : '#ffffff'
}

export const toLegendConfig = (position: ChartPosition = 'bottom', show = true): EchartLegendConfig => {
  switch (position) {
    case 'top':
      return { show, orient: 'horizontal', left: 'center', top: 0 }
    case 'left':
      return { show, orient: 'vertical', left: 0, top: 'middle' }
    case 'right':
      return { show, orient: 'vertical', right: 0, top: 'middle' }
    default:
      return { show, orient: 'horizontal', left: 'center', bottom: 0 }
  }
}

const ECHART_PALETTES: Record<string, string[]> = {
  palette1: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452'],
  palette2: ['#3f51b5', '#03a9f4', '#4caf50', '#f9ce1d', '#ff4560', '#775dd0', '#00e396'],
  palette3: ['#64748b', '#94a3b8', '#cbd5e1', '#475569', '#94a3b8', '#e2e8f0', '#334155'],
  palette4: ['#8d6e63', '#9e9e9e', '#607d8b', '#4e342e', '#78909c', '#a1887f', '#b0bec5'],
  palette5: ['#78350f', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
  palette6: ['#0f766e', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e0', '#115e59', '#134e4a'],
  palette7: ['#7c3aed', '#a78bfa', '#c4b5fd', '#6d28d9', '#8b5cf6', '#ddd6fe', '#5b21b6'],
  palette8: ['#4e342e', '#6d4c41', '#8d6e63', '#a1887f', '#bcaaa4', '#3e2723', '#5d4037'],
  palette9: ['#8e8cd8', '#6c6cc4', '#a5a5e8', '#5757a8', '#c2c2f0', '#43438c', '#7e7ed2'],
  palette10: ['#647c64', '#7d9b7d', '#93b593', '#4a5d4a', '#a9c7a9', '#365236', '#86a886']
}

export const resolvePalette = (palette: string | undefined, colors: string[] | undefined): string[] | undefined => {
  if (colors && colors.length > 0) {
    return colors
  }
  if (palette && ECHART_PALETTES[palette]) {
    return ECHART_PALETTES[palette]
  }
  return undefined
}
