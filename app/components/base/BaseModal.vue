<script setup lang="ts">
import type { ButtonProps, ModalProps } from "@nuxt/ui";

const {
  autoClose = true,
  dismissible = true,
  closeIcon = "lucide:x",
  overlay = true,
  modal = true,
  scrollable = true,
  fullscreen = false,
  close = {
    class: "rounded-full",
  },
} = defineProps<{
  autoClose?: boolean;
  close?: boolean | ButtonProps;
  description?: string;
  dismissible?: boolean;
  closeIcon?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  modal?: boolean;
  scrollable?: boolean;
  title?: string;
  ui?: ModalProps["ui"];
}>();
const modelValue = defineModel<boolean>({ default: false });
</script>
<template>
  <UModal
    v-model:open="modelValue"
    :title
    :description
    :close
    :close-icon="closeIcon"
    :fullscreen
    :overlay
    :modal
    :dismissible
    :scrollable
    :ui="ui"
  >
    <template #content>
      <slot name="content" />
    </template>
    <template #header>
      <slot name="header" />
    </template>
    <template #close>
      <slot name="close" />
    </template>
    <template #actions>
      <slot name="actions" />
    </template>
    <template #body>
      <slot />
    </template>
    <template #footer="{ close }">
      <slot name="footer" v-bind="{ close }" />
    </template>
  </UModal>
</template>
