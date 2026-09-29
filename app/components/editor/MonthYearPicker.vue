<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label: string
    required?: boolean
    disabled?: boolean
    error?: string
  }>(),
  {
    modelValue: '',
    required: false,
    disabled: false,
    error: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => currentYear - i)

const pickerId = computed(() => `picker-${props.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)

const selectedMonth = computed(() => {
  if (!props.modelValue || props.modelValue === 'Present') return ''
  const parts = props.modelValue.trim().split(' ')
  return parts.length >= 1 ? (parts[0] ?? '') : ''
})

const selectedYear = computed(() => {
  if (!props.modelValue || props.modelValue === 'Present') return ''
  const parts = props.modelValue.trim().split(' ')
  return parts.length >= 2 ? (parts[1] ?? '') : ''
})

const updateDate = (newMonth: string, newYear: string) => {
  if (!newMonth && !newYear) {
    emit('update:modelValue', '')
  }
  else if (newMonth && newYear) {
    emit('update:modelValue', `${newMonth} ${newYear}`)
  }
  else {
    emit('update:modelValue', `${newMonth} ${newYear}`.trim())
  }
}

const onMonthChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  updateDate(target.value, selectedYear.value)
}

const onYearChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  updateDate(selectedMonth.value, target.value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label
      :for="`${pickerId}-month`"
      class="block text-sm font-medium text-gray-700"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-[#C54A22] ml-0.5"
      >*</span>
    </label>

    <div class="grid grid-cols-2 gap-2">
      <select
        :id="`${pickerId}-month`"
        :value="selectedMonth"
        :disabled="disabled"
        aria-label="Select Month"
        class="h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 transition focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        :class="error ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : 'border-gray-200 focus:border-[#C54A22] focus:ring-[#C54A22]/20'"
        @change="onMonthChange"
      >
        <option
          value=""
          disabled
        >
          Month
        </option>
        <option
          v-for="m in months"
          :key="m"
          :value="m"
        >
          {{ m }}
        </option>
      </select>

      <select
        :id="`${pickerId}-year`"
        :value="selectedYear"
        :disabled="disabled"
        aria-label="Select Year"
        class="h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-gray-900 transition focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        :class="error ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : 'border-gray-200 focus:border-[#C54A22] focus:ring-[#C54A22]/20'"
        @change="onYearChange"
      >
        <option
          value=""
          disabled
        >
          Year
        </option>
        <option
          v-for="y in years"
          :key="y"
          :value="String(y)"
        >
          {{ y }}
        </option>
      </select>
    </div>

    <p
      v-if="error"
      class="text-xs text-red-500 mt-0.5 font-medium animate-in fade-in zoom-in duration-200"
    >
      {{ error }}
    </p>
  </div>
</template>
