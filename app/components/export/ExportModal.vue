<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  FileText,
  Link,
  Loader2,
  LockKeyhole,
  Maximize2,
  Pencil,
  Printer,
  ShieldCheck,
  X,
  ZoomIn,
  ZoomOut,
} from '@lucide/vue'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import type { Education, Experience, ResolvedCvData } from '~/types/cv'
import { decodeHtmlEntities, formatSingleDate } from '~/utils/pdf/formatters'
import { sanitizeExportData } from '~/utils/pdf/sanitizeExportData'
import { preloadPdfMake } from '~/utils/pdfExport'

import type { ExportPayload } from '~/types/export'

export type { ExportPayload }

function normalizeDescriptionForPreview(desc?: string | null): string {
  if (!desc) return ''
  return decodeHtmlEntities(
    desc
      .replace(/<li[^>]*>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (/^[•*]\s*/.test(trimmed)) {
        return `- ${trimmed.replace(/^[•*]\s*/, '')}`
      }
      return trimmed
    })
    .filter(Boolean)
    .join('\n')
}

interface Props {
  modelValue: boolean
  activeTemplateComponent?: Component | null
  data?: ResolvedCvData | Record<string, unknown>
  cvData?: ResolvedCvData | Record<string, unknown>
  isExporting?: boolean
  errorMessage?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  activeTemplateComponent: null,
  data: undefined,
  cvData: undefined,
  isExporting: false,
  errorMessage: null,
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'export', payload: ExportPayload): void
  (event: 'print' | 'clear-error'): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const format = ref<'pdf' | 'txt'>('pdf')
const paperSize = 'a4' as const
const zoom = ref(35)
const includeLinks = ref(true)
const isCustomFilename = ref(false)
const filenameInput = ref('')
const mobileTab = ref<'options' | 'preview'>('options')
const previewContainer = ref<HTMLElement | null>(null)
const exportTargetRef = ref<HTMLElement | null>(null)

const totalPages = ref(1)
const currentPage = ref(1)
const isProgrammaticScroll = ref(false)
let scrollTimeout: ReturnType<typeof setTimeout> | null = null

const canGoPrev = computed(() => totalPages.value > 1 && currentPage.value > 1)
const canGoNext = computed(() => totalPages.value > 1 && currentPage.value < totalPages.value)

const exportCleanData = computed<ResolvedCvData>(() => {
  const source = props.data || props.cvData
  return sanitizeExportData((source || {}) as ResolvedCvData)
})

const displayData = computed<ResolvedCvData>(() => {
  const base = exportCleanData.value

  const rawExperiences = base.experiences || []
  const experiences = rawExperiences.map((exp: Experience) => ({
    ...exp,
    start_date: formatSingleDate(exp.start_date),
    end_date: !exp.end_date || exp.end_date === 'Present'
      ? null
      : formatSingleDate(exp.end_date),
    description: normalizeDescriptionForPreview(exp.description),
  }))

  const rawEducations = base.educations || []
  const educations = rawEducations.map((edu: Education) => ({
    ...edu,
    start_date: formatSingleDate(edu.start_date),
    end_date: !edu.end_date || edu.end_date === 'Present'
      ? null
      : formatSingleDate(edu.end_date),
    description: normalizeDescriptionForPreview(edu.description),
  }))

  return {
    ...base,
    experiences,
    experience: experiences,
    educations,
    education: educations,
  } as unknown as ResolvedCvData
})

