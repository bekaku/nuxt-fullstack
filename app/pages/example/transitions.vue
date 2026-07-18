<script setup lang="ts">
definePageMeta({
  layout: "default",
});
useSeoMeta({
  title: "Transitions page",
});
const fade = ref(false);
const slideLeft = ref(false);
const slideRight = ref(false);
const slideUp = ref(false);
const slideDown = ref(false);
const zoom = ref(false);
const bounce = ref(false);

const text =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
</script>

<template>
  <BaseDashboardPanel id="example-transitions" title="Transitions page">
    <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard :ui="{root: 'overflow-hidden',}">
        <template #header>
          <h1 class="font-bold">Fade</h1>
          <UButton
            :label="fade ? 'Hide me' : ' Show me'"
            @click="
              () => {
                fade = !fade;
              }
            "
          >
          </UButton>
        </template>
        <BaseTransitionWrapper name="fade">
          <div v-if="fade" class="div text-h5 q-pa-md">{{ text }}</div>
        </BaseTransitionWrapper>
      </UCard>
      <UCard :ui="{root: 'overflow-hidden',}">
        <template #header>
          <h1 class="font-bold">Slide Left</h1>
          <UButton
            :label="slideLeft ? 'Hide me' : ' Show me'"
            @click="
              () => {
                slideLeft = !slideLeft;
              }
            "
          >
          </UButton>
        </template>
        <BaseTransitionWrapper name="slide-left">
          <div v-if="slideLeft" class="div text-h5 q-pa-md">{{ text }}</div>
        </BaseTransitionWrapper>
      </UCard>
      <UCard :ui="{root: 'overflow-hidden',}">
        <template #header>
          <h1 class="font-bold">Slide Right</h1>
          <UButton
            :label="slideRight ? 'Hide me' : ' Show me'"
            @click="
              () => {
                slideRight = !slideRight;
              }
            "
          >
          </UButton>
        </template>
        <BaseTransitionWrapper name="slide-right">
          <div v-if="slideRight" class="div text-h5 q-pa-md">{{ text }}</div>
        </BaseTransitionWrapper>
      </UCard>
      <UCard :ui="{root: 'overflow-hidden',}">
        <template #header>
          <h1 class="font-bold">Slide Up</h1>
          <UButton
            :label="slideUp ? 'Hide me' : ' Show me'"
            @click="
              () => {
                slideUp = !slideUp;
              }
            "
          >
          </UButton>
        </template>
        <BaseTransitionWrapper name="slide-up">
          <div v-if="slideUp" class="div text-h5 q-pa-md">{{ text }}</div>
        </BaseTransitionWrapper>
      </UCard>
      <UCard :ui="{root: 'overflow-hidden',}">
        <template #header>
          <h1 class="font-bold">Slide Down</h1>
          <UButton
            :label="slideDown ? 'Hide me' : ' Show me'"
            @click="
              () => {
                slideDown = !slideDown;
              }
            "
          >
          </UButton>
        </template>
        <BaseTransitionWrapper name="slide-down">
          <div v-if="slideDown" class="div text-h5 q-pa-md">{{ text }}</div>
        </BaseTransitionWrapper>
      </UCard>
      <UCard :ui="{root: 'overflow-hidden',}">
        <template #header>
          <h1 class="font-bold">Zoom</h1>
          <UButton
            :label="zoom ? 'Hide me' : ' Show me'"
            @click="
              () => {
                zoom = !zoom;
              }
            "
          >
          </UButton>
        </template>
        <BaseTransitionWrapper name="zoom">
          <div v-if="zoom" class="div text-h5 q-pa-md">{{ text }}</div>
        </BaseTransitionWrapper>
      </UCard>
      <UCard :ui="{root: 'overflow-hidden',}">
        <template #header>
          <h1 class="font-bold">Bounce</h1>
          <UButton
            :label="bounce ? 'Hide me' : ' Show me'"
            @click="
              () => {
                bounce = !bounce;
              }
            "
          >
          </UButton>
        </template>
        <BaseTransitionWrapper name="bounce">
          <div v-if="bounce" class="div text-h5 q-pa-md">{{ text }}</div>
        </BaseTransitionWrapper>
      </UCard>
    </div>
  </BaseDashboardPanel>
</template>
