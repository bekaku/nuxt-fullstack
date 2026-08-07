<script setup lang="ts">
import { useBase } from "@/composables/useBase";
import { useLang } from "@/composables/useLang";
import type { FileManager } from "@/types/models";
import {
  MdEditor,
  NormalToolbar,
  type CustomIcon,
  type ToolbarNames,
} from "md-editor-v3";
import "md-editor-v3/lib/style.css";
import { ref } from "vue";
import type { MDCodeTheme, MDPreviewTheme } from "~/types/common";

const props = withDefaults(
  defineProps<{
    editorId?: string;
    sanitize?: boolean;
    htmlPreview?: boolean;
    preview?: boolean;
    noUploadImg?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    showBtnHelp?: boolean;
    previewTheme?: MDPreviewTheme;
    codeTheme?: MDCodeTheme;
  }>(),
  {
    editorId: "mk-id-gd5",
    sanitize: false,
    htmlPreview: false,
    preview: true,
    noUploadImg: false,
    disabled: false,
    readOnly: false,
    showBtnHelp: false,
    previewTheme: "github",
    codeTheme: "github",
  },
);
const UIcon = resolveComponent("UIcon");
const { isDark } = useTheme();
const { t } = useLang();
const { onUploadChunk } = useUpload();
// const text = ref('# Hello Editor ### 🤖 Base');
const modelValue = defineModel<string>();
const { inputSanitizeHtml } = useBase();
const excludToolBars = ref<ToolbarNames[]>(["save", "github", "htmlPreview"]);
const showLoading = ref(false);
const editorRef = useTemplateRef<any>("editorRef");
const isLinkModalOpen = ref(false);
const linkTitle = ref("");
const linkUrl = ref("");
const savedSelection = ref("");

const isImageLinkModalOpen = ref(false);
const imageLinkTitle = ref("");
const imageLinkUrl = ref("");

const customToolbars: ToolbarNames[] = [
  "bold",
  "underline",
  "italic",
  "-",
  "title",
  "strikeThrough",
  "sub",
  "sup",
  "quote",
  "unorderedList",
  "orderedList",
  "task",
  "-",
  "codeRow",
  "code",
  0, // replce custom button
  1, // replce custom button
  "image",
  "table",
  "mermaid",
  "katex",
  "-",
  "revoke",
  "next",
  "save",
  "=",
  "pageFullscreen",
  "fullscreen",
  "preview",
  "previewOnly",
  "htmlPreview",
  "catalog",
  "github",
];
const sanitizer = (html: string) => {
  if (props.sanitize) {
    return inputSanitizeHtml(html);
  }
  return html;
};
const onSave = (v: any, h: any) => {
  console.log(v);
  h.then((html: any) => {
    console.log(html);
  });
};
const onUploadImg = async (files: any, callback: any) => {
  // appLoading()
  showLoading.value = true;
  const res = await Promise.all(
    files.map(async (file: any) => {
      const resPonse = await onUploadChunk(file);
      return new Promise((rev /*rej*/) => {
        rev(resPonse);
        // const form = new FormData();
        // form.append('file', file);
        //
        // axios
        //   .post('/api/img/upload', form, {
        //     headers: {
        //       'Content-Type': 'multipart/form-data'
        //     }
        //   })
        //   .then((res) => rev(res))
        //   .catch((error) => rej(error));
      });
    }),
  );

  // Approach 1
  // callback(res.map((item) => item.data.url));

  // Approach 2
  callback(
    res.map((item: FileManager) => ({
      url: item.filePath,
      alt: item.id,
      title: item.fileName,
    })),
  );
  // appLoading(false)
  showLoading.value = true;
};

const openLinkModal = () => {
  const text = editorRef.value?.getSelectedText() || "";
  linkTitle.value = text;
  savedSelection.value = text;
  linkUrl.value = "";
  isLinkModalOpen.value = true;
};
const insertCustomLink = () => {
  if (!linkUrl.value) {
    return;
  }
  const finalTitle = linkTitle.value || linkUrl.value;
  const markdownLink = `[${finalTitle}](${linkUrl.value})`;
  editorRef.value?.insert((selectedText: string) => {
    return {
      targetValue: markdownLink,
      select: false,
      deviationStart: 0,
      deviationEnd: 0,
    };
  });
  isLinkModalOpen.value = false;
};

const openImageLinkModal = () => {
  const text = editorRef.value?.getSelectedText() || "";
  imageLinkTitle.value = text;
  imageLinkUrl.value = "";
  isImageLinkModalOpen.value = true;
};

