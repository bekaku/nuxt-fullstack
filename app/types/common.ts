import type { AvatarProps, IconProps, NavigationMenuItem } from "@nuxt/ui";
import type { AppUser } from "./models";
import type { RBACProps } from "./props";

/* eslint-disable no-unused-vars */
export enum HttpMethod {
  GET,
  POST,
  PUT,
  DELETE,
}
export enum CrudListDataType {
  TEXT,
  HTML,
  IMAGE,
  AVATAR,
  STATUS,
  DATE,
  DATE_TIME,
  LINKABLE,
  BASE_TOOL,
  NUMBER_FORMAT,
  ICON,
  FUNCTION,
}
export enum ICrudListHeaderOptionSearchType {
  TEXT,
  NUMBER,
  BOOLEAN,
  DATE,
  DATETIME,
  OPTIONS
}
export type IconSet = 'nuxt' | 'quasar';
export type Date = string;
export type SearchOperation = ':' | '>' | '>=' | '<' | '<=' | '=' | '!=';
export type AppColor = "error" | "primary" | "secondary" | "success" | "info" | "warning" | "neutral"
export type IPageMeta = 'pageName' | 'requiresPermission' | 'breadcrumbs' | 'tabs'
export type AppLocale = 'th' | 'en';
export type WebSocketSubscribeType = 'CHAT_HISTORY' | 'CHAT_MESSAGE' | 'NOTIFICATION_USER';
export type WebSocketBroadcastType =
  'CHAT_HISTORY'
  | 'CHAT_GROUP_USER_INVITE'
  | 'CHAT_GROUP_USER_LEAVE'
  | 'CHAT_MESSAGE'
  | 'CHAT_MESSAGE_REACTION'
  | 'CHAT_MESSAGE_UNSEND'
  | 'CHAT_MESSAGE_TYPING'
  | 'CHAT_MESSAGE_READ'
  | 'CHAT_MESSAGE_READ_ALL'
  | 'USER_NOTIFY'
  | 'USER_NOTIFY_CHAT'
  ;

export interface IPageMetaConfig {
  setTitle?: boolean
}
export type ChatSettingType =
  'NOTIFICATION'
  | 'PIN'
  | 'FAVORITE'
  | 'LEAVE'
  | 'UPDATE_READ_ALL'
  | 'CLEAR_NEW_MESSAGE_NUMBER'
  | 'CLEAR_NEW_MESSAGE_NUMBER_ONLY'
  | 'UPDATE_DATA'
  ;
export type EmojiType = 'LIKE' | 'FIGHTING' | 'LAUGH' | 'WOW' | 'CARE' | 'SAD';
export type ChatType = 'PERSONAL' | 'GROUP';
export type ChatMessageType = 'MEDIA' | 'TEXT' | 'IMAGE' | 'FILE' | 'INVITE' | 'LEAVE' | 'LOCATION';
export interface ChoosePhotoItem {
  webPath?: string;
  file?: File;
}
export type IHttpStatus =
  | '200 OK'
  | '201 Created'
  | '404 Not Found'
  | '401 Unauthorized'
  | '400 Bad Request'
  | '403 Forbidden'
  | '500 Internal Server Error';
export type IMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type ITheme = 'dark' | 'light' | 'system' | 'realtime';
export type ILanguge = 'en' | 'th';
export type ICrudAction = 'new' | 'view' | 'edit' | 'copy';
export type GenerateLinkType = 'post' | 'profile';
export type EmojiSet = 'native' | 'apple' | 'facebook' | 'google' | 'twitter';
export type IResult =
  | '400'
  | '404'
  | '403'
  | '500'
  | '418'
  | 'info'
  | 'success'
  | 'error'
  | 'warning'
  | 'empty';
export type IAlert =
  | 'is-primary'
  | 'is-link'
  | 'is-info'
  | 'is-success'
  | 'is-warning'
  | 'is-danger'
  | 'is-light';
export type IHrefTarget = '_blank' | '_parent' | '_self' | '_top';
export type JwtStatus = 'VALID' | 'EXPIRED' | 'NO_EXPIRATION_TIME' | 'INVALID';
export type MDPreviewTheme = 'default' | 'github' | 'vuepress' | 'mk-cute' | 'smart-blue' | 'cyanosis';
export type MDCodeTheme =
  'atom'
  | 'a11y'
  | 'github'
  | 'gradient'
  | 'kimbie'
  | 'paraiso'
  | 'qtcreator'
  | 'stackoverflow';
