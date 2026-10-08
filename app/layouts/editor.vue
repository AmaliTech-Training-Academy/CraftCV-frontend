<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogClose } from 'reka-ui'
import {
  User,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Zap,
  Award,
  Check,
  CheckCircle2,
  Circle,
  Pencil,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  UserCircle,
  LogOut,
  X,
  Loader2,
  AlertCircle,
} from '@lucide/vue'

import { useCVState } from '~/composables/useCVState'
import { useAutosave } from '~/composables/useAutosave'
import { useCVs, type CVSummary } from '~/composables/useCVs'
import { useAuth } from '~/composables/useAuth'
import type { ResolvedCvData } from '~/types/cv'
import CVTemplateClassic from '~/components/templates/CVTemplateClassic.vue'
import SingleColumnTemplate from '~/components/templates/SingleColumnTemplate.vue'
import TwoColumnTemplate from '~/components/templates/TwoColumnTemplate.vue'
import ExportModal from '~/components/export/ExportModal.vue'
import type { ExportPayload } from '~/types/export'
import { generatePDF, generatePlainText, printDocument } from '~/utils/pdfExport'

const {
  cvId,
  cvTitle,
  rawCVData,
  getPersonalStatus,
  getSummaryStatus,
  getExperienceStatus,
  getEducationStatus,
  getSkillsStatus,
  getCertificationsStatus,
  selectedTemplateSlug,
  previewData,
  saveState,
  lastSavedAt,
  saveErrorMessage,
} = useCVState()

const { loadCV } = useAutosave()

// The saved-CV collection, for the resume switcher in the header. Its state is
// shared, so a list the dashboard already fetched is reused rather than
// re-requested.
const { cvs, loaded: cvsLoaded, fetchCVs } = useCVs()
const { isAuthenticated, logout } = useAuth()

onMounted(() => {
  // Reached by deep link, the editor is the first screen to need the list, so
  // it fetches its own; arrived at from My Resumes, the list is already there.
  if (!cvsLoaded.value) fetchCVs()
})

/**
 * The editor's fields read from shared state, which starts empty on a fresh
 * page load — so until the fetch lands they render blank and a CV that has
 * content looks like it lost it. Holding the workspace behind a loading state
 * until the response is in means they are never seen empty.
 *
 * The flag is read during setup rather than in `onMounted` on purpose: set any
 * later and it is false for the first paint, which is exactly the flash of
 * empty fields this is here to prevent.
 */
const isBootstrapping = ref(Boolean(cvId.value))

onMounted(async () => {
  // No id means a CV that does not exist yet: there is nothing to fetch, and
  // the flag is already false.
  if (cvId.value) {
    await loadCV(cvId.value)
    isBootstrapping.value = false
  }
})

