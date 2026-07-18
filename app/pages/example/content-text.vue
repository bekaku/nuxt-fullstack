<script setup lang="ts">
useSeoMeta({
  title: "Content Text page",
});

const contentUniqeId = useId();
const contentUniqeId2 = useId();
const ellipsisLines = ref(2);
const content =
  ref<string>(`TypeScript has become the go-to language for many developers, providing the benefits of static typing while maintaining the flexibility of JavaScript. However, as TypeScript continues to evolve, some practices that were once considered best may now be outdated or suboptimal. In this article, we’ll cover 10 bad TypeScript habits you should break in 2024 to write cleaner, more efficient, and maintainable code.

1. Not Using strict Mode
The Problem:
Many developers disable TypeScript’s strict mode to avoid dealing with stricter type checks.

Why It’s Bad:
When strict mode is off, TypeScript becomes more lenient, reducing the effectiveness of type safety. This can lead to unexpected bugs and make refactoring more challenging in the future.

What to Do Instead:
Enable strict mode in your tsconfig.json. It will enforce better type checks and ensure that your code is more robust in the long run.

https://www.youtube.com/watch?v=PCSqrpAWq1s

Example
DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG.
https://github.com/cure53/DOMPurify

<img src=x onerror=alert(1)//>
<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>
<TABLE><tr><td>HELLO</tr></TABL>

#dev_tips #ทดสอบเท็ก`);
const showContent = ref(true);
const onPreview = () => {
  showContent.value = false;
  setTimeout(() => {
    showContent.value = true;
  }, 500);
};

const testExtractHashTag = () => {
  const contentHashTags = extractHashtagsFromString(content.value);
  console.log("contentHashTags", contentHashTags);
  // const finalText = content.value.replace(
  //     /#([a-zA-Z\p{L}\p{N}_\u0E00-\u0E7F]+)/gu,
  //     '<a class="hashtag-href">#$1</a>'
  // );
  // console.log('contentHashTags', finalText)
};
</script>

<template>
  <BaseDashboardPanel id="example-content-text" title="Content Text page">
    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="flex flex-col gap-4 p-4">
        <UFormField label="Text" required>
          <UTextarea
            size="xl"
            class="w-full"
            :rows="10"
            v-model="content"
            placeholder="Type something..."
          />
        </UFormField>

        <div class="flex justify-end">
          <UButton>Preview</UButton>
        </div>
      </div>
      <div class="p-4 flex flex-col gap-4">
        <UCard title="Ellipsis text">
          <template #header>
            <h1 class="font-bold">Ellipsis text</h1>
            <UFormField
              orientation="horizontal"
              label="Rows"
              class="w-72"
            >
              <UInput placeholder="Enter rows" class="w-full" v-model="ellipsisLines" type="number" />
            </UFormField>
          </template>
          <BaseContentText
            :rows="ellipsisLines"
            :content="content"
            show-more
            text-class="app-text"
            expand-text="Read more"
            collapse-text="Show less"
            :urlify="true"
          />
        </UCard>
        <UCard title="Preview with escape html">
          <BaseContentText
            :content="content"
            :urlify="true"
          />

          <BaseOpenGraphItemAlt class="mt-4" :content="content" />
        </UCard>
      </div>
    </div>
  </BaseDashboardPanel>
</template>
