<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogClose,
  DialogTitle,
} from 'reka-ui'
import { ChevronLeft, ChevronRight, X, ArrowRight, Maximize2 } from '@lucide/vue'
import { useTemplates } from '~/composables/useTemplates'

type Template = ReturnType<typeof useTemplates>['templates']['value'][number]

const props = defineProps<{
  template: Template
  isOpen: boolean
}>()

const emit = defineEmits<{
  'close': []
  'use-template': [template: Template]
  'navigate': [template: Template]
}>()

const { templates } = useTemplates()

const currentIndex = computed(() =>
  templates.value.findIndex(t => t.templateId === props.template.templateId),
)

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < templates.value.length - 1)

const navigatePrev = () => {
  if (hasPrev.value) emit('navigate', templates.value[currentIndex.value - 1]!)
}
const navigateNext = () => {
  if (hasNext.value) emit('navigate', templates.value[currentIndex.value + 1]!)
}

const handleOpenChange = (open: boolean) => {
  if (!open) emit('close')
}

const useThisTemplate = () => {
  emit('use-template', props.template)
  emit('close')
}

// Keyboard navigation
const onKeydown = (e: KeyboardEvent) => {
  if (!props.isOpen) return
  if (e.key === 'ArrowLeft') navigatePrev()
  if (e.key === 'ArrowRight') navigateNext()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <DialogRoot
    :open="isOpen"
    @update:open="handleOpenChange"
  >
    <DialogPortal>
      <DialogOverlay class="craftcv-overlay fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />

      <!--
        Mobile: full-screen bottom sheet, stacked vertically
        Desktop: centered two-pane modal (left preview / right info)
      -->
      <DialogContent
        class="craftcv-content fixed z-50 outline-none
               inset-x-0 bottom-0 w-full max-h-[92dvh] rounded-t-2xl overflow-hidden shadow-2xl flex flex-col
               sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
               sm:w-[92vw] sm:max-w-5xl sm:h-[80vh] sm:max-h-[680px] sm:rounded-2xl sm:flex-row"
      >
        <DialogTitle class="sr-only">
          {{ template.name }} Template Preview
        </DialogTitle>

        <!-- ═══════════ PREVIEW PANE ═══════════ -->
        <!-- Mobile: top section, fixed height; Desktop: left pane 58% -->
        <div
          class="relative bg-[#F0EDE8] flex items-center justify-center overflow-hidden group
                    h-[45vh] shrink-0
                    sm:h-auto sm:flex-[58]"
        >
          <!-- Image container => forces a nice aspect ratio if needed, or fits to bounds -->
          <div class="relative w-full h-full flex items-center justify-center p-4 sm:p-8">
            <img
              :src="template.image"
              :alt="`Large preview of ${template.name}`"
              class="max-w-full max-h-full object-contain rounded shadow-md border border-gray-200"
              decoding="async"
            >
          </div>

          <!-- Prev / Next arrows -->
          <button
            v-if="hasPrev"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200
                   flex items-center justify-center text-gray-500 shadow-sm
                   hover:bg-[#F26438] hover:border-[#F26438] hover:text-white
                   transition-colors duration-150 motion-reduce:transition-none"
            :aria-label="`Previous: ${templates[currentIndex - 1]?.name}`"
            @click="navigatePrev"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <button
            v-if="hasNext"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200
                   flex items-center justify-center text-gray-500 shadow-sm
                   hover:bg-[#F26438] hover:border-[#F26438] hover:text-white
                   transition-colors duration-150 motion-reduce:transition-none"
            :aria-label="`Next: ${templates[currentIndex + 1]?.name}`"
            @click="navigateNext"
          >
            <ChevronRight class="w-4 h-4" />
          </button>

          <!-- Dot indicators -->
          <div class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            <span
              v-for="(_, i) in templates"
              :key="i"
              :class="[
                'block rounded-full transition-all duration-200',
                i === currentIndex ? 'w-4 h-1.5 bg-[#F26438]' : 'w-1.5 h-1.5 bg-gray-300',
              ]"
            />
          </div>
        </div>

        <!-- ═══════════ INFO PANE ═══════════ -->
        <!-- Mobile: scrollable bottom sheet; Desktop: right pane 42% -->
        <div class="relative bg-white flex flex-col px-6 py-6 sm:px-8 sm:py-8 overflow-y-auto sm:flex-[42]">
          <!-- Close -->
          <DialogClose
            class="absolute top-4 right-4 w-8 h-8 rounded-full border border-gray-200
                   flex items-center justify-center text-gray-400
                   hover:text-gray-900 hover:border-gray-400
                   transition-colors duration-150 cursor-pointer"
            aria-label="Close"
          >
            <X class="w-4 h-4" />
          </DialogClose>

          <!-- Vibe tag -->
          <span class="text-[11px] font-bold tracking-[0.16em] text-[#c04a1a] mb-2">
            {{ template.vibe }}
          </span>

          <!-- Name -->
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
            {{ template.name }}
          </h2>

          <!-- Description -->
          <p class="text-sm text-gray-500 leading-relaxed mb-5 sm:mb-7">
            {{ template.description }}
          </p>

          <!-- Best for -->
          <div class="mb-auto">
            <p class="text-[11px] font-semibold tracking-[0.12em] text-gray-600 uppercase mb-3">
              Best for
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in template.bestFor"
                :key="role"
                class="px-3 py-1 rounded-full bg-transparent border border-[#F26438] text-xs font-semibold text-[#c04a1a]"
              >
                {{ role }}
              </span>
            </div>
          </div>

          <!-- CTA -->
          <button
            class="group mt-6 sm:mt-8 w-full flex items-center justify-center gap-2
                   bg-[#F26438] hover:bg-[#d95a30] active:bg-[#c0522b]
                   text-white font-semibold py-3.5 rounded-xl
                   transition-colors duration-150 text-sm cursor-pointer
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26438] focus-visible:ring-offset-2"
            @click="useThisTemplate"
          >
            Use this template
            <ArrowRight class="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
.craftcv-overlay {
  animation: craftcv-fade-in 80ms ease;
}
.craftcv-content {
  animation: craftcv-fade-in 100ms ease-out;
}

@keyframes craftcv-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .craftcv-overlay,
  .craftcv-content { animation: none; }
}
</style>