export type ResponseDataType = 'arraybuffer' | 'blob' | 'json' | 'download' | 'axiosresponse';
export type FileType = 'pdf' | 'msexcel' | 'msword' | 'mspowerpoint' | 'image' | 'video' | 'zip' | 'msoffice' | 'unknown';
export type IAlign = 'center' | 'left' | 'right';
export type LoginLogType = 'WEB' | 'IOS' | 'ANDROID';
export type ChatHistoryTab = 'ALL' | 'GROUP' | 'FAVORITE';
export type UploadStatus = 'UPLOADING' | 'COMPLETED' | 'FAILED';
export type FileMimeType = 'IMAGE' | 'VIDEO' | 'FILE' | 'DIRECTORY';
export type FilePreviewStyle = 'CARD' | 'LIST' | 'INLINE';

export interface AccessTokenPayload {
  sub: string // app_user.id as string (bigint -> string)
}

export type AppNavigationMenuItem = NavigationMenuItem & RBACProps & {
  children?: AppNavigationMenuItem[];
};
// export interface AppNavigationMenuItem extends NavigationMenuItem, RBACProps {}
export interface ImageDimensions {
  width: number;
  height: number;
}
export interface ImageResizeOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean
}
export interface AppNuxtError {
  statusCode: number
  statusMessage: string
}
export interface AppException {
  status: string;
  message: string;
  errors?: string[];
  timestamp?: string;
}
export interface ApiListResponse {
  totalPages: number;
  totalElements: number;
  currentPage?: number;
  last: boolean;
}
export interface ApiResponse<Type> extends ApiListResponse {
  dataList: Type[];
}
export interface CacheDateAndKey {
  key: string;
  date: string | number;
}
export interface Country {
  code: string;
  no: number;
  name: string;
}
export interface CrudListApiOptions {
  apiEndpoint?: string;
  crudName?: string;
  enpointList?: string;
  endpointDelete?: string;
  enpointPost?: string;
  enpointPut?: string;
  enpointGetOne?: string;
  pathNew?: string;
  pathView?: string;
  pathCopy?: string;
  additionalUri?: string;
  defaultSort?: ISort;
  defaultSorts?: ISort[];
  itemsPerPage?: number;
  fetchListOnload?: boolean;
  pageable?: boolean;
  pageStartZero?: boolean;
  sortable?: boolean;
  concatList?: boolean;
  reverseList?: boolean;
  addUnshift?: boolean;
  preventResetListReload?: boolean;
  headers?: ICrudListHeader[];
}

export interface CrudFormApiOptions {
  apiEndpoint?: string;
  crudName?: string;
  fetchDataLink?: string;
  backLink?: string;
  backToPreviousPath?: boolean;
  actionList?: string;
  actionPost?: string;
  actionPut?: string;
  actionDelete?: string;
  basePath?: string;
  fectchDataOnLoad?: boolean;
  autoPageTitle?: boolean;
  preventRedirectToList?: boolean;
  requestEntityName?: string;
  methodPutIncludeId?: boolean;
}
export interface DefaultAxiosInstance {
  Accept: string;
  //   baseURL: string;
  'Content-Type': string;
  'X-language': string;
  'Code-Version': number;
  'X-Api-Client': string;
  Authorization?: string;
}
export interface ForgotPasswordRequest {
  email: string;
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
}
export interface IMenuPageItem {
  iconText?: string;
  color?: string;
  icon?: string;
  to?: string;
  title?: string;
  caption?: string;
  titleI18n?: boolean;
  permission?: string;
  border?: boolean;
  header?: string;
  headerI18n?: boolean;
  noActiveLink?: boolean;
  userAcl?: boolean;
  canShow?: boolean;
  image?: string;
  imageSize?: number;
  fetchImage?: boolean;
  iconSize?: number;
  iconColor?: string;
  translate?: boolean;
}
export interface IThemeItem {
  key: ITheme;
  text: string;
  icon: string;
}
export interface ILocales {
  name: string;
  iso: ILanguge;
  flag: string;
  icon?: string;
}
export type ISortModeType = 'asc' | 'desc';
export interface ISort {
  mode?: ISortModeType;
  column?: string;
}
export interface ISortMode {
  label: string;
  value: ISortModeType;
}
export interface ITextValue {
  text?: string;
  label?: number | string;
  value: number | string;
}
export interface IPagination {
  current: number;
  itemsPerPage: number;
  totalPages: number;
  totalElements?: number;
  last?: boolean;
  perPageList?: ITextValue[];
}

