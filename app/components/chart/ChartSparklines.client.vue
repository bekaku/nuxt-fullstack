<script setup lang="ts">
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartThemePalete, GridPadding, IChartSeries, Strokestyle } from '~/types/chart'
import { echartTextColor, echartTooltipBg, normalizeCssSize, resolveDarkMode, resolvePalette } from './echartTheme'

const {
  chartId = 'chart-radar-id',
  height = '160',
  width = 'auto',
  mode = 'light',
  palette = 'palette1',
  series,
  colors,
  categories,
  gridPadding = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  strokeWidth = 1.5,
  opacity = 0.3,
  tooltipEnable = true,
  type = 'area',
  strokestyle = 'straight',
  dark = false
} = defineProps<{
  chartId?: string
  height?: string
  width?: string
  labelunit?: string
  mode?: ChartMode
  palette?: ChartThemePalete
  series: IChartSeries[]
  colors?: string[]
  tooltipEnable?: boolean
  categories: string[]
  gridPadding?: GridPadding
  strokeWidth?: number
  strokestyle?: Strokestyle
  opacity?: number
  dark?: boolean
  type?: 'area' | 'line' | 'bar'
}>()

const { isDark } = useTheme()
const isDarkMode = computed(() => resolveDarkMode(dark, mode, isDark.value))

const option = computed<EChartsCoreOption>(() => {
  const darkMode = isDarkMode.value
  const textColor = echartTextColor(darkMode)
  const paletteColors = resolvePalette(palette, colors)
  const pointCount = Math.max(categories.length, ...(series ?? []).map((item) => item.data.length))
  const pointCategories = categories.length === pointCount
    ? categories
    : Array.from({ length: pointCount }, (_, index) => `${index + 1}`)

  const echartSeries = (series ?? []).map((s, index) => {
    const color = paletteColors?.[index % paletteColors.length]
    if (type === 'bar') {
      return {
        name: s.name,
        type: 'bar',
        data: s.data,
        barMaxWidth: 12,
        itemStyle: color ? { color } : undefined
      }
    }
    return {
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: strokestyle === 'smooth',
      step: strokestyle === 'stepline' ? 'middle' : false,
      showSymbol: false,
      symbolSize: 4,
      lineStyle: {
        width: strokeWidth,
        ...(color ? { color } : {})
      },
      itemStyle: color ? { color } : undefined,
      areaStyle: type === 'area' ? { opacity } : undefined
    }
  })

  return {
    color: paletteColors,
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      show: tooltipEnable,
      trigger: 'axis',
      backgroundColor: echartTooltipBg(darkMode),
      textStyle: { color: textColor },
      axisPointer: { lineStyle: { width: 1 } },
      formatter: (params: unknown): string => {
        const list = Array.isArray(params) ? params : [params]
        const point = list[0] as { dataIndex?: number } | undefined
        const dataIndex = typeof point?.dataIndex === 'number' ? point.dataIndex : 0
        const category = pointCategories[dataIndex] ?? '-'
        const values = list
          .map((item) => {
            const entry = item as { seriesName?: string, value?: unknown }
            const value = Array.isArray(entry.value) ? entry.value.join(', ') : `${entry.value ?? ''}`
            return entry.seriesName ? `${entry.seriesName}: ${value}` : value
          })
          .join('<br/>')
        return `${category}<br/>${values}`
      }
    },
    grid: {
      left: gridPadding?.left ?? 0,
      right: gridPadding?.right ?? 0,
      top: gridPadding?.top ?? 5,
      bottom: gridPadding?.bottom ?? 5
    },
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: type === 'bar',
      data: pointCategories
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 0
    },
    series: echartSeries
  }
})

const chartStyle = computed(() => ({
  width: normalizeCssSize(width, '100%'),
  height: normalizeCssSize(height, '160px')
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
