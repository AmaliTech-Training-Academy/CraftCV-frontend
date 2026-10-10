<script setup lang="ts">
import { computed } from 'vue'
import { useCVState } from '~/composables/useCVState'
import { isEndDateBeforeStartDate, isValidDateString } from '~/composables/useCVSectionEditor'

const props = defineProps<{
  id: string
  showErrors?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-current', isCurrent: boolean): void
}>()

const { education, saveErrorFor } = useCVState()

const itemIndex = computed(() => education.value.findIndex(e => e.id === props.id))
const item = computed(() => education.value[itemIndex.value])

/**
 * The message a rejected save put on one of this entry's fields, or ''. Scoped
 * to this record by id, so a message the backend sent about another entry
 * cannot appear here.
 */
const backendError = (key: string) => saveErrorFor(props.id, key)

const onEdit = () => {
  // No longer needed to emit for autosave, state is watched globally
}

const toggleCurrent = (e: Event) => {
  if (!item.value) return
  const checked = (e.target as HTMLInputElement).checked
  emit('toggle-current', checked)
  onEdit()
}
</script>

<template>
  <div
    v-if="item"
    class="space-y-5"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <EditorFormField
        v-model="item.school"
        :required="true"
        :error="backendError('school') || (showErrors && !item.school.trim() ? 'Required' : '')"
        label="School / University"
        placeholder="e.g. KNUST"
        @update:model-value="onEdit"
      />
      <EditorFormField
        v-model="item.location"
        label="Location"
        placeholder="e.g. Kumasi, Ghana"
        :error="backendError('location')"
        @update:model-value="onEdit"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <EditorFormField
        v-model="item.degree"
        :required="true"
        :error="backendError('degree') || (showErrors && !item.degree.trim() ? 'Required' : '')"
        label="Degree / Certificate"
        placeholder="e.g. B.S."
        @update:model-value="onEdit"
      />
      <EditorFormField
        v-model="item.fieldOfStudy"
        :required="true"
        label="Field of Study"
        placeholder="e.g. Computer Science"
        :error="backendError('fieldOfStudy') || (showErrors && (!item.fieldOfStudy || !item.fieldOfStudy.trim()) ? 'Required' : '')"
        @update:model-value="onEdit"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <EditorMonthYearPicker
        v-model="item.startDate"
        disable-future
        :error="backendError('startDate') || ((!isValidDateString(item.startDate) && item.startDate !== '') || (showErrors && !isValidDateString(item.startDate)) ? 'Required' : '')"
        :required="true"
        label="Start Date"
        @update:model-value="onEdit"
      />
      <div>
        <EditorMonthYearPicker
          v-model="item.endDate"
          :disabled="item.isCurrent"
          :error="backendError('endDate') || (isEndDateBeforeStartDate(item.startDate, item.endDate, item.isCurrent) ? 'End date must be after the start date' : (showErrors && !item.isCurrent && !isValidDateString(item.endDate) ? 'Required' : ''))"
          label="End Date"
          @update:model-value="onEdit"
        />
        <div class="mt-2.5 flex items-center gap-2">
          <input
            :id="'current-study-' + item.id"
            type="checkbox"
            :checked="item.isCurrent"
            class="w-4 h-4 rounded border-gray-300 accent-[#C54A22] text-[#C54A22] focus:ring-2 focus:ring-[#C54A22]/20 cursor-pointer transition"
            @change="toggleCurrent"
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

    <!-- Description -->
    <div class="space-y-1">
      <EditorDescriptionEditor
        v-model="item.description"
        label="Description (Optional)"
        @update:model-value="onEdit"
      />
    </div>
  </div>
</template>
