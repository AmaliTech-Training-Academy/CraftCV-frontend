<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Trash2,
} from '@lucide/vue'
import { useCVState } from '~/composables/useCVState'

definePageMeta({
  layout: 'editor',
  middleware: ['auth'],
})

const { skills } = useCVState()

const skillLevels = ['Beginner', 'Intermediate', 'Advanced'] as const
type SkillLevel = (typeof skillLevels)[number]

const newSkillName = ref('')
const newSkillLevel = ref<SkillLevel>('Intermediate')
const inputError = ref('')
const isClearAllDialogOpen = ref(false)

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `skill_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`
}

const addSkill = () => {
  const trimmed = newSkillName.value.trim()
  if (!trimmed) {
    inputError.value = 'Please enter a skill or keyword'
    return
  }

  // Check if already added
  const exists = skills.value.some(
    s => s.name.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (exists) {
    inputError.value = 'This skill is already in your list'
    return
  }

  skills.value.push({
    id: generateId(),
    name: trimmed,
    level: newSkillLevel.value,
  })

  newSkillName.value = ''
  inputError.value = ''
}

const removeSkill = (id: string) => {
  const idx = skills.value.findIndex(s => s.id === id)
  if (idx !== -1) {
    skills.value.splice(idx, 1)
  }
}

const handlePromptClearAll = () => {
  isClearAllDialogOpen.value = true
}

const confirmClearAll = () => {
  skills.value = []
  isClearAllDialogOpen.value = false
}

const moveSkillUp = (index: number) => {
  if (index <= 0) return
  const item = skills.value.splice(index, 1)[0]
  if (item) {
    skills.value.splice(index - 1, 0, item)
  }
}

const moveSkillDown = (index: number) => {
  if (index >= skills.value.length - 1) return
  const item = skills.value.splice(index, 1)[0]
  if (item) {
    skills.value.splice(index + 1, 0, item)
  }
}

const getLevelBadgeClass = (level?: string) => {
  switch (level) {
    case 'Beginner':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Advanced':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300'
    case 'Intermediate':
    default:
      return 'bg-amber-50 text-amber-800 border-amber-300'
  }
}

const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const onDragStart = (index: number, event: DragEvent) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const onDragOver = (index: number, event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverIndex.value = index
}

const onDragEnter = (index: number) => {
  dragOverIndex.value = index
}

const onDragLeave = (index: number) => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

const onDrop = (targetIndex: number, event: DragEvent) => {
  event.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== targetIndex) {
    const item = skills.value.splice(draggedIndex.value, 1)[0]
    if (item) {
      skills.value.splice(targetIndex, 0, item)
    }
  }
  draggedIndex.value = null
  dragOverIndex.value = null
}

const onDragEnd = () => {
  draggedIndex.value = null
  dragOverIndex.value = null
}

const handleNext = async () => {
  await navigateTo('/editor/certifications')
}
</script>

