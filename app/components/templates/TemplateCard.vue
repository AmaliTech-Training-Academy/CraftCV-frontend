<script setup lang="ts">
import type { useTemplates } from '~/composables/useTemplates'

type Template = ReturnType<typeof useTemplates>['templates']['value'][number]

const props = defineProps<{
  template: Template
}>()

const emit = defineEmits<{
  'open-preview': [template: Template]
}>()
</script>

<template>
  <article
    class="group relative flex flex-col cursor-pointer rounded-xl bg-white border border-gray-200 shadow-sm
           hover:shadow-lg hover:border-[#F26438]/40
           focus-within:ring-2 focus-within:ring-[#F26438] focus-within:ring-offset-2
           transition-all duration-200 ease-out hover:-translate-y-1
           motion-reduce:hover:translate-y-0 motion-reduce:transition-none"
    @click="emit('open-preview', props.template)"
  >
    <!-- Keyboard accessible button overlay -->
    <button
      class="absolute inset-0 rounded-xl z-10 focus:outline-none"
      :aria-label="`Preview ${props.template.name} template`"
      @click.stop="emit('open-preview', props.template)"
    />

    <!-- Thumbnail Image -->
    <div class="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-[#F0EDE8] relative">
      <img
        v-if="props.template.image"
        :src="props.template.image"
        :alt="`${props.template.name} preview`"
        class="w-full h-full object-contain"
      >
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400 text-sm"
      >
        No preview
      </div>

      <!-- Hover overlay: subtle "Preview" label -->
      <div
        class="absolute inset-0 rounded-t-xl bg-black/0 group-hover:bg-black/10
               flex items-center justify-center opacity-0 group-hover:opacity-100
               transition-all duration-200"
      >
        <span class="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
          Preview
        </span>
      </div>
    </div>

    <!-- Card Footer: Template name -->
    <div class="px-4 py-3">
      <span class="text-sm font-semibold text-gray-900 tracking-wide uppercase">
        {{ props.template.name }}
      </span>
    </div>
  </article>
</template>
