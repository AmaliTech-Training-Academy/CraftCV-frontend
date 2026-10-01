<script setup lang="ts">
useHead({ title: 'Education' })
import { Edit, Trash2, Plus, ArrowLeft, ArrowRight, ChevronRight } from '@lucide/vue'
import { useCVState, type EducationItem } from '~/composables/useCVState'
import { isEndDateBeforeStartDate, isValidDateString, useCVSectionEditor } from '~/composables/useCVSectionEditor'

definePageMeta({
  layout: 'editor',
  middleware: ['auth'],
})

const { education } = useCVState()

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `edu_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}

const createEmptyEducation = (): EducationItem => ({
  id: generateId(),
  degree: '',
  school: '',
  fieldOfStudy: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
})

const validateEducation = (item: EducationItem) =>
  Boolean(
    item.school.trim()
    && item.degree.trim()
    && isValidDateString(item.startDate)
    && (!item.endDate?.trim() || item.endDate === 'Present' || isValidDateString(item.endDate))
    && !isEndDateBeforeStartDate(item.startDate, item.endDate),
  )

const isEducationUntouched = (item: EducationItem) =>
  !item.degree.trim() && !item.school.trim() && !item.fieldOfStudy?.trim() && !item.location.trim() && !item.startDate.trim() && !item.description?.trim()

const {
  activeId,
  itemToDeleteId,
  showErrors,
  handleAddEntry,
  promptDelete,
  confirmDelete,
  toggleCurrentStatus,
  validateAndProceed,
} = useCVSectionEditor(
  education,
  createEmptyEducation,
  validateEducation,
  isEducationUntouched,
)

const handleNext = () => {
  validateAndProceed(async () => {
    await navigateTo('/editor/skills')
  })
}
</script>

<template>
  <div class="px-4 sm:px-8 lg:px-20 py-10 max-w-4xl mx-auto w-full">
    <div class="mb-10">
      <NuxtLink
        to="/editor/experience"
        class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#C54A22] hover:text-[#A83D1B] mb-6 transition-colors"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        Back to Experience
      </NuxtLink>

      <h1 class="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
        Education
      </h1>
      <p class="text-gray-500 text-[15px]">
        Add your educational background, degrees, certifications, and academic achievements.
      </p>
    </div>

    <div class="space-y-6">
      <div
        v-for="(item, index) in education"
        :key="item.id"
      >
        <div
          v-if="activeId !== item.id"
          role="button"
          tabindex="0"
          aria-label="Expand education item"
          class="flex items-center justify-between p-4 bg-white border rounded-xl shadow-xs hover:shadow-sm transition cursor-pointer"
          :class="[
            showErrors && !validateEducation(item)
              ? 'border-red-300 bg-red-50/20'
              : 'border-gray-200 hover:border-gray-300',
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
              {{ [item.degree.trim(), item.school.trim()].filter(Boolean).join(' at ') || `Education ${index + 1}` }}
            </span>
            <span
              v-if="showErrors && !validateEducation(item)"
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
              class="h-8 w-8 text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
              size="icon"
              type="button"
              variant="ghost"
              @click="activeId = item.id"
            >
              <Edit class="w-4 h-4" />
            </Button>
            <Button
              aria-label="Delete entry"
              class="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
              size="icon"
              type="button"
              variant="ghost"
              @click="promptDelete(item.id)"
            >
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          v-else
          class="space-y-5 pt-2"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditorFormField
              v-model="item.school"
              :error="showErrors && !item.school.trim() ? 'School is required' : ''"
              :required="true"
              label="School / University"
              placeholder="e.g. KNUST"
            />
            <EditorFormField
              v-model="item.location"
              label="Location"
              placeholder="e.g. Kumasi, Ghana"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditorFormField
              v-model="item.degree"
              :error="showErrors && !item.degree.trim() ? 'Degree is required' : ''"
              :required="true"
              label="Degree / Certificate"
              placeholder="e.g. B.S. in Computer Science"
            />
            <EditorFormField
              v-model="item.fieldOfStudy"
              label="Field of Study"
              placeholder="e.g. Software Engineering"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EditorMonthYearPicker
              v-model="item.startDate"
              :error="showErrors && !item.startDate.trim() ? 'Start date is required' : ''"
              :required="true"
              label="Start Date"
            />
            <div>
              <EditorMonthYearPicker
                v-model="item.endDate"
                :disabled="item.endDate === 'Present'"
                :error="isEndDateBeforeStartDate(item.startDate, item.endDate) ? 'End date must be after the start date' : ''"
                label="End Date"
              />
              <div class="mt-2.5 flex items-center gap-2">
                <input
                  :id="'current-study-' + item.id"
                  type="checkbox"
                  :checked="item.endDate === 'Present'"
                  class="w-4 h-4 rounded border-gray-300 accent-[#C54A22] text-[#C54A22] focus:ring-2 focus:ring-[#C54A22]/20 cursor-pointer transition"
                  @change="toggleCurrentStatus(item, ($event.target as HTMLInputElement).checked)"
                >
                <label
                  :for="'current-study-' + item.id"
                  class="text-xs text-gray-600 font-medium cursor-pointer select-none"
                >
                  Currently studying here
                </label>
              </div>
            </div>
          </div>

          <div>
            <Label
              :for="'edu-desc-' + item.id"
              class="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Description (Optional)
            </Label>
            <textarea
              :id="'edu-desc-' + item.id"
              v-model="item.description"
              rows="4"
              placeholder="Relevant coursework, honors, GPA, or activities..."
              class="w-full rounded-xl border border-gray-200 bg-white p-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#C54A22] focus:outline-none focus:ring-2 focus:ring-[#C54A22]/20 transition resize-y"
            />
          </div>

          <div class="flex items-center justify-between pt-2">
            <Button
              class="text-sm font-medium text-gray-500 hover:text-gray-800"
              type="button"
              variant="ghost"
              @click="activeId = null"
            >
              Collapse
            </Button>
            <Button
              class="px-5 py-2 text-sm font-semibold text-white bg-[#C54A22] hover:bg-[#A83D1B] cursor-pointer"
              type="button"
              @click="activeId = null"
            >
              Done
            </Button>
          </div>
          <Separator class="my-6" />
        </div>
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
        to="/editor/skills"
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
