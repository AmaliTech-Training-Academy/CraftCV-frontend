<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Component } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import {
  AlertCircle,
  Check,
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
const zoom = ref(50)
const includeLinks = ref(true)
const isCustomFilename = ref(false)
const filenameInput = ref('')
const mobileTab = ref<'options' | 'preview'>('options')
const previewContainer = ref<HTMLElement | null>(null)

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

const paperClass = computed(() => 'w-[210mm] min-h-[297mm]')

const zoomLabel = computed(() => `${zoom.value}%`)
const formatLabel = computed(() => format.value === 'pdf' ? 'Export as PDF' : 'Export as Plain Text')

const calculateFitZoom = () => {
  if (!previewContainer.value) {
    zoom.value = 50
    return
  }

  const containerHeight = previewContainer.value.clientHeight
  const containerWidth = previewContainer.value.clientWidth

  if (!containerHeight || !containerWidth) return

  const availableHeight = Math.max(100, containerHeight - 48)
  const availableWidth = Math.max(100, containerWidth - 32)

  const paperWidthPx = 210 * 3.7795
  const paperHeightPx = 297 * 3.7795

  const scaleY = availableHeight / paperHeightPx
  const scaleX = availableWidth / paperWidthPx

  const fitScale = Math.min(scaleX, scaleY) * 100

  const targetZoom = Math.max(20, Math.min(140, Math.floor(fitScale / 5) * 5))
  zoom.value = targetZoom
}

const fitPreview = () => {
  calculateFitZoom()
}

const decreaseZoom = () => {
  zoom.value = Math.max(20, zoom.value - 10)
}

const increaseZoom = () => {
  zoom.value = Math.min(140, zoom.value + 10)
}

useResizeObserver(previewContainer, () => {
  if (isOpen.value) {
    calculateFitZoom()
  }
})

watch(mobileTab, (tab) => {
  if (tab === 'preview') {
    nextTick(() => {
      calculateFitZoom()
    })
  }
})

const handleResize = () => {
  if (isOpen.value) {
    calculateFitZoom()
  }
}

watch(isOpen, async (val) => {
  emit('clear-error')
  if (val) {
    preloadPdfMake()
    isCustomFilename.value = false
    filenameInput.value = ''
    await nextTick()
    setTimeout(() => {
      calculateFitZoom()
    }, 60)
  }
})

watch(format, (value) => {
  if (isCustomFilename.value && filenameInput.value) {
    filenameInput.value = filenameInput.value.replace(/\.(pdf|txt)$/i, `.${value}`)
  }
})

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
  if (isOpen.value) {
    preloadPdfMake()
    nextTick(() => {
      calculateFitZoom()
    })
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
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
      class="sm:max-w-none w-[calc(100%-2rem)] max-w-[1024px] h-[min(780px,calc(100vh-2rem))] max-h-[calc(100vh-2rem)] gap-0 overflow-hidden rounded-2xl bg-stone-50 p-0 text-stone-900 shadow-2xl z-[70]"
    >
      <DialogHeader class="flex h-13 shrink-0 flex-row items-center justify-between border-b border-stone-200 bg-white px-5 py-0 text-left">
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

      <div class="flex border-b border-stone-200 bg-stone-100 p-1.5 lg:hidden">
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

      <div class="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1.15fr_0.85fr]">
        <section
          class="min-h-0 flex-col border-b border-stone-200 lg:border-b-0 lg:border-r"
          :class="mobileTab === 'preview' ? 'flex flex-1' : 'hidden lg:flex'"
        >
          <div class="flex h-11 shrink-0 items-center justify-between border-b border-stone-200 bg-stone-50 px-5">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-success-tint px-2.5 py-0.5 text-[10px] font-semibold text-success">
                <span class="size-1.5 rounded-full bg-success" />
                Selectable text <span class="opacity-60">•</span> ATS-ready
              </span>
              <span class="hidden text-[10px] text-stone-400 sm:inline">Page 1 of 1</span>
            </div>

            <div class="flex items-center gap-1 rounded-md border border-stone-200 bg-white px-1 py-0.5 shadow-xs">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Zoom out"
                :disabled="zoom <= 20"
                class="text-stone-500 hover:bg-stone-100"
                @click="decreaseZoom"
              >
                <ZoomOut class="size-3" />
              </Button>
              <span class="w-10 text-center text-[10px] font-medium text-stone-600">{{ zoomLabel }}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Zoom in"
                :disabled="zoom >= 140"
                class="text-stone-500 hover:bg-stone-100"
                @click="increaseZoom"
              >
                <ZoomIn class="size-3" />
              </Button>
              <span class="mx-1 h-4 w-px bg-stone-200" />
              <Button
                variant="ghost"
                size="xs"
                class="h-6 gap-1 px-1.5 text-[10px] text-stone-600 hover:bg-stone-100"
                title="Fit full page into view without scrolling"
                @click="fitPreview"
              >
                <Maximize2 class="size-3" />
                Fit
              </Button>
            </div>
          </div>

          <div
            ref="previewContainer"
            class="min-h-0 flex-1 overflow-auto bg-stone-200/60 px-4 py-6 sm:px-6 sm:py-6"
          >
            <div
              class="flex min-w-full justify-center transition-all duration-200"
              :style="{ minHeight: `calc(297mm * ${zoom / 100} + 1.5rem)` }"
            >
              <div
                class="export-target-container origin-top border border-stone-200/80 shadow-[0_10px_30px_rgba(75,61,46,0.14)] bg-white transition-transform duration-200"
                :class="paperClass"
                :style="{ transform: `scale(${zoom / 100})` }"
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
        </section>

        <section
          class="min-h-0 overflow-y-auto bg-white px-6 py-7 sm:px-8"
          :class="mobileTab === 'options' ? 'block' : 'hidden lg:block'"
        >
          <div class="max-w-md">
            <div
              v-if="errorMessage"
              class="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
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

            <h2 class="font-display text-2xl font-semibold tracking-tight text-stone-900">
              Ready to export
            </h2>
            <DialogDescription class="mt-1 text-xs leading-relaxed text-stone-500">
              Generate a selectable, print-ready document for job applications.
            </DialogDescription>

            <div class="mt-6 space-y-6">
              <fieldset>
                <legend class="mb-2 text-xs font-semibold text-stone-800">
                  File Format
                </legend>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    class="relative flex flex-col rounded-xl border-2 p-3.5 text-left transition-colors"
                    :class="format === 'pdf' ? 'border-brand-600 bg-brand-50/40' : 'border-stone-200 hover:border-stone-300'"
                    @click="format = 'pdf'"
                  >
                    <span
                      v-if="format === 'pdf'"
                      class="absolute right-2.5 top-2.5 flex size-4 items-center justify-center rounded-full bg-brand-600 text-white"
                    >
                      <Check class="size-3" />
                    </span>
                    <FileText class="size-5 text-brand-700" />
                    <span class="mt-2 block text-xs font-semibold text-stone-900">PDF Document</span>
                    <span class="mt-0.5 block text-[10px] leading-tight text-stone-500">Vector fonts & universal styling</span>
                    <span class="mt-2.5 inline-self-start rounded-full bg-brand-100 px-2 py-0.5 text-[9px] font-semibold text-brand-700">Recommended</span>
                  </button>

                  <button
                    type="button"
                    class="relative flex flex-col rounded-xl border-2 p-3.5 text-left transition-colors"
                    :class="format === 'txt' ? 'border-brand-600 bg-brand-50/40' : 'border-stone-200 hover:border-stone-300'"
                    @click="format = 'txt'"
                  >
                    <span
                      v-if="format === 'txt'"
                      class="absolute right-2.5 top-2.5 flex size-4 items-center justify-center rounded-full bg-brand-600 text-white"
                    >
                      <Check class="size-3" />
                    </span>
                    <FileText class="size-5 text-stone-500" />
                    <span class="mt-2 block text-xs font-semibold text-stone-900">Plain Text</span>
                    <span class="mt-0.5 block text-[10px] leading-tight text-stone-500">Raw unformatted ATS text</span>
                    <span class="mt-2.5 inline-self-start rounded-full bg-stone-100 px-2 py-0.5 text-[9px] font-medium text-stone-500">.txt</span>
                  </button>
                </div>
              </fieldset>

              <fieldset class="space-y-3.5">
                <legend class="text-xs font-semibold text-stone-800">
                  Document Options
                </legend>
                <label class="flex cursor-pointer items-start gap-2.5">
                  <Checkbox
                    v-model="includeLinks"
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

              <div>
                <div class="mb-2 flex items-center justify-between">
                  <label
                    for="export-filename"
                    class="text-xs font-semibold text-stone-800"
                  >
                    File Name
                  </label>
                  <span class="text-[10px] text-stone-400">Editable</span>
                </div>
                <div class="relative">
                  <Input
                    id="export-filename"
                    v-model="filename"
                    aria-label="File name"
                    class="h-9 rounded-lg border-stone-200 bg-stone-50 pr-9 font-mono text-xs text-stone-700 transition-colors focus:bg-white"
                  />
                  <Pencil
                    class="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-400"
                  />
                </div>
              </div>

              <div class="space-y-2 pt-1">
                <Button
                  class="h-11 w-full gap-2 rounded-lg bg-brand-700 text-xs font-semibold text-white shadow-xs hover:bg-brand-800 disabled:opacity-60"
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
                  class="h-10 w-full gap-2 rounded-lg border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50"
                  @click="emit('print')"
                >
                  <Printer class="size-3.5" />
                  Print directly
                </Button>
              </div>

              <div class="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-stone-400">
                <LockKeyhole class="size-3" />
                <span>100% Private & Secure <span class="px-1">•</span> Unlimited free exports</span>
                <ShieldCheck class="size-3 text-success" />
              </div>
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