const defaultFilename = computed(() => {
  const d = displayData.value
  const firstName = d.personal_details?.first_name || ''
  const lastName = d.personal_details?.last_name || ''
  const name = [firstName, lastName]
    .filter(Boolean)
    .join('_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
  const baseName = name || 'CraftCV'
  return `${baseName}_Resume_${new Date().getFullYear()}.${format.value}`
})

const filename = computed({
  get: () => isCustomFilename.value ? filenameInput.value : defaultFilename.value,
  set: (value) => {
    isCustomFilename.value = true
    filenameInput.value = value
  },
})

const formatLabel = computed(() => format.value === 'pdf' ? 'Export as PDF' : 'Export as Plain Text')

const calculateFitZoom = (mode: 'width' | 'page' = 'width') => {
  if (!previewContainer.value) {
    zoom.value = 35
    return
  }

  const containerHeight = previewContainer.value.clientHeight
  const containerWidth = previewContainer.value.clientWidth

  if (!containerHeight || !containerWidth) {
    zoom.value = 35
    return
  }

  // Padding inside previewContainer is p-4 (32px horizontal) plus reserve for scrollbar (16-24px)
  // Deduct at least 64px from clientWidth and 64px from clientHeight to guarantee no scrollbar oscillation
  const availableWidth = Math.max(100, containerWidth - 64)
  const availableHeight = Math.max(100, containerHeight - 64)

  const paperWidthPx = 210 * 3.7795
  const paperHeightPx = 297 * 3.7795

  const scaleX = (availableWidth / paperWidthPx) * 100
  const scaleY = (availableHeight / paperHeightPx) * 100

  // In 'width' mode, scale to fill width comfortably; clamp between 30% and 100%
  const fitScale = mode === 'width' ? scaleX : Math.min(scaleX, scaleY)

  const targetZoom = Math.max(30, Math.min(100, Math.floor(fitScale)))
  zoom.value = targetZoom
}

const isManualZoom = ref(false)

const decreaseZoom = () => {
  isManualZoom.value = true
  zoom.value = Math.max(30, zoom.value - 10)
}

const increaseZoom = () => {
  isManualZoom.value = true
  zoom.value = Math.min(150, zoom.value + 10)
}

const fitPreview = () => {
  isManualZoom.value = false
  calculateFitZoom('width')
}

const calculateTotalPages = () => {
  if (!exportTargetRef.value) {
    totalPages.value = 1
    return
  }

  const a4HeightPx = 297 * 3.7795
  const contentEl = exportTargetRef.value.firstElementChild as HTMLElement | null
  const scrollHeight = contentEl
    ? Math.max(contentEl.offsetHeight, contentEl.scrollHeight)
    : (exportTargetRef.value.scrollHeight || 0)

  if (scrollHeight <= a4HeightPx + 16) {
    totalPages.value = 1
  }
  else {
    totalPages.value = Math.max(1, Math.ceil((scrollHeight - 16) / a4HeightPx))
  }

  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value
  }
}

const scrollToPage = (page: number) => {
  const targetPage = Math.max(1, Math.min(page, totalPages.value))
  currentPage.value = targetPage
  if (!previewContainer.value) return

  isProgrammaticScroll.value = true
  if (scrollTimeout) clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(() => {
    isProgrammaticScroll.value = false
  }, 650)

  const a4HeightPx = 297 * 3.7795
  const scaledPageHeight = a4HeightPx * (zoom.value / 100)
  const targetTop = (targetPage - 1) * scaledPageHeight

  previewContainer.value.scrollTo({
    top: targetTop,
    behavior: 'smooth',
  })
}

const prevPage = () => {
  if (canGoPrev.value) {
    scrollToPage(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (canGoNext.value) {
    scrollToPage(currentPage.value + 1)
  }
}

const handlePreviewScroll = () => {
  if (isProgrammaticScroll.value) return
  if (!previewContainer.value || totalPages.value <= 1) return

  const a4HeightPx = 297 * 3.7795
  const scaledPageHeight = a4HeightPx * (zoom.value / 100)
  if (scaledPageHeight <= 0) return

  const scrollTop = previewContainer.value.scrollTop
  const computedPage = Math.min(
    totalPages.value,
    Math.max(1, Math.floor((scrollTop + scaledPageHeight * 0.35) / scaledPageHeight) + 1),
  )
  if (computedPage !== currentPage.value) {
    currentPage.value = computedPage
  }
}

let lastContainerWidth = 0
let resizeTimeout: ReturnType<typeof setTimeout> | null = null

useResizeObserver(previewContainer, (entries) => {
  if (!isOpen.value) return
  const entry = entries[0]
  if (!entry) return

  const currentWidth = Math.round(entry.contentRect.width)
  // If width hasn't changed (e.g. only height changed from scrollbar), do nothing
  if (currentWidth === lastContainerWidth || currentWidth <= 0) return
  lastContainerWidth = currentWidth

  // If user explicitly chose a zoom level, preserve it
  if (isManualZoom.value) return

  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    calculateFitZoom()
  }, 100)
})

