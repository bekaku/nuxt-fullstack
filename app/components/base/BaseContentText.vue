<script setup lang="ts">
import type { TextEllipsisProps } from "~/types/props";

const emit = defineEmits<{
  "on-change": [v: boolean];
}>();

const { t } = useLang();
// Define props with default values to match your required usage
const props = withDefaults(defineProps<TextEllipsisProps>(), {
  rows: -1,
  charsPerLine: 55,
  showMore: false,
  lineHeight: "1.5em",
  isEscapeHtml: true,
  urlify: false,
});
const { inputSanitizeHtml } = useBase();
const isExpanded = ref(false);

/**
 * Generates the CSS required for the native engine to truncate the text.
 * When expanded, we simply remove these constraints.
 */
const textStyles = computed(() => {
  if (isExpanded.value || Number(props.rows) <= 0) return {};

  return {
    // เพิ่ม display และ box-orient (จำเป็นสำหรับการทำงานของ line-clamp)
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as const,

    // Standard native text truncation
    overflow: "hidden",
    textOverflow: "ellipsis",

    // Provide both standard and webkit versions for maximum compatibility
    lineClamp: String(props.rows),
    WebkitLineClamp: String(props.rows),
    lineHeight: props.lineHeight,
  };
});

/**
 * Determines whether to show the Expand/Collapse button.
 */
const isOverflowing = computed(() => {
  if (!props.content) return false;
  const rowsNum = Number(props.rows);
  if (rowsNum <= 0) {
    return false;
  }

  const maxAllowedChars = rowsNum * Number(props.charsPerLine);
  return props.content.length > maxAllowedChars;
});
const getSanitizeHtml = computed(() => {
  if (!props.content) {
    return "";
  }
  let text = props.isEscapeHtml ? escapeHtml(props.content) : props.content;
  const urlRegex = /(https?:\/\/[^\s<]+)/g;

  if (props.urlify) {
    text = text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline hover:opacity-80">${url}</a>`;
    });
  }

  return inputSanitizeHtml(text);
});
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  emit("on-change", isExpanded.value);
};
</script>
<template>
  <div class="flex flex-col w-full" :class="props.class">
    <slot
      :is-expanded="isExpanded"
      :text-styles="textStyles"
      :text-maxline="!isExpanded ? Number(rows) : -1"
    >
      <div
        :class="
          cssMerge(
            'leading-normal text-base',
            isExpanded || !isOverflowing ? 'whitespace-pre-wrap' : '',
            props.textClass,
          )
        "
        :style="textStyles"
        v-html="getSanitizeHtml"
      ></div>
    </slot>

    <div
      v-if="showMore && isOverflowing"
      class="self-start active:opacity-70 mt-1"
      @click="toggleExpand"
    >
      <div class="text-sm font-semibold text-primary cursor-pointer">
        {{
          isExpanded
            ? collapseText || t("base.seeMore")
            : expandText || t("base.seeLess")
        }}
      </div>
    </div>
  </div>
</template>
