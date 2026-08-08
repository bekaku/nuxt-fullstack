<script setup lang="ts">
const {
  ratio = 1,
  disabled = false,
  initialSrc,
  width = "100%",
  height = "550px",
  clearOnSubmit = false,
  cropWidth = 960,
} = defineProps<{
  ratio?: number; //1,4/3,16/9
  disabled?: boolean;
  initialSrc?: string;
  width?: string;
  height?: string;
  clearOnSubmit?: boolean;
  cropWidth?: number;
}>();

const emit = defineEmits<{
  "on-close": [];
  "on-submit": [File];
  "on-cropend": [string];
}>();
const { t } = useLang();
const toast = useToast();
const originalimagFile = ref<any>(null);
const maximizedToggle = ref(false);
const loading = ref(false);
const priviewImage = ref<string | undefined>();
const canvasRef = useTemplateRef<any>("canvasRef");
const canvasImg = useTemplateRef<any>("canvasImg");
const selectionRef = useTemplateRef<any>("selectionRef");
const file = ref();
// const viewerRef = useTemplateRef<any>('viewerRef')
const cropTimeout = ref<any>(null);
const src = ref<string | undefined>(initialSrc);
watchEffect(() => {
  if (initialSrc && canvasImg.value) {
    console.log("watchEffetch initialSrc :", initialSrc);
    // canvasImg.value.src = src;
    src.value = initialSrc;
    onCropend();
  }
});

const onClose = () => {
  clearCropper();
  originalimagFile.value = null;
  emit("on-close");
  maximizedToggle.value = false;
};
const onChange = async (f: File | null | undefined) => {
  console.log("onChange", f);
  if (!f) {
    return;
  }
  originalimagFile.value = f;
  if (/^image\/\w+/.test(originalimagFile.value.type)) {
    // canvasImg.value.src = URL.createObjectURL(originalimagFile.value);
    src.value = URL.createObjectURL(originalimagFile.value);
    onCropend();
  } else {
    toast.add({
      description: "Please choose an image file.",
      icon: "lucide:alert-triangle",
      color: "error",
    });
  }
};
const onRejected = (rejectedEntries: any) => {
  toast.add({
    description: t("error.filesValidationFmt", {
      total: rejectedEntries.length,
    }),
    icon: "lucide:alert-triangle",
    color: "error",
  });
};

const onSelectionChange = (event: any) => {
  // console.log('onSelectionChange', event);
};
const onCanvaAction = (event: any) => {
  // console.log('onCanvaCAction', event);
};
const onCanvaActionstart = (event: any) => {
  // console.log('onCanvaActionstart', event);
};
const onCanvaActionmove = (event: any) => {
  // console.log('onCanvaActionmove', event);
};
const onCanvaActionend = (event: any) => {
  onCropend();
};
const getSelectionCanvas = async (): Promise<any> => {
  if (!selectionRef.value) {
    return new Promise((resolve) => {
      resolve(null);
    });
  }
  const selectionCanvas = await selectionRef.value.$toCanvas({
    beforeDraw: (context: any, canvas: any) => {
      context.imageSmoothingQuality = "high";
    },
    width: cropWidth,
  });
  return new Promise((resolve) => {
    resolve(selectionCanvas);
  });
};
const onCropend = async () => {
  cropTimeout.value = setTimeout(async () => {
    const selectionCanvas = await getSelectionCanvas();
    if (selectionCanvas) {
      priviewImage.value = selectionCanvas.toDataURL("image/jpeg");
      if (priviewImage.value) {
        emit("on-cropend", priviewImage.value);
      }
    }
    // viewerRef.value.replaceChildren(selectionCanvas)
    // console.log('onCropend', selectionCanvas.toDataURL())
  }, 500);
};
const onSubmit = async () => {
  const selectionCanvas = await getSelectionCanvas();
  if (selectionCanvas) {
    loading.value = true;
    selectionCanvas.toBlob(async (blob: any) => {
      const f = await blobToFile(blob, originalimagFile.value.name);
      loading.value = false;
      emit("on-submit", f);
      if (clearOnSubmit) {
        onClose();
      }
    }, "image/jpeg");
  }
};
const clearCropper = () => {
  if (selectionRef.value) {
    selectionRef.value.$clear();
  }
  if (cropTimeout.value) {
    clearTimeout(cropTimeout.value);
    cropTimeout.value = null;
  }
};

