<script lang="ts" setup>
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartPosition, ChartThemePalete, Strokestyle } from '~/types/chart'
import {
  echartSplitColor,
  echartTextColor,
  echartTooltipBg,
  normalizeCssSize,
  resolveDarkMode,
  resolvePalette,
  toLegendConfig
} from './echartTheme'

const {
  chartId = 'chart-pie-id',
  height = 'auto',
  width = 'auto',
  showLegend = true,
  legendPosition = 'bottom',
  type = 'pie',
  mode = 'light',
  palette = 'palette1',
  series,
  colors,
  showDataLabels = true,
  categories,
  strokeWidth = 1,
  dark = false
} = defineProps<{
  chartId?: string
  height?: string
  width?: string
  labelunit?: string
  showLegend?: boolean
  legendUseSeriesColors?: boolean
  legendPosition?: ChartPosition
  type?: 'pie' | 'donut'
  mode?: ChartMode
  palette?: ChartThemePalete
  series: number[]
  colors?: string[]
  dark?: boolean
  showDataLabels?: boolean
  labelRotate?: number
  categories: string[]
  strokestyle?: Strokestyle
  strokeWidth?: number
}>()

const { isDark } = useTheme()
const isDarkMode = computed(() => resolveDarkMode(dark, mode, isDark.value))

const option = computed<EChartsCoreOption>(() => {
  const darkMode = isDarkMode.value
  const textColor = echartTextColor(darkMode)
  const splitColor = echartSplitColor(darkMode)
  const paletteColors = resolvePalette(palette, colors)
  const legend = toLegendConfig(legendPosition, showLegend)
  const values = series ?? []

  return {
    color: paletteColors,
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'item',
      backgroundColor: echartTooltipBg(darkMode),
      borderColor: splitColor,
      textStyle: { color: textColor }
    },
    legend: {
      ...legend,
      data: categories,
      textStyle: { color: textColor }
    },
    series: [
      {
        type: 'pie',
        radius: type === 'donut' ? ['45%', '70%'] : '62%',
        center: ['50%', '50%'],
        data: categories.map((name, index) => ({
          name,
          value: values[index] ?? 0
        })),
        label: {
          show: showDataLabels,
          color: textColor
        },
        labelLine: { show: showDataLabels },
        itemStyle: {
          borderRadius: type === 'donut' ? 4 : 0,
          borderColor: darkMode ? '#18181b' : '#ffffff',
          borderWidth: strokeWidth
        },
        emphasis: {
          scale: true,
          scaleSize: 4
        }
      }
    ]
  }
})

const chartStyle = computed(() => ({
  width: normalizeCssSize(width, '100%'),
  height: normalizeCssSize(height, '350px')
}))
</script>
<template>
  <VChart
    :id="chartId"
    :option="option"
    :style="chartStyle"
    autoresize
  />
</template>
