<script setup lang="ts">
import { ref } from 'vue'
import type { useTemplates } from '~/composables/useTemplates'

definePageMeta({
  layout: 'dashboard',
})

type Template = ReturnType<typeof useTemplates>['templates']['value'][number]

// Modal state — Phase 4 will consume this
const isModalOpen = ref(false)
const selectedTemplate = ref<Template | null>(null)

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
</script>

<template>
  <div class="min-h-full">
    <div class="px-8 py-8 max-w-7xl mx-auto">
      <!-- Page Header -->
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">
          Choose your template
        </h1>
        <p class="text-sm text-gray-500">
          Pick a design you like — you can customize or switch it anytime.
        </p>
      </header>

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
      @use-template="(t) => console.log('Selected template:', t.id)"
    />
  </div>
</template>
