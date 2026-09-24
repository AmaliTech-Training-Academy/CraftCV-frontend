<script setup lang="ts">
definePageMeta({
  layout: 'editor',
})
</script>

<template>
  <div class="px-16 lg:px-20 py-10 max-w-4xl mx-auto w-full pb-32">
    <!-- Header -->
    <div class="mb-10">
      <NuxtLink to="/editor/skills" class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#B64A22] hover:text-[#9A4C2C] mb-6 transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Skills
      </NuxtLink>
      
      <h1 class="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">Certifications</h1>
      <p class="text-gray-500 text-[15px]">Include relevant certifications or licenses to show employers you have verified expertise.</p>
    </div>
    
    <div class="flex items-center justify-center py-20 bg-white border border-gray-200 border-dashed rounded-xl">
      <p class="text-gray-500 font-semibold">Placeholder for Certifications Form</p>
    </div>

    <!-- Bottom Action Bar -->
    <div class="mt-14 pt-8 border-t border-gray-100 flex flex-row items-center justify-between pb-12">
      <div class="flex-1"></div>
      <NuxtLink to="/dashboard" class="inline-flex items-center gap-2 px-8 py-3 bg-[#111827] hover:bg-black text-white rounded-[10px] text-sm font-bold transition-colors shadow-sm active:scale-95">
        Finish & Go to Dashboard
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7-7 7"></path></svg>
      </NuxtLink>
    </div>
  </div>
</template>