useResizeObserver(exportTargetRef, () => {
  if (isOpen.value) {
    calculateTotalPages()
  }
})

const resetPreviewScroll = () => {
  if (previewContainer.value) {
    previewContainer.value.scrollLeft = 0
    previewContainer.value.scrollTop = 0
  }
}

watch(mobileTab, (tab) => {
  if (tab === 'preview') {
    isManualZoom.value = false
    nextTick(() => {
      resetPreviewScroll()
      calculateFitZoom()
      calculateTotalPages()
    })
  }
})

watch(isOpen, async (val) => {
  emit('clear-error')
  if (val) {
    preloadPdfMake()
    isCustomFilename.value = false
    filenameInput.value = ''
    mobileTab.value = 'options'
    currentPage.value = 1
    isManualZoom.value = false
    await nextTick()
    resetPreviewScroll()
    setTimeout(() => {
      calculateFitZoom()
      calculateTotalPages()
      resetPreviewScroll()
    }, 60)
  }
})

watch(format, (value) => {
  if (isCustomFilename.value && filenameInput.value) {
    filenameInput.value = filenameInput.value.replace(/\.(pdf|txt)$/i, `.${value}`)
  }
})

watch([displayData, () => props.activeTemplateComponent], () => {
  nextTick(() => {
    calculateTotalPages()
  })
})

onMounted(() => {
  if (isOpen.value) {
    preloadPdfMake()
    nextTick(() => {
      calculateFitZoom()
      calculateTotalPages()
    })
  }
})

onBeforeUnmount(() => {
  if (scrollTimeout) clearTimeout(scrollTimeout)
  if (resizeTimeout) clearTimeout(resizeTimeout)
})

