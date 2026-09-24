<script setup lang="ts">
import { ref, computed } from 'vue'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogClose } from 'reka-ui'
import {
  User,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Zap,
  Award,
  CheckCircle2,
  Circle,
  Pencil,
  Download,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from '@lucide/vue'

import { useCVState } from '~/composables/useCVState'
import CVTemplateClassic from '~/components/templates/CVTemplateClassic.vue'

const {
  cvTitle,
  getPersonalStatus,
  getSummaryStatus,
  getExperienceStatus,
  getEducationStatus,
  getSkillsStatus,
  getCertificationsStatus,
  selectedTemplateId,
  previewData,
} = useCVState()

const activeTemplateComponent = computed(() => {
  if (selectedTemplateId.value === 'classic') {
    return CVTemplateClassic
  }
  return CVTemplateClassic // fallback
})

const isPreviewModalOpen = ref(false)
const isSidebarExpanded = ref(true)
const isSaving = ref(false)

const steps = computed(() => [
  { id: 'personal', name: 'Personal Details', icon: User, status: getPersonalStatus(), path: '/editor/personal' },
  { id: 'summary', name: 'Summary', icon: AlignLeft, status: getSummaryStatus(), path: '/editor/summary' },
  { id: 'experience', name: 'Experience', icon: Briefcase, status: getExperienceStatus(), path: '/editor/experience' },
  { id: 'education', name: 'Education', icon: GraduationCap, status: getEducationStatus(), path: '/editor/education' },
  { id: 'skills', name: 'Skills', icon: Zap, status: getSkillsStatus(), path: '/editor/skills' },
  { id: 'certifications', name: 'Certifications', icon: Award, status: getCertificationsStatus(), path: '/editor/certifications' },
])
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-[#F9F8F6] overflow-hidden font-['Inter']">
    <!-- 1. Header -->
    <header class="h-16 flex-shrink-0 bg-white border-b border-gray-100 px-6 flex items-center justify-between z-20 relative">
      <div class="flex items-center gap-5">
        <!-- Logo -->
        <NuxtLink
          to="/dashboard"
          class="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
        >
          <img
            src="/logo.png"
            alt="CraftCV"
            class="w-7 h-7 object-contain"
          >
          <span class="text-xl font-extrabold text-gray-900 tracking-tight">CraftCV</span>
        </NuxtLink>

        <div class="h-5 w-[1px] bg-gray-200" />

        <!-- Editable Title -->
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5 text-gray-900 group">
            <input
              v-model="cvTitle"
              class="text-[13px] font-semibold bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-[#C54A22] focus:ring-2 focus:ring-[#C54A22]/20 focus:outline-none rounded-md px-2.5 py-1 w-24 focus:w-48 transition-all"
            >
            <Pencil class="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors pointer-events-none" />
          </div>

          <!-- Save Status -->
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100/50">
            <CheckCircle2 class="w-3.5 h-3.5 text-green-500" />
            <span class="text-[11px] font-medium text-green-600">Changes saved</span>
          </div>
        </div>
      </div>

      <!-- Center Navigation -->
      <nav class="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 text-[13px] font-semibold text-gray-500 hidden md:flex">
        <NuxtLink
          to="/dashboard"
          class="transition-colors hover:text-gray-900"
        >My Resumes</NuxtLink>
        <NuxtLink
          to="/templates"
          class="transition-colors hover:text-gray-900"
        >Templates</NuxtLink>
      </nav>

      <div class="flex items-center gap-6">
        <button class="flex items-center gap-2 px-5 py-2.5 bg-[#C54A22] hover:bg-[#A83D1B] text-white rounded-[10px] text-[13px] font-semibold transition-colors shadow-sm active:scale-95">
          <Download class="w-4 h-4" />
          Export PDF
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 2. Sidebar -->
      <aside
        class="flex-shrink-0 flex flex-col h-full bg-[#B64A22] text-white overflow-y-auto transition-all duration-300"
        :class="isSidebarExpanded ? 'w-[260px]' : 'w-[80px]'"
      >
        <!-- Header row -->
        <div
          class="px-4 h-12 flex items-center shrink-0 border-b border-white/20"
          :class="isSidebarExpanded ? 'justify-end' : 'justify-center'"
        >
          <button
            class="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-md transition-colors"
            :title="isSidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'"
            @click="isSidebarExpanded = !isSidebarExpanded"
          >
            <component
              :is="isSidebarExpanded ? PanelLeftClose : PanelLeftOpen"
              class="w-4 h-4"
            />
          </button>
        </div>

        <nav class="flex-1 px-3 py-6 flex flex-col gap-1">
          <div
            v-for="step in steps"
            :key="step.id"
            class="flex items-center justify-between px-4 py-3 rounded-xl transition-colors group text-white/80"
            :class="[
              !isSidebarExpanded ? 'justify-center px-0' : '',
              $route.path === step.path ? '!bg-[#FCF1EC] !text-[#B64A22] font-semibold shadow-sm' : 'hover:text-white hover:bg-white/10',
            ]"
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
              <CheckCircle2
                v-if="step.status === 'complete'"
                class="w-4 h-4 text-green-500 flex-shrink-0"
              />
              <Circle
                v-else-if="step.status === 'incomplete'"
                class="w-4 h-4 text-yellow-400 fill-yellow-400/20 flex-shrink-0"
              />
              <Circle
                v-else
                class="w-4 h-4 opacity-30 flex-shrink-0"
              />
            </template>
          </div>
        </nav>
      </aside>

      <!-- 3. Form Area (Middle Slot) -->
      <main class="flex-[1.2] min-w-0 overflow-y-auto relative flex flex-col bg-[#F9F8F6]">
        <slot />
      </main>

      <!-- 4. Live Preview Pane (Right) -->
      <aside class="flex-1 max-w-[640px] border-l border-gray-200 bg-[#F9F8F6] flex-shrink-0 flex flex-col">
        <!-- Preview Toolbar -->
        <div class="h-16 px-6 flex items-center">
          <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
            <div class="w-2 h-2 rounded-full bg-green-500" />
            <span class="text-[11px] font-bold tracking-wide text-gray-600">Live Preview</span>
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="flex-1 overflow-y-auto px-8 pb-12 pt-4 flex justify-center items-start">
          <!-- Clickable CV wrapper -->
          <button
            class="w-full max-w-[500px] aspect-[1/1.414] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] rounded-sm border border-gray-200 cursor-zoom-in group relative overflow-hidden transition-all hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 flex flex-col focus:outline-none"
            @click="isPreviewModalOpen = true"
          >
            <!-- Dynamic Template Render -->
            <div
              class="w-full h-full transform scale-[0.6] origin-top-left"
              style="width: 166.66%; height: 166.66%;"
            >
              <component
                :is="activeTemplateComponent"
                :data="previewData"
              />
            </div>

            <!-- Click to enlarge overlay -->
            <div class="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span class="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-gray-700 shadow-sm border border-gray-200">
                Click to expand
              </span>
            </div>
          </button>
        </div>
      </aside>
    </div>

    <!-- Live Preview Modal -->
    <DialogRoot v-model:open="isPreviewModalOpen">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 animate-in fade-in transition-opacity" />
        <DialogContent class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-5xl h-[95vh] flex justify-center p-4 outline-none animate-in fade-in zoom-in-95 duration-200">
          <div class="relative h-full aspect-[1/1.414] bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col items-center justify-center border border-gray-200">
            <!-- Close Button -->
            <DialogClose class="absolute top-4 right-4 p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm transition-colors z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
              <X class="w-5 h-5 text-gray-700" />
            </DialogClose>

            <!-- High-res Template Render -->
            <div class="w-full h-full">
              <component
                :is="activeTemplateComponent"
                :data="previewData"
              />
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
