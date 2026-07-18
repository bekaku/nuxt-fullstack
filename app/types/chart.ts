export type PieChartType =
  | 'pie'
  | 'donut'
  | 'bar'
  | 'area'
  | 'line'
  | 'radar'
  | 'radialBar';
export type ChartMode = 'light' | 'dark';
export type Strokestyle = 'smooth' | 'straight' | 'stepline';
export type ChartPosition = 'top' | 'bottom' | 'left' | 'right';
export type ChartThemePalete =
  | 'palette1'
  | 'palette2'
  | 'palette3'
  | 'palette4'
  | 'palette5'
  | 'palette6'
  | 'palette7'
  | 'palette8'
  | 'palette9'
  | 'palette10';
export interface IChartSeries {
  name: string
  data: number[]
  type?: string | null
  year?: string | null
  group?: string | null
}
export interface ISeriresCategories {
  series: IChartSeries[]
  categories: string[]
  colors?: string[] | undefined | null
  max?: number | undefined
}
export interface ISimpleChartSeries {
  series: number[]
  categories: string[]
  colors?: string[]
}
export interface GridPadding {
  top?: number
  right?: number
  bottom?: number
  left?: number
}
export interface SparkLineChartProps {
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
}
export interface AreaChartProps {
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
}
export interface RadialChartProps {
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
}
export interface RadarChartProps {
  chartId?: string;
  height?: string;
  width?: string;
  labelunit?: string;
  showLegend?: boolean;
  legendUseSeriesColors?: boolean;
  legendPosition?: ChartPosition;
  mode?: ChartMode;
  palette?: ChartThemePalete;
  series: IChartSeries[];
  colors?: string[];
  showDataLabels?: boolean;
  labelRotate?: number;
  categories: string[];
  yaxisShow?: boolean;
  yaxisTickamount?: number;
  xaxisTickamount?: number;
  gridPadding?: GridPadding;
  yaxisMax?: number;
  yaxisMin?: number;
  markers?: number;
  strokeWidth?: number;
  gridColors?: string[];
  opacity?: number;
  dark?: boolean;
}
export interface PieCharProps {
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
}
