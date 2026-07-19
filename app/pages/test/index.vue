<script setup lang="ts">

definePageMeta({
  layout: false,
});
useSeoMeta({
  title: "Test page",
});


</script>
<template>
  <div class="flex flex-col gap-4 p-4">
    <UButton
      label="Home"
      icon="lucide:arrow-left"
      to="/"
      class="w-fit"
      variant="ghost"
    />

    <div class="flex flex-col gap-4">
      <UButton label="default" class="w-fit" />
      <UButton label="error" color="error" class="w-fit" />
      <UButton label="warning" color="warning" class="w-fit" />
      <UButton label="success" color="success" class="w-fit" />
      <UButton label="primary" color="primary" class="w-fit" />
      <UAvatar src="https://github.com/benjamincanac.png" />
      <UBadge label="Badge" class="w-fit" />
    </div>


  </div>
</template>