export interface ICrudListHeaderOption {
  searchable?: boolean;
  fillable?: boolean;
  sortable?: boolean;
  external?: boolean; //LINKABLE
  viewButton?: boolean; //BASE_TOOL
  editButton?: boolean; //BASE_TOOL
  deleteButton?: boolean; //BASE_TOOL
  copyButton?: boolean; //BASE_TOOL
  square?: boolean; //AVATAR,
  rounded?: boolean; //AVATAR,
  size?: string; //AVATAR 45px,
  // body td
  style?: string; //'height: auto; width: 100px' for IMAGE,
  classes?: string;
  // header th:
  headerStyle?: string;
  headerClasses?: string;
  align?: IAlign; //'center', center left right
  searchType?: ICrudListHeaderOptionSearchType;
  searchModel?: any;
  searchColunm?: string;
  sortColunm?: string;
  searchOperation?: SearchOperation;
  searchOperationReadonly?: boolean;
  maxWidth?: string;//250px
  toolTip?: boolean;
  func?: any;
  trueIcon?: string;
  falseIcon?: string;
  clickable?: boolean;
  selectOption?: {
    items: LabelValue<any>[]
    multiple?: boolean
  };
}
export interface ICrudListHeader {
  column?: string;
  field?: any;
  label: string;
  translateLabel?: boolean
  type: CrudListDataType;
  options: ICrudListHeaderOption;
}
export interface IAcl {
  menus: IMenu[];
  permissions: string[];
  frontendMenus: IMenu[];
  frontendPermissions: string[];
}
export interface IMenu {
  pages?: IMenuPage[];
  header?: string;
  border?: boolean;
  translate?: boolean;
}
export interface IMenuPageItem {
  iconText?: string;
  color?: string;
  icon?: string;
  to?: string;
  title?: string;
  caption?: string;
  titleI18n?: boolean;
  permission?: string;
  border?: boolean;
  header?: string;
  headerI18n?: boolean;
  noActiveLink?: boolean;
  userAcl?: boolean;
  canShow?: boolean;
  image?: string;
  imageSize?: number;
  fetchImage?: boolean;
  iconSize?: number;
  iconColor?: string;
  translate?: boolean;
}
export interface IMenuPage extends IMenuPageItem {
  items?: IMenuPageItem[];
}
export interface IFile {
  type: string;
  size: number;
  icon: string;
  name?: string;
  filePath?: string | null;
}
export interface LabelValue<Type> {
  avatar?: AvatarProps;
  border?: boolean;
  children?: LabelValue<Type>[]
  color?: AppColor | string;
  disable?: boolean;
  description?: string;
  fetch?: boolean;
  icon?: IconProps;
  label?: string;
  noActiveLink?: boolean;
  params?: string[];
  queries?: string[];
  rbac?: RBACProps;
  translateLabel?: boolean;
  to?: string;
  value?: Type;
  additionalValue?: any;
  onHandle?: (...params: any[] | []) => void;
}
export interface LoginRequest {
  emailOrUsername: string | null | undefined;
  password: string | null | undefined;
  loginFrom?: LoginLogType;
  deviceId?: string | null;
}
export interface NotifyOptions {
  icon?: string;
  caption?: string;
  avatar?: string;
  color?: string;
  textColor?: string;
  type?: 'positive' | 'negative' | 'warning' | 'info';
  timeout?: number;
  progress?: boolean;
  multiLine?: boolean;
  spinner?: boolean;
  html?: boolean;
  hideClose?: boolean;
  position?:
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-right'
  | 'bottom-left'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'center';
  actions?: any[];
}
export interface NavigateToOpenOptions {
  target?: IHrefTarget
  windowFeatures: {
    width?: number
    height?: number
    popup?: boolean
    left?: number
    top?: number
    noopener?: boolean
    noreferrer?: boolean
  }
}
export interface NavigateToOptions {
  replace?: boolean
  redirectCode?: number
  external?: boolean
  open?: NavigateToOpenOptions
}
export interface OgMeta {
  domain: string;
  url: string;
  title?: string;
  desc?: string;
  image?: string;
  imageAlt?: string;
}
export interface RefreshTokenRequest {
  refreshToken?: string | null;
  fcmToken?: string | null;
  email?: string | null;
  fcmEnable?: boolean;
}
export interface RefreshTokenResponse {
  userId: number | string | null;
  authenticationToken: string | null;
  refreshToken: string | null;
  expiresAt?: string;
}
export interface RefeshTokenStatus {
  status: boolean;
  fourceLogout: boolean;
  token?: string;
}
export interface CookieItem {
  key?: string
  value?: any
  userId?: number | null
}
export interface NotificationCount {
  lastestId: number
  totalNotify: number
  totalNewMessage: number
}
export interface LoginedProfileItem {
  user?: AppUser
  notificationCount?: NotificationCount
}
export interface RequestDto {
  [key: string]: any;
}
export interface RequestType {
  API: string;
  baseURL?: string;
  method: IMethod;
  body?: any;
  contentType?: string;
  responseType?: 'arraybuffer' | 'document' | 'json' | 'text' | 'stream';
  clearBaseUrl?: boolean
}
export interface SwiperSlideChange {
  activeIndex: number
  realIndex: number
}
export interface SlideAutoplay {
  delay: number;
}