// Clean up on unmount
onUnmounted(() => {
  clearCropper();
});
</script>
<template>
  <div class="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
    <div class="md:col-span-8">
      <cropper-canvas
        id="cropperSelection"
        ref="canvasRef"
        :style="{ display: 'block', maxWidth: width, height: height }"
        :disabled
        background
        @action="onCanvaAction"
        @actionstart="onCanvaActionstart"
        @actionmove="onCanvaActionmove"
        @actionend="onCanvaActionend"
      >
        <template v-if="src">
          <cropper-image
            ref="canvasImg"
            :src="src"
            alt="Picture"
            rotatable
            scalable
            skewable
            translatable
          />
          <cropper-shade hidden />
          <cropper-handle action="select" plain />
          <cropper-selection
            ref="selectionRef"
            initial-coverage="0.5"
            initial-aspect-ratio="1.5"
            movable
            resizable
            :aspect-ratio="ratio"
            @change="onSelectionChange"
          >
            <cropper-grid role="grid" theme-color="#2e86de" covered />
            <cropper-crosshair centered />
            <cropper-handle
              action="move"
              theme-color="rgba(255, 255, 255, 0.35)"
            />
            <cropper-handle action="n-resize" />
            <cropper-handle action="e-resize" />
            <cropper-handle action="s-resize" />
            <cropper-handle action="w-resize" />
            <cropper-handle action="ne-resize" />
            <cropper-handle action="nw-resize" />
            <cropper-handle action="se-resize" />
            <cropper-handle action="sw-resize" />
          </cropper-selection>
        </template>
      </cropper-canvas>
      <div class="flex p-2 justify-around">
        <template v-if="canvasImg">
          <UButton
            icon="lucide:zoom-in"
            class="rounded-full"
            variant="ghost"
            @click="
              canvasImg.$zoom(0.1);
              onCropend();
            "
          />
          <UButton
            icon="lucide:zoom-out"
            class="rounded-full"
            variant="ghost"
            @click="canvasImg.$zoom(-0.1); onCropend()"
          />
          <UButton
            icon="lucide:undo"
            class="rounded-full"
            variant="ghost"
            @click="canvasImg.$rotate('-45deg'); onCropend()"
          />
          <UButton
            icon="lucide:redo"
            class="rounded-full"
            variant="ghost"
            @click="canvasImg.$rotate('45deg'); onCropend()"
          />
          <UButton
            icon="lucide:arrow-left-right"
            class="rounded-full"
            variant="ghost"
            @click="canvasImg.$scale(-1, 1); onCropend()"
          />
          <UButton
            icon="lucide:arrow-up-down"
            class="rounded-full"
            variant="ghost"
            @click="canvasImg.$scale(1, -1); onCropend()"
          />
        </template>
      </div>
    </div>
    <div class="md:col-span-4">
      <div class="q-pa-sm">
        <UFileUpload
          label="Drop your image here"
          accept="image/*"
          :multiple="false"
          v-model="originalimagFile"
          @update:modelValue="onChange"
        >
          <template #default="{ open }">
            <UButton
              icon="i-lucide-image"
              :label="$t('base.chooseFile')"
              class="w-fit"
              variant="ghost"
              @click="
                () => {
                  open();
                }
              "
            />
          </template>
        </UFileUpload>
        <div class="mt-4">
          <slot name="preview">
            <UScrollArea class="h-[470px[">
              <div
                v-if="priviewImage"
                class="flex-wrap cropper-viewers flex gap-4"
              >
                <BaseImage
                  :src="priviewImage"
                  style="width: 100%; height: 320px"
                  class="rounded-md"
                />
                <BaseImage
                  :src="priviewImage"
                  style="width: 160px; max-height: 160px"
                  class="rounded-md"
                />
                <BaseImage
                  :src="priviewImage"
                  style="width: 80px; max-height: 80px"
                  class="rounded-md"
                />
                <BaseImage
                  :src="priviewImage"
                  style="width: 40px; max-height: 40px"
                  class="rounded-md"
                />
                <BaseImage
                  :src="priviewImage"
                  style="width: 20px; max-height: 20px"
                  class="rounded-md"
                />
              </div>
            </UScrollArea>
          </slot>
        </div>
        <div class="py-4">
          <UButton
            icon="lucide:check"
            :label="t('base.okay')"
            color="primary"
            class="w-full"
            :loading="loading"
            @click="onSubmit"
          />
        </div>
      </div>
    </div>
  </div>
</template>
