<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { LayoutTemplate } from '@lucide/vue'
import { useTemplates } from '~/composables/useTemplates'
import { useOnboarding } from '~/composables/useOnboarding'

type Template = ReturnType<typeof useTemplates>['templates']['value'][number]

const { templates, loading, error, fetchTemplates } = useTemplates()
const { getRecommendedTemplateId } = useOnboarding()

const recommendedTemplateSlug = computed(() => getRecommendedTemplateId())

const sortedTemplates = computed(() => {
  if (!recommendedTemplateSlug.value || !templates.value.length) return templates.value

  const recSlug = recommendedTemplateSlug.value
  const result = [...templates.value]

  const recIndex = result.findIndex(t => t.slug === recSlug)
  if (recIndex > -1) {
    const [rec] = result.splice(recIndex, 1)
    result.unshift(rec!)
  }
  return result
})

const emit = defineEmits<{
  'open-preview': [template: Template]
}>()

const handleOpenPreview = (template: Template) => {
  emit('open-preview', template)
}

onMounted(() => {
  fetchTemplates()
})
</script>

<template>
  <section aria-label="Template gallery">
    <div
      v-if="loading"
      class="py-24 text-center"
    >
      <div
        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent text-[#F26438] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      >
        <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
      </div>
    </div>

    <div
      v-else-if="error"
      class="py-24 text-center text-red-500"
    >
      <p>{{ error }}</p>
      <button
        class="mt-4 px-4 py-2 border rounded-md hover:bg-gray-50"
        @click="fetchTemplates"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="templates.length > 0"
      class="grid gap-4 sm:gap-6 w-full"
      style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));"
      role="list"
    >
      <div
        v-for="template in sortedTemplates"
        :key="template.templateId"
        role="listitem"
      >
        <TemplatesTemplateCard
          :template="template"
          :recommended="template.slug === recommendedTemplateSlug"
          @open-preview="handleOpenPreview"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div class="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
        <LayoutTemplate class="w-7 h-7 text-gray-400" />
      </div>
      <p class="text-sm font-medium text-gray-500">
        No templates yet.
      </p>
    </div>
  </section>
</template>
