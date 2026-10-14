<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en',
  },
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - CraftCV` : 'CraftCV'
  },
})
</script>

<template>
  <div class="font-sans bg-stone-50 text-stone-900 min-h-screen">
    <NuxtRouteAnnouncer />
    <NuxtLayout :key="String($route.meta.layout ?? 'default')">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
