<script setup lang="ts">
definePageMeta({});
useSeoMeta({
  title: "Modal page",
});
const { t } = useLang();
const confirm = useConfirmDialog();
const loader = useLoader();
const defaultModal = ref(false);
const dismissableModal = ref(false);
const footerModal = ref(false);
const fullScreenModal = ref(false);

const handleClick = async () => {
  const result = await confirm({
    title: t("app.monogram"),
    description: t("base.deleteConfirm"),
  });
  console.log(result);
};
const handleCustomClick = async () => {
  const result = await confirm({
    title: t("app.monogram"),
    description: t("base.deleteConfirm"),
    confirmButton: {
      label: "Yeahhh!",
      color: "error",
      icon: "lucide:ambulance",
    },
    cancelButton: { label: "Noooooooooo", variant: "soft" },
  });
  console.log(result);
};

const dismissConfirm = async () => {
  const result = await confirm({
    title: "Are you sure?",
    description: "You won't be able to revert this!",
    confirmButton: {
      label: "Exit!",
      color: "neutral",
      icon: "lucide:log-out",
    },
    cancelButton: {
      label: "Stay!",
      variant: "soft",
      icon: "lucide:pencil-line",
    },
  });
  if (result) {
    dismissableModal.value = false;
  }
};

const handleLoader = () => {
  loader.open({
    description: "Please wait...",
    icon: "lucide:battery-charging",
  });
  setTimeout(() => {
    loader.close();
  }, 3000);
};
</script>
<template>
  <BaseDashboardPanel id="example-modal" title="Modal page">

    <div class="w-full flex flex-col p-4">
      <h1 class="text-2xl font-bold">Confirm Dialog</h1>

      <div class="flex gap-2 py-4">
        <UButton
          label="Default"
          color="neutral"
          variant="subtle"
          @click="handleClick"
        />
        <UButton
          label="Custom Button"
          color="neutral"
          variant="subtle"
          @click="handleCustomClick"
        />
      </div>

      <USeparator class="my-4" />

      <h1 class="text-2xl font-bold">Modal</h1>
      <div class="flex gap-2 py-4">
        <UButton
          label="Default"
          color="neutral"
          variant="subtle"
          @click="
            () => {
              defaultModal = true;
            }
          "
        />
        <UButton
          label="Dismissable"
          color="neutral"
          variant="subtle"
          @click="
            () => {
              dismissableModal = true;
            }
          "
        />
        <UButton
          label="Footer"
          color="neutral"
          variant="subtle"
          @click="
            () => {
              footerModal = true;
            }
          "
        />
        <UButton
          label="Full Screen"
          color="neutral"
          variant="subtle"
          @click="
            () => {
              fullScreenModal = true;
            }
          "
        />
      </div>

      <USeparator class="my-4" />

      <h1 class="text-2xl font-bold">Loader</h1>
      <div class="flex gap-2 py-4">
        <UButton
          label="Show Loader"
          color="neutral"
          variant="subtle"
          @click="handleLoader"
        />
      </div>
    </div>
  </BaseDashboardPanel>
  <LazyBaseModal
    v-if="defaultModal"
    v-model="defaultModal"
    title="Modal with description"
    description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    close-icon="lucide:arrow-right"
  >
    <div class="text-base">Default Modal</div>
  </LazyBaseModal>

  <LazyBaseModal
    v-if="dismissableModal"
    v-model="dismissableModal"
    title="Dismissable"
    :dismissible="false"
  >
    <template #content>
      <div class="p-4">
        <div class="text-lg font-bold">Dismissable</div>
        <div class="text-sm text-muted">Dismissable Modal</div>
        <USeparator class="my-3" />

        <div class="w-full overflow-auto max-h-[125px]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </div>

        <div class="flex w-full justify-end gap-4">
          <UButton
            label="Cancel"
            color="neutral"
            variant="outline"
            @click="dismissConfirm"
          />
          <UButton
            label="Submit"
            color="neutral"
            @click="
              () => {
                dismissableModal = false;
              }
            "
          />
        </div>
      </div>
    </template>
  </LazyBaseModal>
  <LazyBaseModal
    v-if="footerModal"
    v-model="footerModal"
    title="Footer"
    :dismissible="false"
    :ui="{ content: 'w-auto sm:max-w-fit' }"
  >
    This is a footer
    <template #footer="{ close }">
      <div class="w-full flex justify-end gap-3">
        <UButton
          label="Cancel"
          color="neutral"
          variant="outline"
          @click="close"
        />
        <UButton label="Submit" color="neutral" />
      </div>
    </template>
  </LazyBaseModal>

  <LazyBaseModal
    v-if="fullScreenModal"
    v-model="fullScreenModal"
    fullscreen
    title="Modal fullscreen"
  >
    <UScrollArea shadow class="p-4 h-[80vh]" :ui="{ viewport: 'gap-4' }">
      <div class="h-screen border border-red-500">
        <span>fullScreenModal</span>
      </div>
    </UScrollArea>
  </LazyBaseModal>
</template>
