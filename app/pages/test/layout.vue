<script setup lang="ts">
definePageMeta({
  layout: false,
});
</script>
<template>
  <div class="w-full h-full flex flex-col gap-4 p-4">

    <UButton variant="ghost" label="Back" icon="i-lucide-arrow-left" to="/" class="w-fit" />
    <UCard title="Responsive Grid">
      <div class="flex flex-col gap-4">
        <h1>Divide it equally.</h1>
        <div
          class="w-full grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div class="p-4 border">Column 1</div>
          <div class="p-4 border">Column 2</div>
          <div class="p-4 border">Column 3</div>
          <div class="p-4 border">Column 4</div>
        </div>
        <h1>Divide it equally.</h1>
        <div
          class="w-full grid grid-cols-1 md:grid-cols-2  gap-4"
        >
          <div class="p-4 border">Column 1</div>
          <div class="p-4 border">Column 2</div>
        </div>

        <h1>Unequal division</h1>
        <div class="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
          <div class="md:col-span-4 bg-gray-200 p-4">
            Column 1 (4/12 area on a large screen, 100% full screen on a small
            screen)
          </div>

          <div class="md:col-span-8 bg-blue-200 p-4">
            Column 2 (8/12 area on a large screen, 100% full screen on a small
            screen)
          </div>
        </div>

        <div class="w-full border p-1 grid grid-cols-1 md:grid-cols-3 gap-2">
          <div class="bg-primary-200 md:col-span-1">1/3</div>

          <div class="bg-primary-200 md:col-span-2">2/3</div>
        </div>
      </div>
    </UCard>
    <UCard title="Flex Row">
      <div class="flex flex-col gap-4">
        <div class="w-full p-1 flex flex-row gap-2 border">
          <div class="w-full bg-primary-200">01</div>
          <div class="w-full bg-primary-200">02</div>
          <div class="w-full bg-primary-200">03</div>
        </div>

        <USeparator />

        <div>Flex Row Basis</div>

        <div class="w-full border p-1 flex flex-row gap-2">
          <div class="w-full basis-64 bg-primary-200">basis-64</div>
          <div class="w-full basis-64 bg-primary-200">basis-64</div>
          <div class="w-full basis-128 bg-primary-200">basis-128</div>
        </div>

        <div class="w-full border p-1 flex flex-row gap-2">
          <div class="w-full basis-1/3 bg-primary-200">basis-1/3</div>
          <div class="w-full basis-2/3 bg-primary-200">basis-2/3</div>
        </div>

        <div
          class="w-full border border-border rounded-md p-1 flex flex-row gap-2"
        >
          <div class="w-full basis-[70vw] bg-blue-500">
            <div class="text-white">basis-[70vw]</div>
          </div>
          <div class="w-full basis-[30vw] bg-blue-500">
            <div class="text-white">basis-[30vw]</div>
          </div>
        </div>
      </div>
    </UCard>

    <UCard title="Flex wrap">
      <div class="flex flex-col gap-4">
        <div class="text-muted pt-3">flex-nowrap</div>
        <div
          class="w-full border border-border rounded-md p-1 flex flex-row flex-nowrap gap-2"
        >
          <div class="w-full basis-64 bg-blue-500">
            <div class="text-white">basis-64</div>
          </div>
          <div class="w-full basis-64 bg-blue-500">
            <div class="text-white">basis-64</div>
          </div>
          <div class="w-full basis-128 bg-blue-500">
            <div class="text-white">basis-128</div>
          </div>
        </div>
        <div class="text-muted pt-3">flex-wrap</div>
        <div
          class="w-full border border-border rounded-md p-1 flex flex-row flex-wrap gap-2"
        >
          <div class="w-full basis-24 bg-blue-500">
            <div class="text-white">basis-24</div>
          </div>
          <div class="w-full basis-24 bg-blue-500">
            <div class="text-white">basis-24</div>
          </div>
          <div class="w-full basis-128 bg-blue-500">
            <div class="text-white">basis-128</div>
          </div>
        </div>
      </div>
    </UCard>

    <UCard
      title="Flex"
      description=" Utilities for controlling how flex items both grow and shrink."
    >
      <div class="flex flex-col gap-4">
        <div class="text-muted pt-3">Basic example</div>
        <div class="w-full border border-border rounded-md p-1 flex gap-2">
          <div class="w-14 flex-none bg-blue-500">
            <div class="text-white">w-14 flex-none</div>
          </div>
          <div class="w-64 flex-1 bg-blue-500">
            <div class="text-white">w-64 flex-1</div>
          </div>
          <div class="w-32 flex-1 bg-blue-500">
            <div class="text-white">w-32 flex-1</div>
          </div>
        </div>

        <div class="text-muted pt-3">flex-auto</div>
        <div class="w-full border border-border rounded-md p-1 flex gap-2">
          <div class="w-14 flex-none bg-blue-500">
            <div class="text-white">w-14 flex-none</div>
          </div>
          <div class="w-64 flex-auto bg-blue-500">
            <div class="text-white">w-64 flex-auto</div>
          </div>
          <div class="w-32 flex-auto bg-blue-500">
            <div class="text-white">w-32 flex-auto</div>
          </div>
        </div>

        <div class="text-muted pt-3">flex-none</div>
        <div class="w-full border border-border rounded-md p-1 flex gap-2">
          <div class="w-14 flex-none bg-blue-500">
            <div class="text-white">w-14 flex-none</div>
          </div>
          <div class="w-32 flex-none bg-blue-500">
            <div class="text-white">w-32 flex-auto</div>
          </div>
          <div class="w-32 flex-1 bg-blue-500">
            <div class="text-white">w-32 flex-1</div>
          </div>
        </div>

        <div class="text-muted pt-3">grow</div>
        <div class="w-full border border-border rounded-md p-1 flex gap-2">
          <div class="size-14 flex-none bg-blue-500">
            <div class="text-white">size-14 flex-none</div>
          </div>
          <div class="size-14 grow bg-blue-500">
            <div class="text-white">size-14 grow</div>
          </div>
          <div class="size-14 flex-none bg-blue-500">
            <div class="text-white">size-14 flex-none</div>
          </div>
        </div>
      </div>
    </UCard>

    <UCard
      title="grid-column"
      description="Utilities for controlling how elements are sized and placed across grid columns."
    >
      <div class="flex flex-col gap-4">
        <div class="text-muted pt-3">Basic columns</div>
        <div
          class="w-full border border-border rounded-md p-1 grid grid-cols-3 gap-2"
        >
          <div class="w-full bg-blue-500">
            <div class="text-white">01</div>
          </div>
          <div class="w-full bg-blue-500">
            <div class="text-white">02</div>
          </div>
          <div class="w-full bg-blue-500">
            <div class="text-white">03</div>
          </div>
          <div class="w-full bg-blue-500">
            <div class="text-white">04</div>
          </div>
        </div>

        <div class="text-muted pt-3">Spanning columns</div>
        <div
          class="w-full border border-border rounded-md p-1 grid grid-cols-3 gap-2"
        >
          <div class="w-full bg-blue-500">
            <div class="text-white">01</div>
          </div>
          <div class="w-full bg-blue-500">
            <div class="text-white">02</div>
          </div>
          <div class="w-full bg-blue-500">
            <div class="text-white">03</div>
          </div>
          <div class="w-full col-span-2 bg-blue-500">
            <div class="text-white">col-span-2</div>
          </div>
          <div class="w-full bg-blue-500">
            <div class="text-white">05</div>
          </div>
        </div>
      </div>
    </UCard>

    <UCard
      title="justify-content"
      description="Utilities for controlling how flex and grid items are positioned along a container's main axis."
    >
      <div class="flex flex-col gap-4">
        <div class="text-muted pt-3">justify-start</div>
        <div
          class="w-full border border-border rounded-md p-1 flex justify-start gap-2"
        >
          <div class="p-4 bg-blue-500">
            <div class="text-white">01</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">02</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">03</div>
          </div>
        </div>

        <div class="text-muted pt-3">justify-center</div>
        <div
          class="w-full border border-border rounded-md p-1 flex justify-center gap-2"
        >
          <div class="p-4 bg-blue-500">
            <div class="text-white">01</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">02</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">03</div>
          </div>
        </div>

        <div class="text-muted pt-3">justify-end</div>
        <div
          class="w-full border border-border rounded-md p-1 flex justify-end gap-2"
        >
          <div class="p-4 bg-blue-500">
            <div class="text-white">01</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">02</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">03</div>
          </div>
        </div>

        <div class="text-muted pt-3">justify-between</div>
        <div
          class="w-full border border-border rounded-md p-1 flex justify-between gap-2"
        >
          <div class="p-4 bg-blue-500">
            <div class="text-white">01</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">02</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">03</div>
          </div>
        </div>

        <div class="text-muted pt-3">justify-around</div>
        <div
          class="w-full border border-border rounded-md p-1 flex justify-around gap-2"
        >
          <div class="p-4 bg-blue-500">
            <div class="text-white">01</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">02</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">03</div>
          </div>
        </div>

        <div class="text-muted pt-3">justify-evenly</div>
        <div
          class="w-full border border-border rounded-md p-1 flex justify-evenly gap-2"
        >
          <div class="p-4 bg-blue-500">
            <div class="text-white">01</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">02</div>
          </div>
          <div class="p-4 bg-blue-500">
            <div class="text-white">03</div>
          </div>
        </div>
      </div>
    </UCard>

    <UCard title="align-items">
      <div class="flex flex-col gap-4">
        <div class="text-muted pt-3">items-stretch</div>
        <div
          class="w-full bg-zinc-500 border border-border rounded-md p-1 flex items-stretch gap-2"
        >
          <div class="w-full bg-blue-500">
            <div class="text-white py-4">01</div>
          </div>
          <div class="w-full bg-blue-500 py-12">
            <div class="text-white">02</div>
          </div>
          <div class="w-full bg-blue-500 py-8">
            <div class="text-white">03</div>
          </div>
        </div>

        <div class="text-muted pt-3">items-start</div>
        <div
          class="w-full bg-zinc-500 border border-border rounded-md p-1 flex items-start gap-2"
        >
          <div class="w-full bg-blue-500">
            <div class="text-white py-4">01</div>
          </div>
          <div class="w-full bg-blue-500 py-12">
            <div class="text-white">02</div>
          </div>
          <div class="w-full bg-blue-500 py-8">
            <div class="text-white">03</div>
          </div>
        </div>
        <div class="text-muted pt-3">items-center</div>
        <div
          class="w-full bg-zinc-500 border border-border rounded-md p-1 flex items-center gap-2"
        >
          <div class="w-full bg-blue-500">
            <div class="text-white py-4">01</div>
          </div>
          <div class="w-full bg-blue-500 py-12">
            <div class="text-white">02</div>
          </div>
          <div class="w-full bg-blue-500 py-8">
            <div class="text-white">03</div>
          </div>
        </div>
        <div
          class="w-full border border-border rounded-md my-2 p-1 flex items-center"
        >
          <div class="flex items-center">
            <div
              class="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center"
            >
              <div class="text-zinc-900 text-xs">🌙</div>
            </div>
            <div class="pl-2">
              <div class="app-text text-lg font-semibold">Spencer Sharp</div>
              <div class="text-sm text-muted">
                Working on the future of astronaut recruitment at Space Recruit.
              </div>
            </div>
          </div>
          <div class="text-muted">abc.com</div>
        </div>

        <div class="text-muted pt-3">items-end</div>
        <div
          class="w-full bg-zinc-500 border border-border rounded-md p-1 flex items-end gap-2"
        >
          <div class="w-full bg-blue-500">
            <div class="text-white py-4">01</div>
          </div>
          <div class="w-full bg-blue-500 py-12">
            <div class="text-white">02</div>
          </div>
          <div class="w-full bg-blue-500 py-8">
            <div class="text-white">03</div>
          </div>
        </div>

        <div class="text-muted pt-3">items-baseline</div>
        <div
          class="w-full bg-zinc-500 border border-border rounded-md p-1 flex items-baseline gap-2"
        >
          <div class="w-full bg-blue-500 pt-2 pb-6">
            <div class="text-white py-4">01</div>
          </div>
          <div class="w-full bg-blue-500 pt-8 pb-12">
            <div class="text-white">02</div>
          </div>
          <div class="w-full bg-blue-500 pt-12 pb-4">
            <div class="text-white">03</div>
          </div>
        </div>

        <div class="text-muted pt-3">items-baseline-last</div>
        <div
          class="w-full border border-border rounded-md p-1 grid grid-cols-[1fr_auto] items-baseline-last"
        >
          <div class="flex">
            <div
              class="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center"
            >
              <div class="text-zinc-900 text-xs">🌙</div>
            </div>
            <div class="pl-2">
              <div class="app-text text-lg font-semibold">Spencer Sharp</div>
              <div class="text-sm text-muted">
                Working on the future of astronaut recruitment at Space Recruit.
              </div>
            </div>
          </div>
          <div class="text-muted">abc.com</div>
        </div>
      </div>
    </UCard>
  </div>
</template>
