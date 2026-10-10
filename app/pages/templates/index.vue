<script setup lang="ts">
import { ref } from 'vue'
import { AlertCircle, Loader2 } from '@lucide/vue'
import type { useTemplates } from '~/composables/useTemplates'
import { useCVState } from '~/composables/useCVState'
import { useCVs } from '~/composables/useCVs'
import { extractErrorMessage } from '~/utils/api'

useHead({ title: 'Choose Template' })

definePageMeta({
  layout: 'dashboard',
})

type Template = ReturnType<typeof useTemplates>['templates']['value'][number]

// Modal state — Phase 4 will consume this
const isModalOpen = ref(false)
const selectedTemplate = ref<Template | null>(null)

// Categories for mobile pill strip
const categories = ref(['All'])
const activeCategory = ref('All')

const openPreview = (template: Template) => {
  selectedTemplate.value = template
  isModalOpen.value = true
}

const closePreview = () => {
  isModalOpen.value = false
  selectedTemplate.value = null
}

const navigateTemplate = (template: Template) => {
  selectedTemplate.value = template
}

const isCreating = ref(false)
const createError = ref<string | null>(null)
const { selectedTemplateId, selectedTemplateSlug, resetCV } = useCVState()
const { createCV } = useCVs()

const handleUseTemplate = async (template: Template) => {
  closePreview()
  isCreating.value = true
  createError.value = null

  // Start from a clean slate: without this, choosing a new template after
  // editing another CV would carry that CV's personal details and sections
  // into the new one. resetCV also clears the cvId cookie, which is what stops
  // the editor loading the previous CV instead of this one.
  resetCV()

  // Record the choice locally up front so the editor's preview renders in the
  // right design from its first paint.
  selectedTemplateId.value = template.templateId
  selectedTemplateSlug.value = template.slug

  try {
    // Create the CV now rather than waiting for the first autosave. Otherwise a
    // user who picks a template and leaves would find nothing in My Resumes.
    await createCV(template.templateId)
    await navigateTo('/editor/personal')
  }
  catch (err) {
    createError.value = extractErrorMessage(err, 'Couldn\'t start your CV. Please try again.')
  }
  finally {
    isCreating.value = false
  }
}
</script>

<template>
  <div class="min-h-full">
    <div class="px-4 sm:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
      <!-- Page Header -->
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">
          Choose your template
        </h1>
        <p class="text-sm text-gray-500">
          Pick a design you like — you can customize or switch it anytime.
        </p>
      </header>

      <!-- Creating the CV failed — stay put and say so, rather than opening an
           editor for a CV the backend never made. -->
      <div
        v-if="createError"
        role="alert"
        class="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-6"
      >
        <AlertCircle class="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
        <p class="text-sm font-medium text-red-700">
          {{ createError }}
        </p>
      </div>

      <!-- Mobile Categories Pill Strip (Hidden on md+, only shows if > 1 category) -->
      <div
        v-if="categories.length > 1"
        class="md:hidden flex overflow-x-auto gap-2 pb-6 -mt-2 scrollbar-hide"
      >
        <button
          v-for="cat in categories"
          :key="cat"
          :class="[
            'whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors',
            activeCategory === cat
              ? 'bg-[#F26438] text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
          ]"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Template Grid -->
      <TemplatesTemplateSelector @open-preview="openPreview" />
    </div>

    <!-- Preview Modal -->
    <TemplatesTemplatePreviewModal
      v-if="selectedTemplate"
      :template="selectedTemplate"
      :is-open="isModalOpen"
      @close="closePreview"
      @navigate="navigateTemplate"
      @use-template="handleUseTemplate"
    />

    <!-- Loading Overlay for CV Creation -->
    <div
      v-if="isCreating"
      class="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/30 backdrop-blur-sm transition-opacity"
    >
      <div class="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 w-[280px] animate-in fade-in zoom-in-95 duration-200">
        <Loader2 class="w-9 h-9 text-[#F26438] animate-spin" />
        <p class="text-sm font-bold text-gray-700">
          Setting up your CV...
        </p>
      </div>
    </div>
  </div>
</template>
