import type { AppColor, IconSet, IHrefTarget, OgMeta } from "./common";

export interface AvatarProps {
  src?: string;
  spinnerColor?: string;
  color?: string;
  imgBg?: string;
  ratio?: number;
  size?: string;
  square?: boolean;
  rounded?: boolean;
  fetch?: boolean;
  bordered?: boolean;
  borderedColor?: string;
  borderedWidth?: string;
  alt?: string;
  badge?: BadgeProps
}
export interface BadgeProps {
  color?: AppColor;
  floating?: boolean
  rounded?: boolean
  transparent?: boolean
  text?: string
  cssClass?: string
  cssStyle?: {
    [key: string]: string | number
  }
}
export interface ButtonProps {
  align?: 'left' | 'right' | 'center' | 'around' | 'between' | 'evenly';
  color?: AppColor;
  count?: number;
  disable?: boolean;
  dense?: boolean;
  flat?: boolean;
  full?: boolean;
  glossy?: boolean;
  href?: string;
  label?: string | undefined;
  light?: boolean;
  loading?: boolean;
  noCaps?: boolean;
  outline?: boolean;
  outlineColor?: AppColor | undefined;
  push?: boolean;
  round?: boolean;
  rounded?: boolean;
  size?: string;
  square?: boolean;
  stack?: boolean;
  textColor?: AppColor;
  to?: string;
  target?: IHrefTarget;
  type?: 'button' | 'a' | 'submit' | 'reset';
  unelevated?: boolean;
  textCapitalize?: boolean;
  dark?: boolean;
  rbac?: RBACProps;
  tooltip?: string;
  tooltipColor?: AppColor;
}
export interface RBACProps {
  permissions?: string[];
  condition?: 'any' | 'all' | 'not';
}
export interface TextEllipsisProps {
  content?: string;
  rows?: number | string;
  expandText?: string;
  collapseText?: string;
  charsPerLine?: number | string;
  showMore?: boolean;
  class?: string;
  textClass?: string;
  lineHeight?: string;
  isEscapeHtml?: boolean;
  urlify?: boolean;
}
export interface OgProps {
  item?: OgMeta;
  content?: string;
  short?: boolean;
  showBg?: boolean;
  textLines?: number;
  descriptionLines?: number;
  imageSize?: string;
  imageMaxHeight?: string;
}
