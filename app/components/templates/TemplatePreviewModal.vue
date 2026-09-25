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
  templates.value.findIndex(t => t.id === props.template.id),
)

const hasPrev = computed(() => currentIndex.value > 0)
const hasNext = computed(() => currentIndex.value < templates.value.length - 1)

const navigatePrev = () => {
  // hasPrev guard ensures index is in bounds; ! asserts non-undefined for TS
  if (hasPrev.value) emit('navigate', templates.value[currentIndex.value - 1]!)
}
const navigateNext = () => {
  // hasNext guard ensures index is in bounds; ! asserts non-undefined for TS
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

      <DialogContent class="craftcv-content fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-5xl h-[80vh] max-h-[680px] rounded-2xl overflow-hidden shadow-2xl flex outline-none">
        <DialogTitle class="sr-only">
          {{ template.name }} Template Preview
        </DialogTitle>

        <!-- ═══════════ LEFT PANE (58%) ═══════════ -->
        <div class="relative flex-[58] bg-[#F0EDE8] flex items-center justify-center">
          <!-- Template Preview -->
          <div class="w-[78%] aspect-[3/4] bg-white rounded-xl shadow-md overflow-hidden relative group">
            <!-- Enlarge Icon (Floating, appears on hover) -->
            <button
              class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200
                     flex items-center justify-center text-gray-500 shadow-sm opacity-0 group-hover:opacity-100
                     hover:bg-white hover:text-gray-900 hover:scale-105 transition-all duration-200 cursor-pointer z-10"
              title="Enlarge preview"
              aria-label="Enlarge preview"
            >
              <Maximize2 class="w-4 h-4" />
            </button>
            <!-- Template Image -->
            <img
              v-if="template.image"
              :src="template.image"
              :alt="`${template.name} preview`"
              class="w-full h-full object-contain"
            >
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-400"
            >
              No preview available
            </div>
          </div>

          <!-- Previous -->
          <button
            v-if="hasPrev"
            class="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200
                   flex items-center justify-center text-gray-500 shadow-sm
                   hover:bg-[#F26438] hover:border-[#F26438] hover:text-white
                   transition-colors duration-150 motion-reduce:transition-none"
            :aria-label="`Previous: ${templates[currentIndex - 1]?.name}`"
            @click="navigatePrev"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>

          <!-- Next -->
          <button
            v-if="hasNext"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200
                   flex items-center justify-center text-gray-500 shadow-sm
                   hover:bg-[#F26438] hover:border-[#F26438] hover:text-white
                   transition-colors duration-150 motion-reduce:transition-none"
            :aria-label="`Next: ${templates[currentIndex + 1]?.name}`"
            @click="navigateNext"
          >
            <ChevronRight class="w-4 h-4" />
          </button>

          <!-- Position counter + keyboard hint -->
          <div class="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1.5">
            <!-- Dot indicators -->
            <div class="flex items-center gap-1.5">
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
        </div>

        <!-- ═══════════ RIGHT PANE (42%) ═══════════ -->
        <div class="relative flex-[42] bg-white flex flex-col px-8 py-8 overflow-y-auto">
          <!-- Close -->
          <DialogClose
            class="absolute top-5 right-5 w-8 h-8 rounded-full border border-gray-200
                   flex items-center justify-center text-gray-400
                   hover:text-gray-900 hover:border-gray-400
                   transition-colors duration-150 cursor-pointer"
            aria-label="Close"
          >
            <X class="w-4 h-4" />
          </DialogClose>

          <!-- Vibe tag: darkened to #c04a1a for 4.65:1 contrast on white (WCAG AA) -->
          <span class="text-[11px] font-bold tracking-[0.16em] text-[#c04a1a] mb-2">
            {{ template.vibe }}
          </span>

          <!-- Name -->
          <h2 class="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {{ template.name }}
          </h2>

          <!-- Description -->
          <p class="text-sm text-gray-500 leading-relaxed mb-7">
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
            class="group mt-8 w-full flex items-center justify-center gap-2
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
/* Pure fade — no transform conflict with Tailwind v4's translate property */
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
