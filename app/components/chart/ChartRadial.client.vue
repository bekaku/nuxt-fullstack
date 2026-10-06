<script setup lang="ts">
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartPosition, ChartThemePalete, GridPadding } from '~/types/chart'
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
  chartId = 'chart-radial-id',
  height = 'auto',
  width = '100%',
  mode = 'light',
  palette = 'palette1',
  series,
  colors,
  categories,
  showLegend = true,
  legendPosition = 'bottom',
  showDataLabels = true,
  dataLabelsSize = '14px',
  dataValueSize = '18px',
  showDataLabelsName = true,
  showDataLabelsValue = true,
  dataLabelsValueOfsetY = 0,
  startAngle = 0,
  endAngle = 360,
  stokeLineCap = 'round',
  semi = false,
  trackBackgroud = '#f0f0f0',
  trackBackgroudDark = '#383a42',
  valUnit,
  dark = false
} = defineProps<{
  chartId?: string
  height?: string
  width?: string
  showLegend?: boolean
  legendUseSeriesColors?: boolean
  legendOffsetX?: number
  legendOffsetY?: number
  legendFloating?: boolean
  showDataLabels?: boolean
  showDataLabelsName?: boolean
  showDataLabelsValue?: boolean
  dataLabelsSize?: string
  dataValueSize?: string
  dataLabelsValueOfsetY?: number
  legendPosition?: ChartPosition
  labelunit?: string
  stokeLineCap?: 'round' | 'square' | 'butt'
  fillType?: 'fill' | 'gradient'
  endAngle?: number
  startAngle?: number
  mode?: ChartMode
  palette?: ChartThemePalete
  series: number[]
  colors?: string[]
  categories: string[]
  gridPadding?: GridPadding
  semi?: boolean
  hollowBg?: boolean
  hollowSize?: string
  valUnit?: string
  trackBackgroud?: string
  trackBackgroudDark?: string
  dark?: boolean
}>()

const { isDark } = useTheme()
const isDarkMode = computed(() => resolveDarkMode(dark, mode, isDark.value))

const option = computed<EChartsCoreOption>(() => {
  const darkMode = isDarkMode.value
  const textColor = echartTextColor(darkMode)
  const paletteColors = resolvePalette(palette, colors)
  const trackColor = darkMode ? trackBackgroudDark : trackBackgroud
  const values = series ?? []
  const count = values.length

  const isDefaultAngles = startAngle === 0 && endAngle === 360
  const effectiveStartAngle = semi && isDefaultAngles ? 180 : startAngle
  const effectiveEndAngle = semi && isDefaultAngles ? 0 : endAngle

  const ringWidth = count > 1 ? Math.max(8, Math.min(16, Math.floor(64 / count))) : 18
  const ringGap = count > 1 ? 4 : 0
  const sideLegend = showLegend && (legendPosition === 'left' || legendPosition === 'right')
  const outerRadius = semi ? 95 : sideLegend ? 65 : 90
  const center: [string, string] = [
    legendPosition === 'left' && sideLegend ? '62%' : legendPosition === 'right' && sideLegend ? '38%' : '50%',
    semi ? '72%' : '55%'
  ]

  const legend = toLegendConfig(legendPosition, showLegend)

  const echartSeries = values.map((value, index) => {
    const color = paletteColors?.[index % paletteColors.length]
    const showCenterLabel = showDataLabels && count === 1
    return {
      name: categories[index] ?? `${index + 1}`,
      type: 'gauge',
      startAngle: effectiveStartAngle,
      endAngle: effectiveEndAngle,
      min: 0,
      max: 100,
      radius: `${outerRadius - index * (ringWidth + ringGap)}%`,
      center,
      progress: {
        show: true,
        width: ringWidth,
        roundCap: stokeLineCap === 'round',
        itemStyle: color ? { color } : undefined
      },
      axisLine: {
        roundCap: stokeLineCap === 'round',
        lineStyle: {
          width: ringWidth,
          color: [[1, trackColor ?? (darkMode ? '#383a42' : '#f0f0f0')]]
        }
      },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      pointer: { show: false },
      anchor: { show: false },
      title: {
        show: showCenterLabel && showDataLabelsName,
        offsetCenter: [0, semi ? '-5%' : '-10%'],
        color: textColor,
        fontSize: Number.parseInt(dataLabelsSize, 10) || 14
      },
      detail: {
        show: showCenterLabel && showDataLabelsValue,
        valueAnimation: true,
        offsetCenter: [0, dataLabelsValueOfsetY > 0 ? `${dataLabelsValueOfsetY}%` : semi ? '25%' : '15%'],
        formatter: `{value}${valUnit ?? ''}`,
        color: color ?? textColor,
        fontSize: Number.parseInt(dataValueSize, 10) || 18,
        fontWeight: 'bold'
      },
      data: [{ value, name: categories[index] ?? `${index + 1}` }]
    }
  })

  return {
    color: paletteColors,
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'item',
      backgroundColor: echartTooltipBg(darkMode),
      borderColor: echartSplitColor(darkMode),
      textStyle: { color: textColor },
      formatter: (params: unknown): string => {
        const entry = params as { name?: string, value?: unknown }
        return `${entry.name ?? ''}: ${entry.value ?? ''}${valUnit ?? ''}`
      }
    },
    legend: {
      ...legend,
      data: categories.slice(0, count),
      textStyle: { color: textColor }
    },
    series: echartSeries
  }
})

const chartStyle = computed(() => ({
  width: normalizeCssSize(width, '100%'),
  height: normalizeCssSize(height, semi ? '280px' : '350px')
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
