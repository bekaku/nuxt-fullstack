<script setup lang="ts">
import VChart from 'vue-echarts'
import type { EChartsCoreOption } from 'echarts/core'
import type { ChartMode, ChartPosition, ChartThemePalete, IChartSeries, Strokestyle } from '~/types/chart'
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
  chartId = 'chartId',
  height = 'auto',
  width = 'auto',
  showLegend = true,
  legendPosition = 'bottom',
  type = 'area',
  mode = 'light',
  palette = 'palette1',
  series = [],
  colors = [],
  dark = false,
  showDataLabels = false,
  labelRotate = 0,
  yaxisShow = true,
  yaxisTickamount = 5,
  xaxisTickamount = 0,
  xaxisDecimalsInFloat = 0,
  yaxisDecimalsInFloat = 0,
  categories,
  strokestyle = 'smooth',
  strokeWidth = 1,
  sparkline = false,
  annotationsYaxis = [],
  annotationsXaxis = [],
  minYVal = 0,
  maxYVal,
  showToolbar = false,
  zoom = false,
  horizontal = false,
  opacity = 0.3
} = defineProps<{
  chartId?: string
  height?: string
  width?: string
  labelunit?: string
  showLegend?: boolean
  legendUseSeriesColors?: boolean
  legendPosition?: ChartPosition
  type?: 'area' | 'bar' | 'line'
  mode?: ChartMode
  palette?: ChartThemePalete
  series?: IChartSeries[]
  colors?: string[]
  dark?: boolean
  showDataLabels?: boolean
  labelRotate?: number
  yaxisShow?: boolean
  yaxisTickamount?: number
  xaxisTickamount?: number
  xaxisDecimalsInFloat?: number
  yaxisDecimalsInFloat?: number
  categories: string[]
  strokestyle?: Strokestyle
  strokeWidth?: number
  sparkline?: boolean
  annotationsYaxis?: any[]
  annotationsXaxis?: any[]
  minYVal?: number
  maxYVal?: number
  showToolbar?: boolean
  zoom?: boolean
  horizontal?: boolean
  opacity?: number
}>()

const { isDark } = useTheme()
const isDarkMode = computed(() => resolveDarkMode(dark, mode, isDark.value))

const formatDecimal = (decimals: number) => {
  return (value: unknown): string => {
    const num = Number(value)
    if (Number.isNaN(num)) {
      return `${value ?? ''}`
    }
    return decimals > 0 ? num.toFixed(decimals) : `${num}`
  }
}

const option = computed<EChartsCoreOption>(() => {
  const darkMode = isDarkMode.value
  const textColor = echartTextColor(darkMode)
  const splitColor = echartSplitColor(darkMode)
  const paletteColors = resolvePalette(palette, colors)
  const legend = toLegendConfig(legendPosition, showLegend && !sparkline)

  const markLineData = [
    ...annotationsYaxis.map((item) => ({
      yAxis: item.y ?? item.yAxis,
      name: item.label?.text ?? item.name,
      lineStyle: {
        color: item.borderColor ?? splitColor,
        type: item.strokeDashArray ? 'dashed' : 'solid'
      }
    })),
    ...annotationsXaxis.map((item) => ({
      xAxis: item.x ?? item.xAxis,
      name: item.label?.text ?? item.name,
      lineStyle: {
        color: item.borderColor ?? splitColor,
        type: item.strokeDashArray ? 'dashed' : 'solid'
      }
    }))
  ]

  const echartSeries = (series ?? []).map((s, index) => {
    const color = paletteColors?.[index % paletteColors.length]
    const label = showDataLabels
      ? {
          show: true,
          color: textColor,
          position: (horizontal ? 'right' : 'top') as 'right' | 'top'
        }
      : undefined
    if (type === 'bar') {
      return {
        name: s.name,
        type: 'bar',
        data: s.data,
        barMaxWidth: 28,
        itemStyle: color ? { color, borderRadius: [3, 3, 0, 0] } : undefined,
        label,
        markLine: markLineData.length > 0 ? { silent: true, symbol: 'none', data: markLineData } : undefined
      }
    }
    return {
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: strokestyle === 'smooth',
      step: strokestyle === 'stepline' ? 'middle' : false,
      showSymbol: false,
      symbolSize: 6,
      lineStyle: {
        width: strokeWidth,
        ...(color ? { color } : {})
      },
      itemStyle: color ? { color } : undefined,
      areaStyle: type === 'area' ? { opacity } : undefined,
      label,
      markLine: markLineData.length > 0 ? { silent: true, symbol: 'none', data: markLineData } : undefined
    }
  })

  const categoryAxis = {
    type: 'category',
    show: !sparkline,
    data: categories,
    axisLine: { lineStyle: { color: splitColor } },
    axisTick: { show: false },
    axisLabel: {
      color: textColor,
      rotate: labelRotate,
      formatter: formatDecimal(xaxisDecimalsInFloat),
      ...(xaxisTickamount > 0 && categories.length > xaxisTickamount
        ? { interval: Math.max(0, Math.floor(categories.length / xaxisTickamount) - 1) }
        : {})
    }
  }

  const valueAxis = {
    type: 'value',
    show: !sparkline && yaxisShow,
    min: minYVal,
    ...(maxYVal !== undefined ? { max: maxYVal } : {}),
    splitNumber: yaxisTickamount,
    axisLabel: { color: textColor, formatter: formatDecimal(yaxisDecimalsInFloat) },
    splitLine: { lineStyle: { color: splitColor } }
  }

  return {
    color: paletteColors,
    backgroundColor: 'transparent',
    animationDuration: 800,
    tooltip: {
      trigger: 'axis',
      backgroundColor: echartTooltipBg(darkMode),
      borderColor: splitColor,
      textStyle: { color: textColor },
      valueFormatter: (value: unknown) => (Array.isArray(value) ? value.join(', ') : `${value ?? ''}`)
    },
    legend: {
      ...legend,
      textStyle: { color: textColor }
    },
    grid: {
      containLabel: true,
      borderColor: splitColor
    },
    toolbox: showToolbar
      ? {
          show: true,
          iconStyle: { borderColor: textColor },
          feature: {
            saveAsImage: {},
            dataZoom: {},
            restore: {}
          }
        }
      : undefined,
    dataZoom: zoom ? [{ type: 'inside' }, { type: 'slider' }] : undefined,
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: echartSeries
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
