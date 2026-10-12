<script setup lang="ts">
import type { useTemplates } from '~/composables/useTemplates'
import { Star } from '@lucide/vue'

type Template = ReturnType<typeof useTemplates>['templates']['value'][number]

const props = defineProps<{
  template: Template
  recommended?: boolean
}>()

const emit = defineEmits<{
  'open-preview': [template: Template]
}>()
</script>

<template>
  <article
    :class="[
      'group relative flex flex-col cursor-pointer rounded-xl bg-white border shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 motion-reduce:hover:translate-y-0 motion-reduce:transition-none focus-within:ring-2 focus-within:ring-offset-2',
      props.recommended ? 'border-[#F26438] ring-2 ring-[#F26438]/20 shadow-md hover:shadow-lg' : 'border-gray-200 hover:shadow-lg hover:border-[#F26438]/40 focus-within:ring-[#F26438]',
    ]"
    @click="emit('open-preview', props.template)"
  >
    <!-- Keyboard accessible button overlay -->
    <button
      class="absolute inset-0 rounded-xl z-10 focus:outline-none"
      :aria-label="`Preview ${props.template.name} template`"
      @click.stop="emit('open-preview', props.template)"
    />

    <!-- Thumbnail Image -->
    <div
      class="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-[#F0EDE8] relative flex items-center justify-center"
    >
      <!-- Recommended Badge -->
      <div
        v-if="props.recommended"
        class="absolute top-2 left-2 bg-[#F26438] text-white text-[10px] uppercase tracking-wide font-bold px-2.5 py-1 rounded-full shadow-md z-20 flex items-center gap-1.5"
      >
        <Star class="w-3 h-3 fill-white" />
        Recommended
      </div>

      <img
        :src="props.template.image"
        :alt="`Preview of ${props.template.name} template`"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-105 group-hover:-translate-y-2 group-focus-within:scale-105"
        loading="lazy"
        decoding="async"
      >

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