const lastSavedLocalTime = computed(() => {
  if (!lastSavedAt.value) return ''
  const d = new Date(lastSavedAt.value)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const layoutBySlug: Record<string, unknown> = {
  classic: CVTemplateClassic,
  modern: SingleColumnTemplate,
  professional: TwoColumnTemplate,
}

const activeTemplateComponent = computed(() => {
  const slug = (selectedTemplateSlug.value || '').toLowerCase()
  return layoutBySlug[slug] || CVTemplateClassic
})

// Adapter: converts the frontend camelCase previewData to the snake_case ResolvedCvData
// that both SingleColumnTemplate and TwoColumnTemplate expect.
const resolvedPreviewData = computed<ResolvedCvData>(() => {
  const p = previewData.value.personal
  return {
    title: p.title || '',
    professional_summary: previewData.value.summary || '',
    personal_details: {
      first_name: p.firstName || '',
      last_name: p.lastName || '',
      email: p.email || '',
      phone: p.phone || '',
      location: p.location || '',
      website: p.website || '',
      nationality: p.nationality || '',
      date_of_birth: p.dateOfBirth || '',
      passport: p.passport || '',
      availability: p.availability || '',
    },
    experiences: (previewData.value.experience ?? []).map((e, i) => ({
      id: e.id,
      company: e.company || '',
      role: e.title || '',
      location: e.location,
      start_date: e.startDate || '',
      end_date: e.endDate || null,
      description: e.description,
      display_order: i,
    })),
    educations: (previewData.value.education ?? []).map((e, i) => ({
      id: e.id,
      institution: e.school || '',
      degree: e.degree || '',
      field_of_study: e.fieldOfStudy || '',
      location: e.location || '',
      start_date: e.startDate || '',
      end_date: e.endDate || null,
      description: e.description,
      display_order: i,
    })),
    skills: (previewData.value.skills ?? []).map((s, i) => ({
      id: s.id,
      name: s.name || '',
      level: s.level,
      display_order: i,
    })),
    certifications: (previewData.value.certifications ?? []).map((c, i) => ({
      id: c.id,
      name: c.name || '',
      issuer: c.issuer || '',
      issue_date: c.date || undefined,
      expiration_date: c.expirationDate || undefined,
      does_not_expire: c.doesNotExpire ?? false,
      credential_id: c.credentialId || undefined,
      credential_url: c.credentialUrl || undefined,
      description: c.description || undefined,
      display_order: i,
    })),
    languages: [],
    awards: [],
    additional_information: [],
  }
})

const isPreviewModalOpen = ref(false)
const isSidebarExpanded = ref(true)
const isExportModalOpen = ref(false)
const isExporting = ref(false)
const exportError = ref<string | null>(null)
const isResumeMenuOpen = ref(false)
const isAccountMenuOpen = ref(false)

/**
 * Opens another saved CV without leaving the editor.
 *
 * This layout stays mounted across a switch, so its `onMounted` never runs again
 * and the CV has to be fetched from here. `loadCV` replaces the editor's state
 * only once the response is in hand, so a switch that fails leaves the CV
 * already open exactly as it was rather than half-replaced — which is why
 * nothing is cleared first.
 */
const switchCV = async (cv: CVSummary) => {
  isResumeMenuOpen.value = false
  if (cv.cvId === cvId.value) return

  isBootstrapping.value = true
  await loadCV(cv.cvId)
  isBootstrapping.value = false
}

/**
 * Opening the menu re-reads the list, so the CV that was just created from the
 * template picker — this editor is often the first screen after it — is in the
 * switcher rather than only the older ones.
 */
const toggleResumeMenu = () => {
  isAccountMenuOpen.value = false
  isResumeMenuOpen.value = !isResumeMenuOpen.value
  if (isResumeMenuOpen.value) fetchCVs()
}

const toggleAccountMenu = () => {
  isResumeMenuOpen.value = false
  isAccountMenuOpen.value = !isAccountMenuOpen.value
}

const handleExport = async (payload: ExportPayload) => {
  isExporting.value = true
  exportError.value = null
  try {
    const exportSource = rawCVData.value ?? resolvedPreviewData.value

    if (payload.format === 'txt') {
      generatePlainText(exportSource, payload.filename)
    }
    else {
      await generatePDF({
        cvData: exportSource,
        filename: payload.filename,
        paperSize: payload.paperSize,
        includeLinks: payload.includeLinks,
        templateSlug: selectedTemplateSlug.value || 'classic',
      })
    }
  }
  catch (error) {
    console.error('Export failed:', error)
    exportError.value = error instanceof Error ? error.message : 'Failed to export document. Please try again.'
  }
  finally {
    isExporting.value = false
  }
}

const handlePrint = async () => {
  exportError.value = null
  try {
    const exportSource = rawCVData.value ?? resolvedPreviewData.value

    await printDocument({
      cvData: exportSource,
      filename: `${cvTitle.value || 'CraftCV_Resume'}.pdf`,
      paperSize: 'a4',
      includeLinks: true,
      templateSlug: selectedTemplateSlug.value || 'classic',
    })
  }
  catch (error) {
    console.error('Print failed:', error)
    exportError.value = error instanceof Error ? error.message : 'Failed to initialize printing. Please try again.'
  }
}

const tooltipState = ref({ visible: false, text: '', top: 0, left: 0 })

const onHover = (name: string, event: Event) => {
  if (isSidebarExpanded.value) return
  const el = event.currentTarget as HTMLElement
  if (!el) return

  const rect = el.getBoundingClientRect()
  tooltipState.value = {
    visible: true,
    text: name,
    top: rect.top + (rect.height / 2) - 14, // center vertically roughly
    left: rect.right + 12, // tether to the right of the icon button + 12px gap
  }
}

const onLeave = () => {
  tooltipState.value.visible = false
}

// Watch sidebar state to hide tooltip if expanded while hovering
watch(isSidebarExpanded, (expanded) => {
  if (expanded) tooltipState.value.visible = false
})

const steps = computed(() => [
  { id: 'personal', name: 'Personal Details', icon: User, status: getPersonalStatus(), path: '/editor/personal' },
  { id: 'summary', name: 'Summary', icon: AlignLeft, status: getSummaryStatus(), path: '/editor/summary' },
  { id: 'experience', name: 'Experience', icon: Briefcase, status: getExperienceStatus(), path: '/editor/experience' },
  { id: 'education', name: 'Education', icon: GraduationCap, status: getEducationStatus(), path: '/editor/education' },
  { id: 'skills', name: 'Skills', icon: Zap, status: getSkillsStatus(), path: '/editor/skills' },
  { id: 'certifications', name: 'Certifications', icon: Award, status: getCertificationsStatus(), path: '/editor/certifications' },
])

const mobileView = useState<'edit' | 'preview'>('editorMobileView', () => 'edit')
const isMobileSectionsOpen = useState('editorSectionsOpen', () => false)

const previewHost = ref<HTMLElement | null>(null)
const previewPage = ref<HTMLElement | null>(null)
const previewScale = ref(1)
const previewPageH = ref(1123)
const PAGE_W = 794

useResizeObserver(previewHost, (entries) => {
  const entry = entries[0]
  if (entry) {
    const hostW = entry.contentRect.width
    if (hostW > 0) {
      previewScale.value = Math.min(1, hostW / PAGE_W)
    }
  }
})

useResizeObserver(previewPage, (entries) => {
  const entry = entries[0]
  if (entry && entry.target instanceof HTMLElement) {
    const pageH = entry.target.offsetHeight
    if (pageH > 0) {
      previewPageH.value = pageH
    }
  }
})
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-[#F9F8F6] overflow-hidden font-['Inter']">
    <!-- 1. Header -->
    <header class="h-16 shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center gap-3 z-20 relative">
      <!-- Left: Logo, Title, Status (can shrink) -->
      <div class="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
        <!-- Logo -->
        <NuxtLink
          to="/dashboard"
          class="flex shrink-0 items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded-lg"
        >
          <div
            class="relative flex items-center justify-center p-1.5 rounded-xl bg-white border border-stone-200 shadow-sm group-hover:border-brand-300 transition-colors"
          >
            <img
              src="/craftcv-logo.png"
              alt="CraftCV Logo"
              class="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            >
          </div>
          <span
            class="hidden sm:inline font-display font-bold text-xl tracking-tight text-stone-900 group-hover:text-brand-700 transition-colors"
          >
            Craft<span class="text-brand-600">CV</span>
          </span>
        </NuxtLink>

        <div class="h-5 w-px bg-gray-200" />

        <!-- Editable Title -->
        <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div class="flex items-center gap-1.5 text-gray-900 group min-w-0 max-w-56 flex-1">
            <input
              v-model="cvTitle"
              class="text-[13px] font-semibold bg-gray-50 border border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-[#C54A22]/20 focus:outline-none rounded-md px-2.5 py-1 w-full min-w-0 transition-all truncate"
            >
            <Pencil class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors pointer-events-none shrink-0" />
          </div>

          <!-- Save Status -->
          <div
            v-if="saveState === 'saved' && lastSavedLocalTime"
            role="status"
            class="flex shrink-0 items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-full bg-green-50 border border-green-100/50 whitespace-nowrap transition-all"
          >
            <CheckCircle2 class="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span class="text-[11px] font-medium text-green-600">
              <span class="hidden lg:inline">Saved at {{ lastSavedLocalTime }}</span>
              <span class="sr-only lg:hidden">Saved</span>
            </span>
          </div>

          <div
            v-else-if="saveState === 'saving'"
            role="status"
            class="flex shrink-0 items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-full bg-gray-50 border border-gray-200 whitespace-nowrap transition-all"
          >
            <Loader2 class="w-3.5 h-3.5 text-gray-500 shrink-0 animate-spin" />
            <span class="text-[11px] font-medium text-gray-600">
              <span class="hidden lg:inline">Saving...</span>
              <span class="sr-only lg:hidden">Saving</span>
            </span>
          </div>

          <div
            v-else-if="saveState === 'error'"
            role="status"
            class="flex shrink-0 items-center gap-1.5 px-2 py-1 sm:px-2.5 rounded-full bg-red-50 border border-red-200 whitespace-nowrap transition-all"
          >
            <AlertCircle class="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span class="text-[11px] font-medium text-red-600">
              <span class="hidden lg:inline">{{ saveErrorMessage || 'Couldn\'t save. Retrying...' }}</span>
              <span class="sr-only lg:hidden">Error</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Center Navigation (Middle: only when there's real room).
           Pinned to the header's own centre rather than left in the flow: the
           block on the left grows to fill the row, so in flow this would end up
           flush against the right-hand buttons instead of in the middle. -->
      <nav class="hidden shrink-0 items-center gap-6 xl:flex text-[13px] font-semibold text-gray-500 absolute left-1/2 -translate-x-1/2">
        <NuxtLink
          to="/dashboard"
          class="transition-colors hover:text-gray-900"
        >My Resumes</NuxtLink>
        <NuxtLink
          to="/templates"
          class="transition-colors hover:text-gray-900"
        >Templates</NuxtLink>
      </nav>

      <!-- Right: Never shrinks -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <!-- Resume switcher: hops between saved CVs without a trip back to My
             Resumes. -->
        <div class="relative">
          <button
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isResumeMenuOpen"
            class="flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/30"
            @click="toggleResumeMenu"
          >
            <FileText class="w-4 h-4 text-gray-400 shrink-0" />
            <span class="hidden md:inline">Resumes</span>
            <ChevronDown class="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </button>

          <div
            v-if="isResumeMenuOpen"
            class="fixed inset-0 z-10 cursor-default"
            @click="isResumeMenuOpen = false"
          />

          <div
            v-if="isResumeMenuOpen"
            role="menu"
            class="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white rounded-xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-gray-100 z-20 py-1.5"
          >
            <p class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Your resumes
            </p>

            <p
              v-if="cvs.length === 0"
              class="px-3 py-2 text-[13px] text-gray-500"
            >
              No other resumes yet.
            </p>

            <button
              v-for="cv in cvs"
              :key="cv.cvId"
              type="button"
              role="menuitem"
              class="w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-[13px] font-medium transition-colors hover:bg-gray-50"
              :class="cv.cvId === cvId ? 'text-[#B64A22] font-semibold' : 'text-gray-700'"
              @click="switchCV(cv)"
            >
              <span class="truncate">{{ cv.title }}</span>
              <Check
                v-if="cv.cvId === cvId"
                class="w-4 h-4 shrink-0"
                stroke-width="3"
              />
            </button>

            <div class="h-px bg-gray-100 my-1" />

            <NuxtLink
              to="/dashboard"
              class="block px-3 py-2 text-[13px] font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              @click="isResumeMenuOpen = false"
            >
              All resumes
            </NuxtLink>
          </div>
        </div>

        <!-- Export: kept in the header rather than the preview pane so it stays
             reachable on mobile, where the preview pane is hidden while editing. -->
        <button
          type="button"
          class="hidden lg:flex items-center gap-2 h-9 px-3 sm:px-4 bg-[#C54A22] hover:bg-[#A83D1B] text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm active:scale-95 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/40"
          @click="isExportModalOpen = true"
        >
          <Download class="w-4 h-4 shrink-0" />
          <span class="hidden sm:inline">Export</span>
        </button>

        <!-- Account menu -->
        <div
          v-if="isAuthenticated"
          class="relative hidden xl:block"
        >
          <button
            type="button"
            title="Account"
            aria-haspopup="menu"
            :aria-expanded="isAccountMenuOpen"
            class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#C54A22] focus:ring-offset-2"
            @click="toggleAccountMenu"
          >
            <UserCircle class="w-5 h-5" />
          </button>

          <div
            v-if="isAccountMenuOpen"
            class="fixed inset-0 z-10 cursor-default"
            @click="isAccountMenuOpen = false"
          />

          <div
            v-if="isAccountMenuOpen"
            role="menu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-gray-100 z-20 py-1.5 overflow-hidden"
          >
            <button
              type="button"
              role="menuitem"
              class="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              @click="logout(); isAccountMenuOpen = false"
            >
              <LogOut class="w-4 h-4 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>

        <!-- The mobile nav menu acts as the menu button below xl -->
        <LayoutMobileNavMenu class="xl:hidden" />
      </div>
    </header>

    <!-- Loading state: the workspace is held back until the CV has arrived, so
         the fields are never rendered empty (see `isBootstrapping`). -->
    <div
      v-if="isBootstrapping"
      role="status"
      class="flex flex-1 min-h-0 flex-col items-center justify-center gap-3 bg-[#F9F8F6] animate-in fade-in duration-300"
    >
      <Loader2 class="w-6 h-6 text-[#C54A22] animate-spin" />
      <p class="text-[13px] font-medium text-gray-500">
        Loading your CV...
      </p>
    </div>

    <!-- Main Workspace -->
    <div
      v-else
      class="flex flex-1 min-h-0 overflow-hidden"
    >
      <!-- 2. Sidebar -->
      <div
        class="hidden lg:flex relative h-full shrink-0 transition-all duration-300 z-20"
        :class="isSidebarExpanded ? 'w-65' : 'w-20'"
      >
        <aside class="flex flex-col h-full bg-[#B64A22] text-white overflow-y-auto w-full">
          <!-- Floating Edge Button -->
          <button
            class="absolute -right-3 top-8 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:scale-110 transition-all z-30 focus:outline-none focus:ring-2 focus:ring-[#B64A22]/50"
            :title="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'"
            @click="isSidebarExpanded = !isSidebarExpanded"
          >
            <component
              :is="isSidebarExpanded ? ChevronLeft : ChevronRight"
              class="w-4 h-4"
            />
          </button>

          <nav
            class="flex-1 px-3 pt-10 pb-6 flex flex-col gap-1 relative"
            @mouseleave="onLeave"
          >
            <NuxtLink
              v-for="step in steps"
              :key="step.id"
              :to="step.path"
              class="flex items-center justify-between px-4 py-3 rounded-xl transition-colors group text-white/80 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              :class="[
                !isSidebarExpanded ? 'justify-center px-0' : '',
                $route.path === step.path ? 'bg-[#FCF1EC]! text-[#B64A22]! font-semibold shadow-sm' : 'hover:text-white hover:bg-white/10',
              ]"
              @mouseenter="onHover(step.name, $event)"
              @focus="onHover(step.name, $event)"
              @blur="onLeave"
            >
              <div class="flex items-center gap-3">
                <component
                  :is="step.icon"
                  class="w-5 h-5"
                />
                <span
                  v-if="isSidebarExpanded"
                  class="text-[13px] whitespace-nowrap"
                >{{ step.name }}</span>
              </div>

              <!-- Status Indicators -->
              <template v-if="isSidebarExpanded">
                <div
                  v-if="step.status === 'complete'"
                  class="w-4 h-4 bg-emerald-500 rounded-full flex flex-col items-center justify-center shrink-0"
                >
                  <Check
                    class="w-3 h-3 text-white"
                    stroke-width="3"
                  />
                </div>
                <Circle
                  v-else-if="step.status === 'incomplete'"
                  class="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0"
                />
                <Circle
                  v-else
                  class="w-4 h-4 text-white/40 fill-white/40 shrink-0"
                />
              </template>
            </NuxtLink>
          </nav>
        </aside>
      </div>

      <!-- Tooltip for collapsed sidebar -->
      <Teleport to="body">
        <div
          v-if="tooltipState.visible && !isSidebarExpanded"
          class="fixed z-50 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold tracking-wide rounded shadow-xl pointer-events-none transition-all duration-150 ease-out"
          :class="tooltipState.visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'"
          :style="{
            top: tooltipState.top + 'px',
            left: tooltipState.left + 'px',
          }"
        >
          {{ tooltipState.text }}
        </div>
      </Teleport>

      <!-- 3. Form Area (Middle Slot) -->
      <main
        class="flex-1 lg:flex-[1.2] min-w-0 min-h-0 overflow-y-auto relative flex flex-col bg-[#F9F8F6]"
        :class="mobileView === 'preview' ? 'hidden lg:flex' : 'flex'"
      >
        <slot />
      </main>

      <!-- 4. Live Preview Pane (Right) -->
      <aside
        class="flex-1 lg:max-w-160 border-l border-gray-200 bg-[#F9F8F6] min-w-0 min-h-0 overflow-y-auto flex-col"
        :class="mobileView === 'edit' ? 'hidden lg:flex' : 'flex'"
      >
        <!-- Preview Toolbar. Mobile only: export lives in the header now, and on
             desktop this pane needs no chrome of its own. -->
        <div class="h-16 px-4 lg:px-6 flex lg:hidden items-center justify-between shrink-0">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
            <div class="w-2 h-2 rounded-full bg-green-500" />
            <span class="text-[11px] font-bold tracking-wide text-gray-600">Preview</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-2 h-9 px-3 bg-[#C54A22] hover:bg-[#A83D1B] text-white rounded-full text-[13px] font-semibold transition-colors shadow-sm active:scale-95 focus:outline-none"
              @click="isExportModalOpen = true"
            >
              <Download class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">Export</span>
            </button>

            <button
              class="flex items-center gap-1.5 text-sm font-semibold text-[#B64A22] px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm"
              @click="mobileView = 'edit'"
            >
              <Pencil class="w-3.5 h-3.5" />
              Edit
            </button>
          </div>
        </div>

        <!-- Canvas Area with ResizeObserver -->
        <div
          ref="previewHost"
          class="flex-1 px-4 lg:px-8 pb-12 pt-4 min-w-0 w-full overflow-hidden flex flex-col items-center"
        >
          <div
            class="mx-auto"
            :style="{ width: PAGE_W * previewScale + 'px', height: previewPageH * previewScale + 'px' }"
          >
            <button
              class="w-198.5 origin-top-left bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-sm border border-gray-200 cursor-zoom-in group relative overflow-hidden focus:outline-none transition-shadow hover:ring-2 hover:ring-gray-300 block text-left"
              :style="{ transform: `scale(${previewScale})` }"
              @click="isPreviewModalOpen = true"
            >
              <div ref="previewPage">
                <component
                  :is="activeTemplateComponent"
                  :data="resolvedPreviewData"
                />
              </div>
              <div class="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span class="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-200">
                  Click to expand
                </span>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Live Preview Modal (Desktop Expansion) -->
    <DialogRoot v-model:open="isPreviewModalOpen">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-100 animate-in fade-in transition-opacity" />
        <DialogContent class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-100 w-full max-w-5xl h-[95vh] flex justify-center p-4 outline-none animate-in fade-in zoom-in-95 duration-200">
          <div class="relative h-full aspect-[1/1.414] bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col items-center justify-center border border-gray-200">
            <DialogClose class="absolute top-4 right-4 p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
              <X class="w-5 h-5 text-gray-700" />
            </DialogClose>
            <div class="w-full h-full">
              <component
                :is="activeTemplateComponent"
                :data="resolvedPreviewData"
              />
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <!-- Mobile Sections Navigation Sheet -->
    <DialogRoot v-model:open="isMobileSectionsOpen">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-60 animate-in fade-in transition-opacity" />
        <DialogContent class="fixed inset-x-0 bottom-0 z-60 bg-white rounded-t-2xl shadow-2xl outline-none animate-in slide-in-from-bottom-full duration-300 max-h-[85vh] flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-900">
              Jump to section
            </h3>
            <DialogClose class="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <X class="w-5 h-5" />
            </DialogClose>
          </div>

          <div class="p-4 overflow-y-auto overscroll-contain">
            <nav class="flex flex-col gap-1.5 pb-8">
              <NuxtLink
                v-for="step in steps"
                :key="step.id"
                :to="step.path"
                class="flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors group"
                :class="$route.path === step.path ? 'bg-[#FCF1EC] text-[#B64A22] font-semibold' : 'text-gray-700 hover:bg-gray-50'"
                @click="isMobileSectionsOpen = false; mobileView = 'edit'"
              >
                <div class="flex items-center gap-3.5">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    :class="$route.path === step.path ? 'bg-[#B64A22] text-white' : 'bg-gray-100 text-gray-500'"
                  >
                    <component
                      :is="step.icon"
                      class="w-4 h-4"
                    />
                  </div>
                  <span class="text-[15px]">{{ step.name }}</span>
                </div>

                <div
                  v-if="step.status === 'complete'"
                  class="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <Check
                    class="w-3.5 h-3.5 text-white"
                    stroke-width="3"
                  />
                </div>
                <Circle
                  v-else-if="step.status === 'incomplete'"
                  class="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
                <Circle
                  v-else
                  class="w-5 h-5 text-gray-200 fill-gray-200"
                />
              </NuxtLink>
            </nav>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <ExportModal
      v-model="isExportModalOpen"
      :active-template-component="activeTemplateComponent"
      :data="rawCVData ?? resolvedPreviewData"
      :is-exporting="isExporting"
      :error-message="exportError"
      @export="handleExport"
      @print="handlePrint"
      @clear-error="exportError = null"
    />
  </div>
</template>