const submitExport = () => {
  const finalFilename = filename.value.trim() || defaultFilename.value
  emit('export', {
    format: format.value,
    paperSize,
    filename: finalFilename,
    includeLinks: includeLinks.value,
  })
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent
      :show-close-button="false"
      class="!w-[760px] !max-w-[92vw] !h-[540px] !max-h-[85vh] gap-0 overflow-hidden rounded-2xl bg-stone-50 p-0 text-stone-900 shadow-2xl z-[70]"
    >
      <DialogHeader class="flex h-11 shrink-0 flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-0 text-left">
        <div class="flex items-center gap-3">
          <div class="flex size-7 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <FileDown class="size-4" />
          </div>
          <DialogTitle class="text-sm font-semibold text-stone-900">
            Export Document
          </DialogTitle>
        </div>

        <DialogClose as-child>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Close export dialog"
            class="text-stone-500 hover:bg-stone-100 hover:text-stone-900"
          >
            <X class="size-4" />
          </Button>
        </DialogClose>
      </DialogHeader>

      <div class="flex border-b border-stone-200 bg-stone-100 p-1.5 md:hidden">
        <button
          type="button"
          class="flex-1 rounded-md py-1.5 text-xs font-medium transition-colors"
          :class="mobileTab === 'options' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'"
          @click="mobileTab = 'options'"
        >
          Export Options
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-1.5 text-xs font-medium transition-colors"
          :class="mobileTab === 'preview' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'"
          @click="mobileTab = 'preview'"
        >
          Preview Document
        </button>
      </div>

      <div class="grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[1fr_320px]">
        <section
          class="relative flex min-h-0 min-w-0 flex-col overflow-hidden border-b border-stone-200 md:border-b-0 md:border-r"
          :class="mobileTab === 'preview' ? 'flex flex-1' : 'hidden md:flex'"
        >
          <div class="flex h-9 shrink-0 items-center justify-between border-b border-stone-200 bg-stone-50 px-4">
            <span class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-success-tint px-2.5 py-0.5 text-[10px] font-semibold text-success">
              <span class="size-1.5 shrink-0 rounded-full bg-success" />
              Selectable text • ATS-ready
            </span>

            <div class="flex items-center gap-1 text-[11px] font-medium text-stone-600">
              <button
                type="button"
                :disabled="!canGoPrev"
                aria-label="Previous page"
                class="flex size-5 items-center justify-center rounded text-stone-500 hover:bg-stone-200 hover:text-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                @click="prevPage"
              >
                <ChevronLeft class="size-3.5" />
              </button>
              <span class="whitespace-nowrap text-[10px] text-stone-500 font-medium">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <button
                type="button"
                :disabled="!canGoNext"
                aria-label="Next page"
                class="flex size-5 items-center justify-center rounded text-stone-500 hover:bg-stone-200 hover:text-stone-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                @click="nextPage"
              >
                <ChevronRight class="size-3.5" />
              </button>
            </div>
          </div>

          <div
            ref="previewContainer"
            tabindex="0"
            role="region"
            aria-label="Export document preview"
            class="relative min-h-0 min-w-0 flex-1 overflow-auto [scrollbar-gutter:stable] bg-stone-200/60 p-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-stone-400"
            @scroll="handlePreviewScroll"
          >
            <div
              class="relative mx-auto transition-all duration-200 shrink-0"
              :style="{
                width: `${(210 * zoom) / 100}mm`,
                height: `calc(${(297 * zoom) / 100}mm * ${totalPages})`,
                minHeight: `calc(${(297 * zoom) / 100}mm * ${totalPages})`,
              }"
            >
              <div
                ref="exportTargetRef"
                class="export-target-container absolute top-0 left-0 bg-white border border-stone-200/80 shadow-[0_8px_24px_rgba(75,61,46,0.14)] origin-top-left transition-transform duration-200"
                :style="{
                  width: '210mm',
                  minHeight: `calc(297mm * ${totalPages})`,
                  transform: `scale(${zoom / 100})`,
                }"
              >
                <component
                  :is="activeTemplateComponent"
                  v-if="activeTemplateComponent"
                  :data="displayData"
                />
                <div
                  v-else
                  class="flex h-full min-h-[297mm] flex-col items-center justify-center gap-3 bg-white p-8 text-center"
                >
                  <div class="flex size-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                    <FileText class="size-6" />
                  </div>
                  <p class="text-xs font-medium text-stone-600">
                    No template preview available
                  </p>
                  <p class="max-w-[220px] text-[11px] text-stone-400">
                    Select or load a template to preview your document prior to export.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Floating zoom controls pinned to the preview area -->
          <div
            class="pointer-events-none absolute bottom-3 left-0 right-0 z-20 flex justify-center px-4"
          >
            <div
              class="pointer-events-auto flex items-center gap-1 rounded-full border border-stone-200/90 bg-white/95 px-2 py-1 shadow-md backdrop-blur-xs text-stone-700"
            >
              <button
                type="button"
                aria-label="Zoom out"
                :disabled="zoom <= 30"
                class="flex size-6 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                @click="decreaseZoom"
              >
                <ZoomOut class="size-3.5" />
              </button>

              <span class="w-10 text-center text-[10px] font-semibold text-stone-700 select-none">
                {{ zoom }}%
              </span>

              <button
                type="button"
                aria-label="Zoom in"
                :disabled="zoom >= 150"
                class="flex size-6 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                @click="increaseZoom"
              >
                <ZoomIn class="size-3.5" />
              </button>

              <span class="mx-0.5 h-3.5 w-px bg-stone-200" />

              <button
                type="button"
                aria-label="Fit to view"
                title="Fit to view"
                class="flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                @click="fitPreview"
              >
                <Maximize2 class="size-3" />
                <span>Fit</span>
              </button>
            </div>
          </div>
        </section>

        <section
          class="min-h-0 overflow-y-auto bg-white px-5 py-4"
          :class="mobileTab === 'options' ? 'block' : 'hidden md:block'"
        >
          <div class="w-full max-w-xl mx-auto py-1 flex flex-col justify-center space-y-4">
            <div
              v-if="errorMessage"
              class="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
              role="alert"
            >
              <div class="flex items-center gap-2">
                <AlertCircle class="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span>{{ errorMessage }}</span>
              </div>
              <button
                type="button"
                class="text-xs font-semibold underline hover:no-underline"
                @click="emit('clear-error')"
              >
                Dismiss
              </button>
            </div>

            <div>
              <h2 class="font-display text-lg font-semibold tracking-tight text-stone-900">
                Ready to export
              </h2>
              <DialogDescription class="mt-0.5 text-[11px] leading-relaxed text-stone-500">
                Generate a selectable, print-ready document for job applications.
              </DialogDescription>
            </div>

            <fieldset class="w-full">
              <legend class="mb-1.5 text-xs font-semibold text-stone-800">
                File Format
              </legend>
              <div class="grid grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  class="relative flex flex-col rounded-xl border-2 p-2.5 text-left transition-colors"
                  :class="format === 'pdf' ? 'border-brand-600 bg-brand-50/40' : 'border-stone-200 hover:border-stone-300'"
                  @click="format = 'pdf'"
                >
                  <span
                    v-if="format === 'pdf'"
                    class="absolute right-2 top-2 flex size-3.5 items-center justify-center rounded-full bg-brand-600 text-white"
                  >
                    <Check class="size-2.5" />
                  </span>
                  <FileText class="size-4 text-brand-700" />
                  <span class="mt-1.5 block text-xs font-semibold text-stone-900">PDF Document</span>
                  <span class="mt-0.5 block text-[10px] leading-tight text-stone-500">Vector fonts & universal styling</span>
                  <span class="mt-2 inline-self-start rounded-full bg-brand-100 px-1.5 py-0.5 text-[9px] font-semibold text-brand-700">Recommended</span>
                </button>

                <button
                  type="button"
                  class="relative flex flex-col rounded-xl border-2 p-2.5 text-left transition-colors"
                  :class="format === 'txt' ? 'border-brand-600 bg-brand-50/40' : 'border-stone-200 hover:border-stone-300'"
                  @click="format = 'txt'"
                >
                  <span
                    v-if="format === 'txt'"
                    class="absolute right-2 top-2 flex size-3.5 items-center justify-center rounded-full bg-brand-600 text-white"
                  >
                    <Check class="size-2.5" />
                  </span>
                  <FileText class="size-4 text-stone-500" />
                  <span class="mt-1.5 block text-xs font-semibold text-stone-900">Plain Text</span>
                  <span class="mt-0.5 block text-[10px] leading-tight text-stone-500">Raw unformatted ATS text</span>
                  <span class="mt-2 inline-self-start rounded-full bg-stone-100 px-1.5 py-0.5 text-[9px] font-medium text-stone-500">.txt</span>
                </button>
              </div>
            </fieldset>

            <fieldset class="w-full space-y-2">
              <legend class="text-xs font-semibold text-stone-800">
                Document Options
              </legend>
              <label
                for="include-links"
                class="flex cursor-pointer items-start gap-2.5"
              >
                <Checkbox
                  id="include-links"
                  v-model="includeLinks"
                  aria-label="Include clickable hyperlinks"
                  class="mt-0.5"
                />
                <span>
                  <span class="flex items-center gap-1.5 text-xs font-medium text-stone-800">
                    <Link class="size-3.5 text-stone-500" />
                    Include clickable hyperlinks
                  </span>
                  <span class="mt-0.5 block text-[10px] leading-relaxed text-stone-500">Preserves portfolio URLs, email links, and LinkedIn profiles.</span>
                </span>
              </label>
            </fieldset>

            <div class="w-full">
              <div class="mb-1.5">
                <label
                  for="export-filename"
                  class="text-xs font-semibold text-stone-800"
                >
                  File name
                </label>
              </div>
              <div class="relative w-full">
                <Input
                  id="export-filename"
                  v-model="filename"
                  type="text"
                  aria-label="File name"
                  placeholder="Enter file name..."
                  class="h-10 w-full rounded-lg border-stone-300 bg-white pr-9 text-xs text-stone-900 shadow-xs cursor-text hover:border-stone-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
                />
                <Pencil
                  class="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-400"
                />
              </div>
            </div>

            <div class="w-full space-y-1.5 pt-0.5">
              <Button
                class="h-9.5 w-full gap-2 rounded-lg bg-brand-700 text-xs font-semibold text-white shadow-xs hover:bg-brand-800 disabled:opacity-60"
                :disabled="isExporting"
                @click="submitExport"
              >
                <Loader2
                  v-if="isExporting"
                  class="size-4 animate-spin"
                />
                <Download
                  v-else
                  class="size-4"
                />
                {{ formatLabel }}
              </Button>
              <Button
                variant="outline"
                class="h-8.5 w-full gap-2 rounded-lg border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50"
                @click="emit('print')"
              >
                <Printer class="size-3.5" />
                Print directly
              </Button>
            </div>

            <div class="flex items-center justify-center gap-2 text-xs text-stone-500 pt-2">
              <LockKeyhole class="size-3" />
              <span>100% Private & Secure <span class="px-1">•</span> Unlimited free exports</span>
              <ShieldCheck class="size-3 text-success" />
            </div>
          </div>
        </section>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
