<script setup lang="ts">
definePageMeta({
  layout: 'editor',
})
</script>

<template>
  <div class="px-16 lg:px-20 py-10 max-w-4xl mx-auto w-full pb-32">
    <!-- Header -->
    <div class="mb-10">
      <NuxtLink to="/editor/experience" class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#B64A22] hover:text-[#9A4C2C] mb-6 transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Employment History
      </NuxtLink>
      
      <h1 class="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">Education</h1>
      <p class="text-gray-500 text-[15px]">A varied education on your resume sums up the value that your learnings and background will bring to job.</p>
    </div>
    
    <div class="flex items-center justify-center py-20 bg-white border border-gray-200 border-dashed rounded-xl">
      <p class="text-gray-500 font-semibold">Placeholder for Education Form</p>
    </div>

    <!-- Bottom Action Bar -->
    <div class="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between pb-12">
      <NuxtLink to="/editor/skills" class="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2">
        Skip for now
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </NuxtLink>
      <NuxtLink to="/editor/skills" class="inline-flex items-center gap-2 px-8 py-3 bg-[#C54A22] hover:bg-[#A83D1B] text-white rounded-[10px] text-sm font-bold transition-colors shadow-sm active:scale-95">
        Next
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7-7 7"></path></svg>
      </NuxtLink>
    </div>
  </div>
</template>
