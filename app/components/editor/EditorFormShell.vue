<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from 'reka-ui'

defineProps<{
  id: string
  title: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close' | 'done'): void
}>()

const isMobile = useMediaQuery('(max-width: 640px)')

// On mobile, the sheet uses Dialog. Close event should trigger our close logic
const handleUpdateOpen = (val: boolean) => {
  if (!val) {
    emit('close')
  }
}

const handleCancel = () => {
  emit('close')
}

const handleDone = () => {
  emit('done')
}
</script>

<template>
  <ClientOnly>
    <!-- DESKTOP: Render Inline -->
    <div
      v-if="!isMobile"
      v-show="isOpen"
      class="p-6 border border-gray-200 rounded-xl bg-white shadow-sm mb-4"
    >
      <div class="flex items-center justify-between mb-4 border-b pb-4">
        <h3 class="font-bold text-gray-900">
          {{ title }}
        </h3>
      </div>
      <slot />
      <div class="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center w-full">
        <button
          class="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          @click="handleCancel"
        >
          Cancel
        </button>
        <button
          class="px-5 py-2 text-sm font-bold text-white bg-[#C54A22] hover:bg-[#A83D1B] rounded-lg transition-colors shadow-sm"
          @click="handleDone"
        >
          Done
        </button>
      </div>
    </div>

    <!-- MOBILE: Render in Full-Screen Dialog -->
    <DialogRoot
      v-else
      :open="isOpen"
      @update:open="handleUpdateOpen"
    >
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" />
        <DialogContent class="fixed inset-0 z-40 bg-[#F9F6F0] flex flex-col overflow-hidden outline-none duration-300 animate-in slide-in-from-bottom-full sm:max-w-none">
          <!-- Sticky Header -->
          <div class="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
            <button
              class="text-sm font-semibold text-gray-600 p-2 -ml-2"
              aria-label="Cancel"
              @click="handleCancel"
            >
              Cancel
            </button>
            <DialogTitle class="text-[15px] font-bold text-gray-900 tracking-tight">
              {{ title }}
            </DialogTitle>
            <button
              class="text-sm font-bold text-[#B64A22] p-2 -mr-2"
              aria-label="Done"
              @click="handleDone"
            >
              Done
            </button>
          </div>

          <!-- Scrollable Body with overscroll containment -->
          <div class="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 bg-[#F9F6F0]">
            <slot />
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </ClientOnly>
</template>
