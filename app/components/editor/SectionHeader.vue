<script setup lang="ts">
import { ArrowLeft, Eye, ListFilter } from '@lucide/vue'

const mobileView = useState<'edit' | 'preview'>('editorMobileView')
const isMobileSectionsOpen = useState('editorSectionsOpen', () => false)

defineProps<{
  title: string
  description: string
  backLink?: string
  backText?: string
}>()
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center justify-between mb-6">
      <NuxtLink
        v-if="backLink"
        :to="backLink"
        class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#B64A22] hover:text-[#A83D1B] transition-colors"
      >
        <ArrowLeft class="w-3.5 h-3.5 shrink-0" />
        <span class="sm:hidden">Back</span>
        <span class="hidden sm:inline">{{ backText || 'Back' }}</span>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <button
          class="lg:hidden flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors border border-gray-200 shadow-sm"
          @click="isMobileSectionsOpen = true"
        >
          <ListFilter class="w-3.5 h-3.5" />
          Sections
        </button>

        <button
          class="lg:hidden flex items-center gap-1.5 text-[13px] font-semibold text-[#B64A22] hover:bg-[#B64A22]/5 px-3 py-1.5 rounded-full transition-colors border border-[#B64A22]/20 shadow-sm"
          @click="mobileView = 'preview'"
        >
          <Eye class="w-3.5 h-3.5" />
          Preview
        </button>
      </div>
    </div>

    <h1 class="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
      {{ title }}
    </h1>
    <p class="text-gray-500 text-[15px]">
      {{ description }}
    </p>
  </div>
</template>