<template>
  <div class="px-4 sm:px-8 lg:px-20 py-10 max-w-4xl mx-auto w-full">
    <!-- Header -->
    <div class="mb-8">
      <NuxtLink
        to="/editor/education"
        class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#C54A22] hover:text-[#A83D1B] mb-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/30 rounded"
      >
        <ArrowLeft
          class="w-3.5 h-3.5"
          aria-hidden="true"
        />
        Back to Education
      </NuxtLink>

      <h1 class="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
        Skills
      </h1>
      <p class="text-gray-500 text-[15px] leading-relaxed">
        Highlight your technical proficiencies, frameworks, tools, and domain expertise. Employers scan this section first.
      </p>
    </div>

    <!-- 1. Add Skill Card -->
    <div class="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs mb-6">
      <label
        for="skill-input"
        class="block text-sm font-bold text-gray-900 mb-3"
      >
        Add a skill or keyword
      </label>

      <form
        class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        @submit.prevent="addSkill"
      >
        <div class="flex-1 relative">
          <input
            id="skill-input"
            v-model="newSkillName"
            type="text"
            placeholder="e.g. Design Systems, React, Python, UI/UX"
            :aria-invalid="Boolean(inputError)"
            :aria-describedby="inputError ? 'skill-input-error' : undefined"
            class="w-full h-11 px-4 rounded-xl border text-sm transition-all focus:outline-none"
            :class="[
              inputError
                ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
                : 'border-gray-200 focus:ring-2 focus:ring-[#C54A22]/20',
            ]"
            @input="inputError = ''"
          >
        </div>

        <!-- Level Selector Dropdown -->
        <div class="relative min-w-37.5">
          <select
            v-model="newSkillLevel"
            aria-label="Skill level"
            class="w-full h-11 pl-4 pr-9 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-[#C54A22]/20 transition-all"
          >
            <option
              v-for="lvl in skillLevels"
              :key="lvl"
              :value="lvl"
            >
              {{ lvl }}
            </option>
          </select>
          <ChevronDown
            class="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
        </div>

        <!-- Add Button -->
        <button
          type="submit"
          aria-label="Add skill to list"
          class="h-11 px-6 bg-[#C54A22] hover:bg-[#A83D1B] active:scale-95 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/40"
        >
          <Plus
            class="w-4 h-4"
            aria-hidden="true"
          />
          Add
        </button>
      </form>

      <p
        v-if="inputError"
        id="skill-input-error"
        role="alert"
        aria-live="polite"
        class="text-xs font-semibold text-red-500 mt-2"
      >
        {{ inputError }}
      </p>
    </div>

    <!-- 2. Active Skills List Card -->
    <div class="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-2.5">
          <h2 class="text-base font-bold text-gray-900">
            Active Skills List
          </h2>
          <span
            v-if="skills.length > 0"
            :aria-label="skills.length + ' skills in list'"
            class="bg-[#C54A22] text-white text-xs font-bold min-w-5.5 h-5.5 px-1.5 rounded-full flex items-center justify-center"
          >
            {{ skills.length }}
          </span>
        </div>

        <button
          v-if="skills.length > 0"
          type="button"
          aria-label="Clear all active skills"
          class="text-xs text-gray-400 hover:text-red-600 font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
          @click="handlePromptClearAll"
        >
          Clear all
        </button>
      </div>

      <!-- Skills Stack (Semantic List) -->
      <ul
        v-if="skills.length > 0"
        role="list"
        aria-label="Active skills list"
        class="space-y-3"
      >
        <li
          v-for="(item, index) in skills"
          :key="item.id"
          draggable="true"
          class="bg-white border rounded-xl p-3 sm:px-4 flex items-center justify-between transition-all shadow-xs group cursor-grab select-none"
          :class="[
            draggedIndex === index
              ? 'opacity-40 scale-[0.99] border-dashed border-[#C54A22] cursor-grabbing'
              : dragOverIndex === index
                ? 'border-[#C54A22] ring-2 ring-[#C54A22]/30 bg-[#C54A22]/5'
                : 'border-gray-200 hover:border-gray-300',
          ]"
          @dragstart="onDragStart(index, $event)"
          @dragover="onDragOver(index, $event)"
          @dragenter="onDragEnter(index)"
          @dragleave="onDragLeave(index)"
          @drop="onDrop(index, $event)"
          @dragend="onDragEnd"
        >
          <!-- Left: Grip & Name -->
          <div class="flex items-center gap-3 min-w-0 pr-3 pointer-events-none">
            <GripVertical
              class="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0"
              aria-hidden="true"
            />
            <span class="text-sm font-semibold text-gray-900 truncate">
              {{ item.name }}
            </span>
          </div>

          <!-- Right: Move Buttons, Level Badge & Remove -->
          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <!-- Move Up / Down Buttons for Keyboard Accessibility -->
            <div class="flex items-center">
              <button
                type="button"
                :disabled="index === 0"
                aria-label="Move up"
                :title="'Move up ' + item.name"
                class="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:pointer-events-none hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/40 cursor-pointer"
                @click="moveSkillUp(index)"
              >
                <ArrowUp
                  class="w-4 h-4"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                :disabled="index === skills.length - 1"
                aria-label="Move down"
                :title="'Move down ' + item.name"
                class="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:pointer-events-none hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/40 cursor-pointer"
                @click="moveSkillDown(index)"
              >
                <ArrowDown
                  class="w-4 h-4"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div class="relative">
              <select
                v-model="item.level"
                :aria-label="'Edit proficiency level for ' + item.name"
                class="appearance-none pl-3 pr-7 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#C54A22]/20"
                :class="getLevelBadgeClass(item.level)"
              >
                <option
                  v-for="lvl in skillLevels"
                  :key="lvl"
                  :value="lvl"
                >
                  {{ lvl }}
                </option>
              </select>
              <ChevronDown
                class="w-3.5 h-3.5 opacity-60 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              aria-label="Remove skill"
              :title="'Remove ' + item.name"
              class="text-gray-300 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              @click="removeSkill(item.id)"
            >
              <X
                class="w-4 h-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </li>
      </ul>

      <!-- Empty State -->
      <div
        v-else
        class="py-12 flex flex-col items-center justify-center text-center text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/50"
      >
        <p class="text-sm font-medium text-gray-500">
          No skills added yet
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Type a skill or keyword above and click "+ Add" to populate your CV.
        </p>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between pb-12">
      <NuxtLink
        class="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:underline"
        to="/editor/certifications"
      >
        Skip for now
        <ChevronRight
          class="w-4 h-4"
          aria-hidden="true"
        />
      </NuxtLink>
      <Button
        class="inline-flex items-center gap-2 px-8 py-3 bg-[#C54A22] hover:bg-[#A83D1B] active:scale-95 cursor-pointer text-white rounded-[10px] text-sm font-bold transition-all shadow-xs h-auto"
        type="button"
        @click="handleNext"
      >
        Next
        <ArrowRight
          class="w-4 h-4"
          aria-hidden="true"
        />
      </Button>
    </div>

    <!-- Clear All Confirmation Dialog -->
    <Dialog
      :open="isClearAllDialogOpen"
      @update:open="(val: boolean) => { isClearAllDialogOpen = val }"
    >
      <DialogContent
        :show-close-button="false"
        class="sm:max-w-95 p-6 sm:p-7 rounded-2xl flex flex-col items-center text-center gap-0 border-0 shadow-2xl"
      >
        <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Trash2 class="w-5 h-5 text-red-500" />
        </div>
        <DialogHeader class="gap-0 flex flex-col items-center text-center">
          <DialogTitle class="text-xl font-bold text-gray-900 mb-2">
            Clear all skills?
          </DialogTitle>
          <DialogDescription class="text-sm text-gray-500 text-center max-w-65 leading-relaxed mb-6">
            Are you sure you want to delete all skills from your list? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div class="grid grid-cols-2 gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            class="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm h-auto cursor-pointer"
            @click="isClearAllDialogOpen = false"
          >
            Cancel
          </Button>
          <Button
            class="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm shadow-xs h-auto cursor-pointer"
            type="button"
            @click="confirmClearAll"
          >
            Clear all skills
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
