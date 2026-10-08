<script lang="ts">
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { computed, ref, shallowRef, useId, watch } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight } from '@lucide/vue'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
  type DateValue,
  MonthPickerCell,
  MonthPickerCellTrigger,
  MonthPickerGrid,
  MonthPickerGridBody,
  MonthPickerGridRow,
  MonthPickerHeader,
  MonthPickerHeading,
  MonthPickerNext,
  MonthPickerPrev,
  MonthPickerRoot,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  YearPickerCell,
  YearPickerCellTrigger,
  YearPickerGrid,
  YearPickerGridBody,
  YearPickerGridRow,
  YearPickerHeader,
  YearPickerHeading,
  YearPickerNext,
  YearPickerPrev,
  YearPickerRoot,
} from 'reka-ui'

export type DatePickerMode = 'month' | 'day'

export const MONTH_NAMES: string[] = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Parses the picker's model value into a calendar date.
 *
 * `month` mode reads "January 2024"; `day` mode reads "24/08/1990".
 * Empty values and "Present" have no date, and anything else that does not
 * match the expected shape returns undefined so a malformed value simply
 * leaves the grid unpicked instead of throwing.
 */
export function parseDateValue(value: string | null | undefined, mode: DatePickerMode = 'month'): CalendarDate | undefined {
  const trimmed = (value ?? '').trim()
  if (!trimmed || trimmed.toLowerCase() === 'present') return undefined

  if (mode === 'day') {
    const [dayPart, monthPart, yearPart] = trimmed.split('/')
    const day = Number(dayPart)
    const month = Number(monthPart)
    const year = Number(yearPart)
    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return undefined
    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined
    return new CalendarDate(year, month, day)
  }

  const [monthName, yearPart] = trimmed.split(/\s+/)
  const monthIndex = monthName ? MONTH_NAMES.indexOf(monthName) : -1
  const year = Number(yearPart)
  if (monthIndex === -1 || !Number.isInteger(year)) return undefined
  return new CalendarDate(year, monthIndex + 1, 1)
}

/**
 * Formats a calendar date back into the picker's model value.
 *
 * `month` mode produces "January 2024"; `day` mode produces "24/08/1990".
 * Built from the calendar date's own fields rather than a JS `Date`, so no
 * timezone can shift the day.
 */
