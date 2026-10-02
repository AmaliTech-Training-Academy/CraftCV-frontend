<script setup lang="ts">
import { ref } from 'vue'
import { Loader2 } from '@lucide/vue'
import type { useTemplates } from '~/composables/useTemplates'
import { useCVState } from '~/composables/useCVState'

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
const { hasActiveCV, selectedTemplateId, selectedTemplateSlug } = useCVState()

const handleUseTemplate = async (template: Template) => {
  closePreview()
  isCreating.value = true

  // Save template selection and mark CV as active
  selectedTemplateId.value = template.templateId
  selectedTemplateSlug.value = template.slug
  hasActiveCV.value = true

  // Simulate network request/CV creation time
  await new Promise(resolve => setTimeout(resolve, 1500))

  isCreating.value = false
  await navigateTo('/editor/personal')
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
