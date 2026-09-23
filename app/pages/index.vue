<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})
</script>

<template>
  <div class="min-h-full px-8 py-8 max-w-7xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">
        My Resumes
      </h1>
      <p class="text-sm text-gray-500">
        Your saved resumes will appear here.
      </p>
    </header>

    <!-- Empty state -->
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <p class="text-gray-400 text-sm">
        No resumes yet. Pick a template to get started.
      </p>
      <NuxtLink
        to="/templates"
        class="mt-4 px-5 py-2.5 rounded-xl bg-[#F26438] text-white text-sm font-semibold hover:bg-[#d95a30] transition-colors"
      >
        Browse templates
      </NuxtLink>
    </div>
  </div>
</template>
