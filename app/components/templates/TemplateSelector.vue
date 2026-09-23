<script setup lang="ts">
import { LayoutTemplate } from '@lucide/vue'
import type { useTemplates } from '~/composables/useTemplates'

type Template = ReturnType<typeof useTemplates>['templates']['value'][number]

const { templates } = useTemplates()

const emit = defineEmits<{
  'open-preview': [template: Template]
}>()

const handleOpenPreview = (template: Template) => {
  emit('open-preview', template)
}
</script>

<template>
  <section aria-label="Template gallery">
    <div
      v-if="templates.length > 0"
      class="grid gap-6"
      style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));"
      role="list"
    >
      <div
        v-for="template in templates"
        :key="template.id"
        role="listitem"
      >
        <TemplatesTemplateCard
          :template="template"
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