:deep(.export-target-container .flex.justify-between.items-baseline) {
  flex-wrap: nowrap !important;
  align-items: flex-start !important;
  gap: 0.75rem !important;
}

:deep(.export-target-container .flex.justify-between.items-baseline > span) {
  flex-shrink: 0 !important;
  white-space: nowrap !important;
  margin-left: auto !important;
  text-align: right !important;
}

:deep(.export-target-container .flex.justify-between.items-baseline > h3),
:deep(.export-target-container .flex.justify-between.items-baseline > h4) {
  flex: 1 1 auto !important;
  min-width: 0 !important;
}

:deep(.export-target-container ul:not(.list-disc) li) {
  display: flex !important;
  align-items: flex-start !important;
  gap: 0.5rem !important;
}

:deep(.export-target-container ul:not(.list-disc) li span.rounded-full) {
  margin-top: 0.35rem !important;
  flex-shrink: 0 !important;
}

:deep(.export-target-container ul.list-disc) {
  padding-left: 1rem !important;
  list-style-position: outside !important;
}

:deep(.export-target-container ul.list-disc li) {
  padding-left: 0.25rem !important;
}

:deep(.export-target-container header .flex.flex-wrap) {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: wrap !important;
  row-gap: 0.35rem !important;
  column-gap: 1.25rem !important;
  align-items: center !important;
}

:deep(.export-target-container header .flex.flex-wrap > span) {
  display: inline-flex !important;
  align-items: center !important;
  white-space: nowrap !important;
}

:deep(.export-target-container .flex.flex-wrap.gap-1\.5) {
  gap: 0.375rem !important;
  margin-top: 0.25rem !important;
  margin-bottom: 0.5rem !important;
}
</style>
