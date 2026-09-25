<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCVState } from '~/composables/useCVState'
import type { ExperienceItem } from '~/composables/useCVState'

definePageMeta({
  layout: 'editor',
})

const { experience } = useCVState()
const router = useRouter()
const showErrors = ref(false)
const localEntries = ref<ExperienceItem[]>([])

function createEntry(): ExperienceItem {
  return {
    id: crypto.randomUUID(),
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
  }
}

function hasAnyText(value: string) {
  return value.trim().length > 0
}

function syncExperienceFromLocal() {
  const filtered = localEntries.value.filter((entry) => {
    return hasAnyText(entry.title)
      || hasAnyText(entry.company)
      || hasAnyText(entry.location)
      || hasAnyText(entry.startDate)
      || hasAnyText(entry.endDate)
      || hasAnyText(entry.description)
  })

  experience.value = filtered
}

onMounted(() => {
  if (experience.value.length === 0) {
    localEntries.value = [createEntry()]
    return
  }

  localEntries.value = experience.value.map(item => ({ ...item }))
})

watch(localEntries, () => {
  syncExperienceFromLocal()
}, { deep: true })

function addEntry() {
  localEntries.value.push(createEntry())
}

function removeEntry(id: string) {
  const index = localEntries.value.findIndex(entry => entry.id === id)
  if (index === -1) {
    return
  }

  if (localEntries.value.length > 1) {
    localEntries.value.splice(index, 1)
    return
  }

  localEntries.value[0] = createEntry()
}

function isEntryValid(entry: ExperienceItem) {
  return entry.title.trim() !== '' && entry.company.trim() !== '' && entry.startDate.trim() !== ''
}

function handleNext() {
  showErrors.value = true
  if (localEntries.value.every(isEntryValid)) {
    router.push('/editor/education')
  }
}
</script>

<template>
  <div class="px-16 lg:px-20 py-10 max-w-4xl mx-auto w-full pb-32">
    <!-- Header -->
    <div class="mb-10">
      <NuxtLink
        to="/editor/summary"
        class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#B64A22] hover:text-[#9A4C2C] mb-6 transition-colors"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        /></svg>
        Back to Summary
      </NuxtLink>

      <h1 class="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
        Employment History
      </h1>
      <p class="text-gray-500 text-[15px]">
        Show your relevant experience (last 10 years).
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <div
        v-for="(entry, index) in localEntries"
        :key="entry.id"
        class="flex flex-col gap-6"
        :class="index > 0 ? 'pt-8 border-t border-gray-200' : ''"
        :data-testid="`experience-card-${index}`"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-[13px] font-medium text-gray-500">
            Position {{ index + 1 }}
          </h3>
          <button
            class="text-xs text-red-500 hover:underline"
            :data-testid="`remove-experience-${index}`"
            aria-label="Remove position"
            @click="removeEntry(entry.id)"
          />
        </div>

        <div class="grid grid-cols-2 gap-6">
          <EditorFormField
            v-model="entry.title"
            label="Job Title"
            placeholder="e.g. Senior Frontend Developer"
            required
            :error="showErrors && !entry.title.trim() ? 'Job title is required' : ''"
          />
          <EditorFormField
            v-model="entry.company"
            label="Company / Employer"
            placeholder="e.g. Acme Corp"
            required
            :error="showErrors && !entry.company.trim() ? 'Company name is required' : ''"
          />
        </div>

        <EditorFormField
          v-model="entry.location"
          label="Location"
          placeholder="e.g. Accra, Ghana or Remote"
        />

        <div class="grid grid-cols-2 gap-6">
          <EditorFormField
            v-model="entry.startDate"
            label="Start Date"
            placeholder="e.g. 01/2022"
            required
            :error="showErrors && !entry.startDate.trim() ? 'Start date is required' : ''"
          />
          <EditorFormField
            v-model="entry.endDate"
            label="End Date"
            placeholder="e.g. Present or 12/2024"
          />
        </div>

        <div class="flex flex-col gap-2.5">
          <label class="text-[13px] font-semibold text-gray-700">Description / Responsibilities</label>
          <textarea
            v-model="entry.description"
            rows="4"
            placeholder="e.g. Led development of core product features, reduced build time by 40%, mentored 3 junior developers..."
            class="w-full rounded-xl border border-gray-300 p-4 focus:outline-none focus:ring-2 focus:ring-[#C54A22]/20 focus:border-[#C54A22] transition-all text-[15px] resize-y"
          />
        </div>
      </div>

      <button
        data-testid="add-another-experience"
        class="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 hover:border-[#C54A22] hover:bg-[#FCF1EC]/50 text-gray-500 hover:text-[#C54A22] rounded-xl text-[13px] font-semibold transition-all"
        @click="addEntry"
      >
        <span class="text-lg leading-none">+</span>
        Add Another Position
      </button>
    </div>

    <div class="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between pb-12">
      <NuxtLink
        to="/editor/education"
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
      <button
        class="inline-flex items-center gap-2 px-8 py-3 bg-[#C54A22] hover:bg-[#A83D1B] active:scale-95 cursor-pointer text-white rounded-[10px] text-sm font-bold transition-all shadow-sm"
        @click="handleNext"
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
      </button>
    </div>
  </div>
</template>
