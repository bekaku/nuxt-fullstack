<script setup lang="ts">
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { useConfiguration } from "~/composables/useConfiguration";
import type { PdfWatermarkOptions } from "~/types/common";
const {
  src,
  title,
  showDownload = true,
  fetchToServer = false,
  isBlob = false,
  scrollHeight = "80vh",
  minHeight = "500px",
  minWidth = "100%",
  closeable = true,
  watermarkOptions,
  allPage = false,
} = defineProps<{
  title?: string;
  src: string;
  fetchToServer?: boolean;
  showDownload?: boolean;
  isBlob?: boolean;
  scrollHeight?: string;
  minHeight?: string;
  minWidth?: string;
  closeable?: boolean;
  allPage?: boolean | undefined;
  watermarkOptions?: PdfWatermarkOptions | undefined;
  scrollClass?: string;
}>();
const { isDark } = useTheme();
const { isLinkFromCdn } = useConfiguration();
const emit = defineEmits(["on-close"]);
const { t } = useLang();
const show = defineModel("show", { type: Boolean, default: false });
const pdfSrc = ref<any>();
const loading = ref(true);
const downloadLoading = ref(false);
const fileName = ref();
const contentType = ref();
const scale = ref(1);
const page = ref(1);
const pages = ref(0);
const pdfViewBaseRef = useTemplateRef<any>("pdfViewBaseRef");
const showAllPage = ref(allPage);
const loder = useLoader();