const insertCustomImageLink = () => {
  if (!imageLinkUrl.value) {
    return;
  }
  // ใช้ 'image' เป็นค่าเริ่มต้นหากไม่ได้ใส่คำอธิบายภาพ
  const finalTitle = imageLinkTitle.value || "image";
  // สร้างรูปแบบ Markdown สำหรับรูปภาพ: ![alt text](url)
  const markdownImageLink = `![${finalTitle}](${imageLinkUrl.value})`;
  editorRef.value?.insert((selectedText: string) => {
    return {
      targetValue: markdownImageLink,
      select: false,
      deviationStart: 0,
      deviationEnd: 0,
    };
  });

  isImageLinkModalOpen.value = false;
};

const customIcons: CustomIcon = {
  image: {
    component: UIcon, // ระบุ Vue Component ที่ต้องการใช้
    props: {
      name: "i-lucide-image-up", // ส่งค่า Props ให้ UIcon
      class: "size-4",
    },
  },
  // ตัวอย่างถ้าต้องการเปลี่ยนไอคอนปุ่ม Save
  // save: {
  //   component: QIcon,
  //   props: { name: 'bi-save', size: 'xs' }
  // }
};
</script>
<template>
  <ClientOnly>
    <MdEditor
      ref="editorRef"
      v-model="modelValue"
      :theme="isDark ? 'dark' : 'light'"
      language="en-US"
      :preview-theme="previewTheme"
      :code-theme="codeTheme"
      :editor-id="editorId"
      :sanitize="sanitizer"
      :preview="preview"
      :html-preview="htmlPreview"
      :no-upload-img="noUploadImg"
      :read-only="readOnly"
      :disabled="disabled"
      :toolbars-exclude="excludToolBars"
      show-code-row-number
      :toolbars="customToolbars"
      :custom-icon="customIcons"
      @on-save="onSave"
      @on-upload-img="onUploadImg"
    >
      <template #defToolbars>
        <NormalToolbar :title="$t('base.addLink')" @on-click="openLinkModal">
          <template #trigger>
            <Icon name="lucide:link" class="size-4" />
          </template>
        </NormalToolbar>
        <NormalToolbar
          :title="$t('base.addImagelink')"
          @on-click="openImageLinkModal"
        >
          <template #trigger>
            <Icon name="lucide:image" class="size-4" />
          </template>
        </NormalToolbar>
      </template>
    </MdEditor>
  </ClientOnly>

  <LazyBaseModal
    v-if="isLinkModalOpen"
    v-model="isLinkModalOpen"
    :title="$t('base.addLink')"
  >
    <div class="flex flex-col gap-2 w-full">
      <UFormField :label="t('base.addLinkTitle')">
        <UInput v-model="linkTitle" class="w-full" />
      </UFormField>
      <UFormField :label="t('base.addLinkLink')">
        <UInput
          v-model="linkUrl"
          class="w-full"
          @keyup.enter="insertCustomLink"
        />
      </UFormField>

      <UButton
        :label="$t('base.okay')"
        class="w-fit"
        @click="insertCustomLink"
      />
    </div>
  </LazyBaseModal>
  <LazyBaseModal
    v-if="isImageLinkModalOpen"
    v-model="isImageLinkModalOpen"
    :title="$t('base.addImagelink')"
  >
    <div class="flex flex-col gap-2 w-full">
      <UFormField :label="t('base.addLinkTitle') + ' (Alt Text)'">
        <UInput v-model="imageLinkTitle" class="w-full" />
      </UFormField>
      <UFormField :label="t('base.addLinkLink') + ' (URL)'">
        <UInput
          v-model="imageLinkUrl"
          class="w-full"
          @keyup.enter="insertCustomImageLink"
        />
      </UFormField>

      <UButton
        :label="$t('base.okay')"
        class="w-fit"
        @click="insertCustomImageLink"
      />
    </div>
  </LazyBaseModal>
</template>
<style scoped lang="css">
.md-editor-dark {
  --md-bk-color: var(--wee-second-bg-color-theme-dark) !important;
}
.editor-loader-class {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999 !important;
  background-color: rgba(0, 0, 0, 0.5);
}
.md-editor {
  z-index: 1000 !important; /* ปรับให้ต่ำกว่า 6000 ของ Quasar */
}
.md-editor.md-editor-fullscreen {
  z-index: 5555 !important;
}
.editor-top-dialog {
  z-index: 9999 !important;
}
</style>