export interface SlideZoom {
  maxRatio: number;
}

export interface SlidePaginationy {
  hideOnClick?: boolean;
  enabled?: boolean;
  dynamicBullets?: boolean;
  type?: 'bullets' | 'fraction' | 'progressbar' | 'custom';
}

export type SlidePaginationType = 'progressbar' | 'bullets' | 'fraction' | 'custom';
export type SlideDirectionType = 'horizontal' | 'vertical';
export type SlideEffectType = 'slide' | 'fade' | 'cube' | 'coverflow' | 'flip' | 'creative' | 'cards';
export interface SlideOptions {
  autoplay?: boolean | SlideAutoplay;
  breakpoints?: any;
  centeredSlides?: boolean;
  allowTouchMove?: boolean;
  direction?: SlideDirectionType;
  effect?: SlideEffectType;
  freeMode?: boolean;
  initialSlide?: number;
  keyboard?: boolean;
  lazy?: boolean;
  loop?: boolean;
  modules?: SlideModule[];
  navigation?: boolean;
  navigationType?: boolean;
  navigationCustom?: boolean;
  pagination?: boolean | SlidePaginationy;
  paginationClickable?: boolean;
  paginationType?: SlidePaginationType;
  paginationDynamic?: boolean;
  scrollbar?: boolean;
  style?: any | object;
  speed?: number;
  slidesPerView?: number | 'auto';
  spaceBetween?: number;
  slidesPerGroup?: number;
  thumbs?: boolean;
  updateOnWindowResize?: boolean;
  zoom?: boolean | SlideZoom;
  gridRows?: number;
  grabCursor?: boolean;
}
export type SlideModule =
  | 'Autoplay'
  | 'Keyboard'
  | 'Scrollbar'
  | 'Zoom'
  | 'Navigation';
export interface ResponseMessage {
  status: IHttpStatus;
  message?: string;
  timestamp: string;
}
export interface ServerException {
  status: number | string;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}
export interface ResponseEntity<T> {
  status: number;
  message?: string;
  data?: T;
  timestamp?: string;
  path?: string;
}
export interface VirtualScrollerUpdate {
  viewStartIndex: number;
  viewEndIndex: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  isScrollingToTop: boolean;
}

export interface VueMoneyConFig {
  decimal: string
  separator: string
  prefix: string
  suffix: string
  precision: number
  masked: boolean
  nullValue: string
  reverseFill: boolean
}

export interface PdfWatermarkOptions {
  text?: string | undefined
  columns?: number
  rows?: number
  rotation?: number
  fontSize?: number
  color?: any
  opacity?: number
  image?: string
  items?: PdfWatermarkItems[]
}
export interface PdfWatermarkItems {
  x?: number
  y?: number
  text?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}
export interface PlyrOptions {
  autoSetSource?: boolean
  autoplay?: boolean
  controls?: string[]
  ratio?: string
  poster?: string
  settings?: string[]
}
export interface VideoSrc {
  src?: string
  type?: string
  size?: number
}
export interface VideoTrack {
  kind?: string
  label?: string
  srclang?: string
  src?: string
  default?: boolean
}

export interface CompressionSettings {
  crf: number
  preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow'
  resolution: '1080p' | '720p' | '480p' | '360p' | 'original'
  audioBitrate: '320k' | '192k' | '128k' | '96k' | '64k'
}

export interface VideoInfo {
  name: string
  size: number
  type: string
  duration?: number
  width?: number
  height?: number
  url: string
}

export interface CompressionResult {
  file: File | Blob
  originalSize: number
  compressedSize: number
  reduction: number
  url: string
  name: string
  trimmedDuration?: number | undefined
}

export type CompressionStatus = 'idle' | 'loading' | 'compressing' | 'done' | 'error'

export interface TrimOptions {
  enabled: boolean
  startTime: number // วินาที
  endTime: number // วินาที
}

export interface WebSocketBroadcastRequest {
  socketType: WebSocketBroadcastType
  additionalMessage?: string
  additionalValue?: string
  topic?: string
  userId?: number
  functionId?: number
}

export interface WebSocketBroadcast<T> extends WebSocketBroadcastRequest {
  data?: T
}