export function formatDateValue(date: DateValue, mode: DatePickerMode = 'month'): string {
  if (mode === 'day') {
    return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`
  }
  const monthName = MONTH_NAMES[date.month - 1] ?? ''
  return monthName ? `${monthName} ${date.year}` : ''
}
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label: string
    required?: boolean
    disabled?: boolean
    error?: string
    /**
     * `month` picks a month and a year and emits "January 2024".
     * `day` picks a full date and emits "24/08/1990".
     */
    mode?: 'month' | 'day'
    placeholder?: string
    /**
     * Blocks dates after today. Start dates, issue dates and dates of birth
     * cannot be in the future; end dates and expiry dates can.
     */
    disableFuture?: boolean
    /** Shows the remove (X) button next to the label. Consumers listen for `remove`. */
    removable?: boolean
  }>(),
  {
    modelValue: '',
    required: false,
    disabled: false,
    error: '',
    mode: 'month',
    placeholder: 'Select date',
    disableFuture: false,
    removable: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'remove'): void
}>()

/**
 * The three levels of the picker, coarse to fine. A field starts at the level
 * it actually edits and the heading drills up from there, so reaching a year
 * far from the current one never means paging through month after month.
 *
 * `month` mode: months <-> years
 * `day` mode:   days -> months -> years
 */
type Panel = 'days' | 'months' | 'years'

const labelId = useId()
const open = ref(false)

/** Earliest selectable date. Matches the 1970 floor the old year dropdown had. */
const minValue = new CalendarDate(1970, 1, 1)

/**
 * Latest selectable date. `day` mode is the date of birth, which is always in
 * the past; otherwise it is whatever the consumer declares with
 * `disableFuture`. Education end dates and certification expiry dates stay
 * open, because an expected graduation or a renewal date is legitimately ahead.
 */
const maxValue = computed(() =>
  props.mode === 'day' || props.disableFuture ? today(getLocalTimeZone()) : undefined,
)

const selectedDate = computed(() => parseDateValue(props.modelValue, props.mode))

const displayValue = computed(() => (props.modelValue ?? '').trim())

/**
 * The month every panel is currently looking at, shared with all three roots
 * through `v-model:placeholder`. Sharing it is what keeps the levels in step:
 * paging the month grid or the year grid updates this, so drilling up or down
 * lands on the page you were just looking at instead of snapping back.
 *
 * A `shallowRef` holding reka's own `DateValue` rather than a `ref`: `ref` runs
 * the union through Vue's `UnwrapRef`, which rebuilds each calendar class as a
 * mapped type and drops its `#private` brand, leaving a value the `placeholder`
 * prop no longer accepts.
 */
const placeholderDate = shallowRef<DateValue>(selectedDate.value ?? today(getLocalTimeZone()))

const panel = ref<Panel>(props.mode === 'day' ? 'days' : 'months')

// Reopen on the value the field actually holds, not wherever the last visit ended.
watch(open, (isOpen) => {
  if (!isOpen) return
  panel.value = props.mode === 'day' ? 'days' : 'months'
  placeholderDate.value = selectedDate.value ?? today(getLocalTimeZone())
})

const asSingle = (value: unknown): DateValue | undefined => {
  const single = Array.isArray(value) ? value[0] : value
  return (single as DateValue | undefined) ?? undefined
}

/** Keeps the selected day when the anchor lands on the month it belongs to. */
const anchor = (year: number, month: number) => {
  const selected = selectedDate.value
  const day = selected && selected.year === year && selected.month === month ? selected.day : 1
  return new CalendarDate(year, month, day)
}

const commit = (value: unknown) => {
  const single = asSingle(value)
  if (!single) return
  emit('update:modelValue', formatDateValue(single, props.mode))
  open.value = false
}

/**
 * A month click means "pick this" in month mode, but only "show me this month"
 * in day mode — there the day still has to be chosen, so it hands back to the
 * day grid instead of closing.
 */
const onMonthPicked = (value: unknown) => {
  const single = asSingle(value)
  if (!single) return

  if (props.mode !== 'day') {
    commit(single)
    return
  }

  placeholderDate.value = anchor(single.year, single.month)
  panel.value = 'days'
}

/** A year click never commits; it narrows the month grid and hands back to it. */
const onYearPicked = (value: unknown) => {
  const single = asSingle(value)
  if (!single) return

  placeholderDate.value = anchor(single.year, placeholderDate.value.month)
  panel.value = 'months'
}

const triggerClass = computed(() => {
  if (props.disabled) return 'bg-gray-50/80 text-gray-400 border-gray-200'
  if (props.error) return 'bg-white border-red-400 focus:border-red-500 focus:ring-red-400/20'
  return 'bg-white border-gray-300 focus:border-[#C54A22] focus:ring-[#C54A22]/20'
})

const navButtonClass
  = 'inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#C54A22] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/30 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500'

const headingButtonClass
  = 'rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 hover:text-[#C54A22] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/30'

const cellTriggerClass
  = 'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22]/30 data-selected:bg-[#C54A22] data-selected:text-white data-today:font-semibold data-disabled:cursor-not-allowed data-disabled:opacity-30 data-disabled:hover:bg-transparent'
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <div class="flex items-center justify-between">
      <label
        :id="labelId"
        class="text-[13px] font-semibold text-gray-700"
      >
        {{ label }} <span
          v-if="required"
          class="text-[#C54A22]"
        >*</span>
      </label>
      <button
        v-if="removable"
        type="button"
        class="text-gray-400 hover:text-[#C54A22] transition-colors p-1"
        title="Remove field"
        @click="emit('remove')"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        /></svg>
      </button>
    </div>

    <PopoverRoot v-model:open="open">
      <PopoverTrigger as-child>
        <button
          type="button"
          :disabled="disabled"
          :aria-labelledby="labelId"
          :aria-invalid="Boolean(error)"
          class="w-full h-12 rounded-xl border px-4 flex items-center justify-between gap-2 text-left transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed"
          :class="triggerClass"
        >
          <span
            class="text-sm truncate"
            :class="displayValue && !disabled ? 'text-gray-900' : 'text-gray-400'"
          >
            {{ displayValue || placeholder }}
          </span>
          <CalendarDays
            class="w-4 h-4 shrink-0"
            :class="disabled ? 'text-gray-300' : 'text-gray-400'"
          />
        </button>
      </PopoverTrigger>

      <PopoverPortal>
        <PopoverContent
          align="start"
          :side-offset="6"
          class="z-50 rounded-xl border border-gray-200 bg-white p-3 shadow-lg focus:outline-none"
        >
          <!-- Years: both modes drill here from the heading -->
          <YearPickerRoot
            v-if="panel === 'years'"
            v-slot="{ grid }"
            v-model:placeholder="placeholderDate"
            :model-value="selectedDate"
            :min-value="minValue"
            :max-value="maxValue"
            :disabled="disabled"
            locale="en"
            prevent-deselect
            initial-focus
            @update:model-value="onYearPicked"
          >
            <YearPickerHeader class="flex items-center justify-between gap-2 pb-2">
              <YearPickerPrev
                aria-label="Previous years"
                :class="navButtonClass"
              >
                <ChevronLeft class="h-4 w-4" />
              </YearPickerPrev>
              <YearPickerHeading class="text-sm font-semibold text-gray-900" />
              <YearPickerNext
                aria-label="Next years"
                :class="navButtonClass"
              >
                <ChevronRight class="h-4 w-4" />
              </YearPickerNext>
            </YearPickerHeader>

            <YearPickerGrid class="w-full border-collapse">
              <YearPickerGridBody>
                <YearPickerGridRow
                  v-for="(row, rowIndex) in grid.rows"
                  :key="rowIndex"
                >
                  <YearPickerCell
                    v-for="yearDate in row"
                    :key="yearDate.toString()"
                    :date="yearDate"
                    class="p-0.5"
                  >
                    <YearPickerCellTrigger
                      :year="yearDate"
                      class="w-full rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-[#FCF1EC] hover:text-[#C54A22]"
                      :class="cellTriggerClass"
                    />
                  </YearPickerCell>
                </YearPickerGridRow>
              </YearPickerGridBody>
            </YearPickerGrid>
          </YearPickerRoot>

          <!-- Months: commits in month mode, steers in day mode -->
          <MonthPickerRoot
            v-else-if="panel === 'months'"
            v-slot="{ grid }"
            v-model:placeholder="placeholderDate"
            :model-value="selectedDate"
            :min-value="minValue"
            :max-value="maxValue"
            :disabled="disabled"
            locale="en"
            prevent-deselect
            initial-focus
            @update:model-value="onMonthPicked"
          >
            <MonthPickerHeader class="flex items-center justify-between gap-2 pb-2">
              <MonthPickerPrev
                aria-label="Previous year"
                :class="navButtonClass"
              >
                <ChevronLeft class="h-4 w-4" />
              </MonthPickerPrev>
              <MonthPickerHeading
                v-slot="{ headingValue }"
                as-child
              >
                <button
                  type="button"
                  role="button"
                  title="Change year"
                  :class="headingButtonClass"
                  @click="panel = 'years'"
                >
                  {{ headingValue }}
                </button>
              </MonthPickerHeading>
              <MonthPickerNext
                aria-label="Next year"
                :class="navButtonClass"
              >
                <ChevronRight class="h-4 w-4" />
              </MonthPickerNext>
            </MonthPickerHeader>

            <MonthPickerGrid class="w-full border-collapse">
              <MonthPickerGridBody>
                <MonthPickerGridRow
                  v-for="(row, rowIndex) in grid.rows"
                  :key="rowIndex"
                >
                  <MonthPickerCell
                    v-for="monthDate in row"
                    :key="monthDate.toString()"
                    :date="monthDate"
                    class="p-0.5"
                  >
                    <MonthPickerCellTrigger
                      :month="monthDate"
                      class="w-full rounded-lg px-2 py-2 text-sm text-gray-700 hover:bg-[#FCF1EC] hover:text-[#C54A22]"
                      :class="cellTriggerClass"
                    />
                  </MonthPickerCell>
                </MonthPickerGridRow>
              </MonthPickerGridBody>
            </MonthPickerGrid>
          </MonthPickerRoot>

          <!-- Days -->
          <CalendarRoot
            v-else
            v-slot="{ grid, weekDays }"
            v-model:placeholder="placeholderDate"
            :model-value="selectedDate"
            :min-value="minValue"
            :max-value="maxValue"
            :disabled="disabled"
            locale="en"
            weekday-format="short"
            prevent-deselect
            initial-focus
            @update:model-value="commit"
          >
            <CalendarHeader class="flex items-center justify-between gap-2 pb-2">
              <CalendarPrev
                aria-label="Previous month"
                :class="navButtonClass"
              >
                <ChevronLeft class="h-4 w-4" />
              </CalendarPrev>
              <CalendarHeading
                v-slot="{ headingValue }"
                as-child
              >
                <button
                  type="button"
                  role="button"
                  title="Change month"
                  :class="headingButtonClass"
                  @click="panel = 'months'"
                >
                  {{ headingValue }}
                </button>
              </CalendarHeading>
              <CalendarNext
                aria-label="Next month"
                :class="navButtonClass"
              >
                <ChevronRight class="h-4 w-4" />
              </CalendarNext>
            </CalendarHeader>

            <CalendarGrid
              v-for="month in grid"
              :key="month.value.toString()"
              class="w-full border-collapse"
            >
              <CalendarGridHead>
                <CalendarGridRow>
                  <CalendarHeadCell
                    v-for="weekDay in weekDays"
                    :key="weekDay"
                    class="pb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400"
                  >
                    {{ weekDay }}
                  </CalendarHeadCell>
                </CalendarGridRow>
              </CalendarGridHead>
              <CalendarGridBody>
                <CalendarGridRow
                  v-for="(week, weekIndex) in month.rows"
                  :key="weekIndex"
                >
                  <CalendarCell
                    v-for="dayDate in week"
                    :key="dayDate.toString()"
                    :date="dayDate"
                    class="p-0.5 text-center"
                  >
                    <CalendarCellTrigger
                      :day="dayDate"
                      :month="month.value"
                      class="h-8 w-8 rounded-lg text-sm text-gray-700 hover:bg-[#FCF1EC] hover:text-[#C54A22]"
                      :class="cellTriggerClass"
                    />
                  </CalendarCell>
                </CalendarGridRow>
              </CalendarGridBody>
            </CalendarGrid>
          </CalendarRoot>
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>

    <p
      v-if="error"
      class="text-[11px] font-semibold text-red-500 mt-0.5 animate-in fade-in zoom-in duration-200"
    >
      {{ error }}
    </p>
  </div>
</template>
