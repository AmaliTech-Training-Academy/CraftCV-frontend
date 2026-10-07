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

const { experience } = useCVState()

const itemIndex = computed(() => experience.value.findIndex(e => e.id === props.id))
const item = computed(() => experience.value[itemIndex.value])

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
    <!-- Title / Company -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <EditorFormField
        v-model="item.title"
        :required="true"
        :error="showErrors && !item.title.trim() ? 'Required' : ''"
        label="Job Title"
        placeholder="e.g. Software Engineer"
        autocomplete="organization-title"
        @update:model-value="onEdit"
      />

      <EditorFormField
        v-model="item.company"
        :required="true"
        :error="showErrors && !item.company.trim() ? 'Required' : ''"
        label="Company"
        placeholder="e.g. Google"
        autocomplete="organization"
        @update:model-value="onEdit"
      />
    </div>

    <!-- Location -->
    <EditorFormField
      v-model="item.location"
      label="Location"
      placeholder="e.g. New York, NY"
      @update:model-value="onEdit"
    />

    <!-- Dates -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <EditorMonthYearPicker
        v-model="item.startDate"
        disable-future
        :error="(!isValidDateString(item.startDate) && item.startDate !== '') || (showErrors && !isValidDateString(item.startDate)) ? 'Required' : ''"
        :required="true"
        label="Start Date"
        @update:model-value="onEdit"
      />
      <div>
        <EditorMonthYearPicker
          v-model="item.endDate"
          :disabled="item.isCurrent"
          :error="isEndDateBeforeStartDate(item.startDate, item.endDate, item.isCurrent) ? 'End date must be after the start date' : (showErrors && !item.isCurrent && !isValidDateString(item.endDate) ? 'Required' : '')"
          label="End Date"
          @update:model-value="onEdit"
        />
        <div class="mt-2.5 flex items-center gap-2">
          <input
            :id="'current-job-' + item.id"
            type="checkbox"
            :checked="item.isCurrent"
            class="w-4 h-4 rounded border-gray-300 accent-[#C54A22] text-[#C54A22] focus:ring-2 focus:ring-[#C54A22]/20 cursor-pointer transition"
            @change="toggleCurrent"
          >
          <label
            :for="'current-job-' + item.id"
            class="text-xs text-gray-600 font-medium cursor-pointer select-none"
          >
            I currently work here
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
