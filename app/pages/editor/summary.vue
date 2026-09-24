<script setup lang="ts">
import { useCVState } from '~/composables/useCVState'

definePageMeta({
  layout: 'editor',
})

const { summary } = useCVState()
</script>

<template>
  <div class="px-16 lg:px-20 py-10 max-w-4xl mx-auto w-full">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
        Professional Summary
      </h1>
      <p class="text-gray-500 text-[15px]">
        Write a short, impactful summary highlighting your key achievements and skills.
      </p>
    </div>

    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-2.5">
        <label class="text-[13px] font-semibold text-gray-700">Summary</label>
        <div class="relative">
          <textarea
            v-model="summary"
            rows="6"
            placeholder="e.g. Innovative Product Designer with 5+ years of experience..."
            class="w-full rounded-xl border border-gray-200 p-4 focus:outline-none focus:ring-2 focus:ring-[#C54A22]/20 focus:border-[#C54A22] transition-all text-[15px] resize-y"
          />
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between pb-12">
      <button class="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2">
        Skip for now
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        /></svg>
      </button>
      <NuxtLink
        to="/editor/experience"
        class="inline-flex items-center gap-2 px-8 py-3 bg-[#C54A22] hover:bg-[#A83D1B] text-white rounded-[10px] text-sm font-bold transition-colors shadow-sm active:scale-95"
      >
        Next
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
