<script setup lang="ts">
import { Edit, Trash2, Plus, ArrowRight, ChevronRight } from '@lucide/vue'
import { useMediaQuery } from '@vueuse/core'
import { useCVState, type ExperienceItem } from '~/composables/useCVState'
import { isEndDateBeforeStartDate, isValidDateString, useCVSectionEditor } from '~/composables/useCVSectionEditor'
import { parseDescription } from '~/utils/cvText'

useHead({ title: 'Work Experience' })

const isMobile = useMediaQuery('(max-width: 640px)')

definePageMeta({
  layout: 'editor',
  middleware: ['auth'],
})

const { experience } = useCVState()

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `exp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}

const createEmptyExperience = (): ExperienceItem => ({
  id: generateId(),
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: null,
  isCurrent: false,
  description: '',
})

const validateExperience = (item: ExperienceItem) =>
  Boolean(
    item.title.trim()
    && item.company.trim()
    && isValidDateString(item.startDate)
    && (item.isCurrent || isValidDateString(item.endDate))
    && !isEndDateBeforeStartDate(item.startDate, item.endDate, item.isCurrent),
  )

const isExperienceUntouched = (item: ExperienceItem) =>
  !item.title.trim() && !item.company.trim() && !item.location.trim() && !item.startDate.trim() && parseDescription(item.description).length === 0

const {
  activeId,
  itemToDeleteId,
  showErrors,
  handleAddEntry,
  promptDelete,
  confirmDelete,
  validateAndProceed,
  toggleCurrentStatus,
} = useCVSectionEditor(
  experience,
  createEmptyExperience,
  validateExperience,
)

const itemShowErrors = ref<Record<string, boolean>>({})

const handleFormDone = (item: ExperienceItem) => {
  if (validateExperience(item)) {
    activeId.value = null
    itemShowErrors.value[item.id] = false
  }
  else {
    itemShowErrors.value[item.id] = true
  }
}

const handleFormCancel = (item: ExperienceItem) => {
  if (isExperienceUntouched(item)) {
    experience.value = experience.value.filter(e => e.id !== item.id)
    activeId.value = null
  }
  else {
    promptDelete(item.id)
  }
}

const handleNext = () => {
  validateAndProceed(async () => {
    await navigateTo('/editor/education')
  })
}
</script>

<template>
  <div class="px-4 sm:px-8 lg:px-20 py-10 max-w-4xl mx-auto w-full">
    <EditorSectionHeader
      title="Work Experience"
      description="Add your relevant work history, key achievements, and leadership roles. Start with your most recent position."
      back-link="/editor/summary"
      back-text="Back to Summary"
    />

    <div class="space-y-6">
      <div
        v-for="(item, index) in experience"
        :key="item.id"
      >
        <div
          v-show="activeId !== item.id || isMobile"
          role="button"
          tabindex="0"
          aria-label="Expand experience item"
          class="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow transition cursor-pointer mb-4"
          :class="[
            showErrors && !validateExperience(item)
              ? 'border-red-300 bg-red-50/20'
              : 'border-gray-200 hover:border-[#B64A22]/30',
          ]"
          @click="activeId = item.id"
          @keydown.enter.prevent="activeId = item.id"
          @keydown.space.prevent="activeId = item.id"
        >
          <div class="flex items-center gap-3 overflow-hidden">
            <span class="text-xs font-semibold text-gray-400 bg-gray-100 rounded-md px-2 py-1 shrink-0">
              #{{ index + 1 }}
            </span>
            <span class="text-sm font-semibold text-gray-800 truncate">
              {{ [item.title.trim(), item.company.trim()].filter(Boolean).join(' at ') || `Position ${index + 1}` }}
            </span>
            <span
              v-if="showErrors && !validateExperience(item)"
              class="text-xs font-semibold text-red-500 shrink-0"
            >
              (Incomplete)
            </span>
          </div>
          <div
            class="flex items-center gap-1 shrink-0"
            @click.stop
          >
            <Button
              aria-label="Edit entry"
              class="h-9 w-9 text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer rounded-lg"
              size="icon"
              type="button"
              variant="ghost"
              @click="activeId = item.id"
            >
              <Edit class="w-4 h-4" />
            </Button>
            <Button
              aria-label="Delete entry"
              class="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer rounded-lg"
              size="icon"
              type="button"
              variant="ghost"
              @click="promptDelete(item.id)"
            >
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <EditorFormShell
          :id="item.id"
          :title="[item.title.trim(), item.company.trim()].filter(Boolean).join(' at ') || 'Edit Experience'"
          :is-open="activeId === item.id"
          @close="handleFormCancel(item)"
          @done="handleFormDone(item)"
        >
          <EditorExperienceForm
            :id="item.id"
            :show-errors="itemShowErrors[item.id]"
            @toggle-current="toggleCurrentStatus(item, $event)"
          />
        </EditorFormShell>
      </div>

      <Button
        class="w-full py-6 border-2 border-dashed border-gray-200 hover:border-[#C54A22]/50 hover:bg-[#C54A22]/5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium text-[#C54A22] transition cursor-pointer"
        type="button"
        variant="outline"
        @click="handleAddEntry"
      >
        <Plus class="w-4 h-4" />
        Add Entry
      </Button>
    </div>

    <div class="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between pb-12">
      <NuxtLink
        class="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5"
        to="/editor/education"
      >
        Skip for now
        <ChevronRight class="w-4 h-4" />
      </NuxtLink>
      <Button
        class="inline-flex items-center gap-2 px-8 py-3 bg-[#C54A22] hover:bg-[#A83D1B] active:scale-95 cursor-pointer text-white rounded-[10px] text-sm font-bold transition-all shadow-xs h-auto"
        type="button"
        @click="handleNext"
      >
        Next
        <ArrowRight class="w-4 h-4" />
      </Button>
    </div>

    <Dialog
      :open="itemToDeleteId !== null"
      @update:open="(val: boolean) => { if (!val) itemToDeleteId = null }"
    >
      <DialogContent
        :show-close-button="false"
        class="sm:max-w-[380px] p-6 sm:p-7 rounded-2xl flex flex-col items-center text-center gap-0 border-0 shadow-2xl"
      >
        <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Trash2 class="w-5 h-5 text-red-500" />
        </div>
        <DialogHeader class="gap-0 flex flex-col items-center text-center">
          <DialogTitle class="text-xl font-bold text-gray-900 mb-2">
            Delete entry?
          </DialogTitle>
          <DialogDescription class="text-sm text-gray-500 text-center max-w-[260px] leading-relaxed mb-6">
            Are you sure you want to permanently remove this entry?
          </DialogDescription>
        </DialogHeader>
        <div class="grid grid-cols-2 gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            class="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm h-auto cursor-pointer"
            @click="itemToDeleteId = null"
          >
            Cancel
          </Button>
          <Button
            class="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-xs h-auto cursor-pointer"
            type="button"
            @click="confirmDelete"
          >
            Delete entry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
