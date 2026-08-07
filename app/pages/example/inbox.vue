<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { breakpointsTailwind } from "@vueuse/core";
import type { Mail } from "~/types";

const tabItems = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Unread",
    value: "unread",
  },
];
const selectedTab = ref("all");

const { data: mails } = await useFetch<Mail[]>("/api/mock/mails", {
  default: () => [],
});

// Filter mails based on the selected tab
const filteredMails = computed(() => {
  if (selectedTab.value === "unread") {
    return mails.value.filter((mail) => !!mail.unread);
  }

  return mails.value;
});

const selectedMail = ref<Mail | null>();

const isMailPanelOpen = computed({
  get() {
    return !!selectedMail.value;
  },
  set(value: boolean) {
    if (!value) {
      selectedMail.value = null;
    }
  },
});

// Reset selected mail if it's not in the filtered mails
watch(filteredMails, () => {
  if (!filteredMails.value.find((mail) => mail.id === selectedMail.value?.id)) {
    selectedMail.value = null;
  }
});

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
</script>

<template>
  <BaseDashboardPanel
    id="inbox-1"
    title="Inbox"
    :default-size="25"
    :min-size="20"
    :max-size="30"
    resizable
  >
    <template #trailing>
      <UBadge :label="filteredMails.length" variant="subtle" />
    </template>
    <template #navbarRight>
      <UTabs
        v-model="selectedTab"
        :items="tabItems"
        :content="false"
        size="xs"
      />
    </template>
    <InboxList v-model="selectedMail" :mails="filteredMails" />
  </BaseDashboardPanel>

  <InboxMail
    v-if="selectedMail"
    :mail="selectedMail"
    @close="selectedMail = null"
  />
  <div v-else class="hidden lg:flex flex-1 items-center justify-center">
    <Icon name="lucide:inbox" class="size-32 text-dimmed" />
  </div>

  <ClientOnly>
    <USlideover v-if="isMobile" v-model:open="isMailPanelOpen">
      <template #content>
        <InboxMail
          v-if="selectedMail"
          :mail="selectedMail"
          @close="selectedMail = null"
        />
      </template>
    </USlideover>
  </ClientOnly>
</template>
