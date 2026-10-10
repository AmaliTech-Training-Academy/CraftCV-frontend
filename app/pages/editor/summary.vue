<script setup lang="ts">
import { useCVState } from '~/composables/useCVState'

useHead({ title: 'Professional Summary' })

definePageMeta({
  layout: 'editor',
  middleware: ['auth'],
})

const { summary, saveErrorFor } = useCVState()

/**
 * The summary is a field of the CV record itself, not of a section entry, which
 * is why it is looked up under 'cv'.
 */
const backendError = () => saveErrorFor('cv', 'professionalSummary')
</script>

<template>
  <div class="px-4 sm:px-8 lg:px-20 py-10 max-w-4xl mx-auto w-full">
    <!-- Header -->
    <EditorSectionHeader
      title="Professional Summary"
      description="Write a brief overview of your background, key achievements, and career goals."
      back-link="/editor/personal"
      back-text="Back to Personal Details"
    />

    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-2.5">
        <label class="text-[13px] font-semibold text-gray-700">Summary</label>
        <div class="relative">
          <textarea
            v-model="summary"
            rows="6"
            placeholder="e.g. Innovative Product Designer with 5+ years of experience..."
            :aria-invalid="Boolean(backendError())"
            :aria-describedby="backendError() ? 'summary-error' : undefined"
            class="w-full rounded-xl border p-4 focus:outline-none focus:ring-2 transition-all text-[15px] resize-y"
            :class="[
              backendError()
                ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500'
                : 'border-gray-300 focus:ring-[#C54A22]/20 focus:border-[#C54A22]',
            ]"
          />
          <p
            v-if="backendError()"
            id="summary-error"
            role="alert"
            class="text-xs font-semibold text-red-500 mt-1.5"
          >
            {{ backendError() }}
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between pb-12">
      <NuxtLink
        to="/editor/experience"
        class="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
      >
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
      </NuxtLink>
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
