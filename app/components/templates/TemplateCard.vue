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

    <!-- Thumbnail Placeholder: visual diff per template type -->
    <div class="aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-[#F0EDE8] p-3 relative">
      <!-- Two-Column (Atlantic) placeholder -->
      <template v-if="props.template.component === 'TwoColumnTemplate'">
        <!-- Dark header bar -->
        <div class="w-full h-[18%] rounded-md bg-[#363f4f] mb-2 flex items-end px-2 pb-1.5 gap-1">
          <div class="h-2 w-24 rounded-sm bg-white/70" />
          <div class="h-1.5 w-16 rounded-sm bg-white/40" />
        </div>
        <!-- Two-column body -->
        <div class="flex gap-2 h-[78%]">
          <!-- Sidebar col -->
          <div class="w-[35%] bg-[#363f4f]/10 rounded-md px-1.5 py-2 flex flex-col gap-1.5">
            <div class="h-1 w-full rounded-sm bg-gray-400/50" />
            <div class="h-1 w-[80%] rounded-sm bg-gray-400/40" />
            <div class="h-1 w-[90%] rounded-sm bg-gray-400/40" />
            <div class="mt-2 h-1 w-full rounded-sm bg-gray-400/50" />
            <div class="h-1 w-[70%] rounded-sm bg-gray-400/40" />
          </div>
          <!-- Main col -->
          <div class="flex-1 flex flex-col gap-1.5 py-1">
            <div class="h-1 w-[60%] rounded-sm bg-[#F26438]/60" />
            <div class="h-1 w-full rounded-sm bg-gray-400/40" />
            <div class="h-1 w-[90%] rounded-sm bg-gray-400/40" />
            <div class="h-1 w-full rounded-sm bg-gray-400/40" />
            <div class="mt-2 h-1 w-[60%] rounded-sm bg-[#F26438]/60" />
            <div class="h-1 w-full rounded-sm bg-gray-400/40" />
            <div class="h-1 w-[80%] rounded-sm bg-gray-400/40" />
          </div>
        </div>
      </template>

      <!-- Single-Column (Meridian) placeholder -->
      <template v-else>
        <!-- Name block centered -->
        <div class="w-full flex flex-col items-center gap-1 mb-3 pt-2">
          <div class="h-2 w-32 rounded-sm bg-gray-700/60" />
          <div class="h-1.5 w-20 rounded-sm bg-gray-500/40" />
          <div class="h-px w-full bg-gray-300 mt-1" />
        </div>
        <!-- Body lines -->
        <div class="flex flex-col gap-1.5 px-1">
          <div class="h-1 w-[40%] rounded-sm bg-gray-700/50" />
          <div class="h-1 w-full rounded-sm bg-gray-400/40" />
          <div class="h-1 w-[90%] rounded-sm bg-gray-400/40" />
          <div class="h-1 w-full rounded-sm bg-gray-400/40" />
          <div class="mt-2 h-1 w-[40%] rounded-sm bg-gray-700/50" />
          <div class="h-1 w-full rounded-sm bg-gray-400/40" />
          <div class="h-1 w-[85%] rounded-sm bg-gray-400/40" />
          <div class="h-1 w-full rounded-sm bg-gray-400/40" />
          <div class="mt-2 h-1 w-[40%] rounded-sm bg-gray-700/50" />
          <div class="h-1 w-full rounded-sm bg-gray-400/40" />
          <div class="h-1 w-[75%] rounded-sm bg-gray-400/40" />
        </div>
      </template>

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