const addWatermarkFrombUrl = async (fileUrl: string): Promise<Blob> => {
  // 1. Fetch blob from URL
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();

  // 2. Load into pdf-lib
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // 3. Embed font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const margin = 20;
  // 4. Add watermark on each page
  const fontSize =
    watermarkOptions?.fontSize != undefined ? watermarkOptions.fontSize : 16;
  const opacity =
    watermarkOptions?.opacity != undefined ? watermarkOptions.opacity : 0.7;
  const color: any =
    watermarkOptions?.color != undefined
      ? watermarkOptions.color
      : rgb(0.75, 0.75, 0.75);
  const rotate =
    watermarkOptions?.rotation != undefined ? watermarkOptions.rotation : 45;
  const cols =
    watermarkOptions?.columns != undefined ? watermarkOptions.columns : 4;
  const rows = watermarkOptions?.rows != undefined ? watermarkOptions.rows : 3;
  const defultText =
    watermarkOptions?.text != undefined ? watermarkOptions?.text : "";

  const imageUrl = watermarkOptions?.image;
  let img: any;
  let imgDims: any;
  if (imageUrl) {
    const imageBytes = await fetch(imageUrl).then((res) => res.arrayBuffer());
    if (imageUrl.toLowerCase().endsWith(".png")) {
      img = await pdfDoc.embedPng(imageBytes);
    } else {
      img = await pdfDoc.embedJpg(imageBytes);
    }
    imgDims = img.scale(0.5);
  }
  pdfDoc.getPages().forEach(async (page) => {
    const { width, height } = page.getSize();

    if (imageUrl) {
      page.drawImage(img, {
        x: width / 2 - imgDims.width / 2,
        y: height / 2 - imgDims.height / 2,
        width: imgDims.width,
        height: imgDims.height,
        opacity: 0.2, // transparent watermark
      });
    }

    if (watermarkOptions?.items && watermarkOptions.items.length > 0) {
      for (const wmItem of watermarkOptions.items) {
        const txt = wmItem?.text || defultText;

        if (wmItem?.position === "top-left") {
          // top-left
          page.drawText(txt, {
            x: margin,
            y: height - fontSize - margin,
            size: fontSize,
            font,
            color,
            rotate: degrees(0),
            opacity,
          });
        } else if (wmItem?.position === "top-right") {
          // top-right
          page.drawText(txt, {
            x: width - margin - font.widthOfTextAtSize(txt, fontSize),
            y: height - fontSize - margin,
            size: fontSize,
            font,
            color,
            rotate: degrees(0),
            opacity,
          });
        } else if (wmItem?.position === "bottom-left") {
          // bottom-left
          page.drawText(txt, {
            x: margin,
            y: margin,
            size: fontSize,
            font,
            color,
            rotate: degrees(0),
            opacity,
          });
        } else if (wmItem?.position === "bottom-right") {
          // bottom-right
          page.drawText(txt, {
            x: width - margin - font.widthOfTextAtSize(txt, fontSize),
            y: margin,
            size: fontSize,
            font,
            color,
            rotate: degrees(0),
            opacity,
          });
        } else {
          page.drawText(txt, {
            x: wmItem.x || 0,
            y: wmItem.y || 0,
            size: fontSize,
            font,
            color,
            rotate: degrees(rotate),
            opacity,
          });
        }
      }
    } else {
      const xSpacing = width / cols;
      const ySpacing = height / rows;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          page.drawText(defultText, {
            x: col * xSpacing + 20, // adjust offset
            y: row * ySpacing + 20,
            size: fontSize,
            font,
            color,
            opacity,
            rotate: degrees(rotate),
          });
        }
      }
    }
  });
  // 5. Save modified PDF
  const pdfBytes = await pdfDoc.save();

  // 6. Download
  const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
  // const link = document.createElement('a')
  // link.href = URL.createObjectURL(blob)
  // link.download = 'watermarked.pdf'
  // link.click()
  return blob;
};
const onLoad = async () => {
  let url: string = "";
  if (fetchToServer || isLinkFromCdn(src)) {
    // const response = await fethCdnData(src, "axiosresponse");
    // if (response) {
    //   url = (await getBlobFromAxiosResponse(response)) as string;
    //   contentType.value = response.headers["content-type"];
    //   fileName.value = getFileNameFromAxiosResponse(response);
    // }
  } else {
    url = src;
  }

  return new Promise((resolve) => {
    resolve(url);
  });
};
const printPdf = async () => {
  if (!pdfViewBaseRef.value) {
    return;
  }
  loder.open();
  await pdfViewBaseRef.value.print();
  loder.close();
};
const downloadPdf = async () => {
  loder.open();
  await pdfViewBaseRef.value.download(title || "pdf_file.pdf");
  loder.close();
  // downloadLoading.value = true
  // if (isBlob) {
  //   try {
  //     if (isBlobUrl(pdfSrc.value)) {
  //       downloadFromBlobUrl(pdfSrc.value, title || 'pdf_file.pdf')
  //     } else {
  //       downloadFromBlob(src, title || 'pdf_file.pdf')
  //     }
  //   } catch (err) {
  //     console.error(err)
  //   }
  // } else {
  //   try {
  //     if (isBlobUrl(pdfSrc.value)) {
  //       downloadFromBlobUrl(pdfSrc.value, title || 'pdf_file.pdf')
  //     } else {
  //       if (fetchToServer) {
  //         if (isLinkFromApi(pdfSrc.value)) {
  //           await downloadCdnData(src, title)
  //         } else {
  //           downloadFileFromUrl(pdfSrc.value, title || 'pdf_file.pdf')
  //         }
  //       } else {
  //         downloadFileFromUrl(pdfSrc.value, title || 'pdf_file.pdf')
  //       }
  //     }
  //   } catch (err) {
  //     console.error(err)
  //   }
  // }
  // downloadLoading.value = false
};
const onPageChange = (p: number) => {
  pages.value = p;
};
const onClose = () => {
  emit("on-close");
  show.value = false;
};
onMounted(async () => {
  loading.value = true;
  const fileUrl: any = await onLoad();
  if (fileUrl) {
    if (
      watermarkOptions?.text ||
      watermarkOptions?.image ||
      (watermarkOptions?.items && watermarkOptions.items.length > 0)
    ) {
      const finalBob = await addWatermarkFrombUrl(fileUrl);
      if (finalBob) {
        pdfSrc.value = URL.createObjectURL(finalBob);
      }
    } else {
      pdfSrc.value = fileUrl;
    }
  }
  loading.value = false;
});
</script>
<template>
  <div class="flex flex-col w-full h-full overflow-hidden">
    <div
      class="flex items-center justify-between px-4 py-3 shrink-0 border-b border-default"
    >
      <div v-if="title" class="text-sm font-medium w-[20%]">
        <BaseContentText text-class="text-sm" :rows="2" :content="title" />
      </div>

      <div class="flex items-center justify-center gap-2">
        <UButton
          variant="ghost"
          icon="hugeicons:zoom-out-area"
          class="rounded-full"
          @click="scale = scale > 0.25 ? scale - 0.25 : scale"
        />
        <span>{{ scale * 100 + "%" }}</span>
        <UButton
          variant="ghost"
          icon="hugeicons:zoom-in-area"
          class="rounded-full"
          @click="scale = scale < 2 ? scale + 0.25 : scale"
        />
        <template v-if="!showAllPage">
          <UButton
            variant="ghost"
            class="rounded-full"
            icon="hugeicons:arrow-left-02"
            :disabled="page === 0"
            @click="page = page > 1 ? page - 1 : page"
          />
          <span>{{ page }} / {{ pages }}</span>
          <UButton
            variant="ghost"
            class="rounded-full"
            icon="hugeicons:arrow-right-02"
            :disabled="page === pages"
            @click="page = page < pages ? page + 1 : page"
          />
        </template>
        <UCheckbox v-model="showAllPage" :label="$t('base.showAllPage')" />
      </div>

      <div class="flex items-center justify-end w-24 gap-2">
        <slot name="header-right-prepend" />
        <UButton
          variant="ghost"
          color="neutral"
          icon="hugeicons:printer"
          class="rounded-full"
          @click="printPdf"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="hugeicons:download-01"
          class="rounded-full"
          @click="downloadPdf"
        />
        <slot name="header-right-apppend" />
      </div>
    </div>
    <!-- <div class="flex flex-col w-full h-full"> -->
    <div class="flex flex-col w-full flex-1 min-h-0 bg-neutral-100 dark:bg-neutral-950">
      <div class="flex-1 min-h-0 w-full p-2">
        <UProgress v-if="downloadLoading" animation="swing" />
        <div :style="{ minHeight: minHeight, minWidth: minWidth }">
          <template v-if="loading">
            <UProgress animation="swing" />
          </template>
          <template v-else-if="pdfSrc">
            <UScrollArea
              :class="['w-full', scrollClass]"
              :style="{ height: scrollHeight }"
            >
              <BasePdfViewCore
                ref="pdfViewBaseRef"
                v-model:scale="scale"
                v-model:page="page"
                v-model:pagess="pages"
                :all-page="showAllPage"
                :src="pdfSrc"
              />
            </UScrollArea>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
