<script setup lang="ts">
useHead({ title: 'Certifications' })
definePageMeta({
  layout: 'editor',
  middleware: ['auth'],
})
</script>

<template>
  <div class="px-4 sm:px-8 lg:px-20 py-10 max-w-4xl mx-auto w-full pb-32">
    <!-- Header -->
    <EditorSectionHeader
      title="Certifications"
      description="Include relevant certifications or licenses to show employers you have verified expertise."
      back-link="/editor/skills"
      back-text="Back to Skills"
    />

    <div class="flex items-center justify-center py-20 bg-white border border-gray-200 border-dashed rounded-xl">
      <p class="text-gray-500 font-semibold">
        Placeholder for Certifications Form
      </p>
    </div>

    <!-- Bottom Action Bar -->
    <div class="mt-14 pt-8 border-t border-gray-100 flex flex-row items-center justify-between pb-12">
      <div class="flex-1" />
      <NuxtLink
        to="/dashboard"
        class="inline-flex items-center gap-2 px-8 py-3 bg-[#111827] hover:bg-black text-white rounded-[10px] text-sm font-bold transition-colors shadow-sm active:scale-95"
      >
        Finish & Go to Dashboard
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 12h14m-7-7l7 7-7 7"
        /></svg>
      </NuxtLink>
    </div>
  </div>
</template>
