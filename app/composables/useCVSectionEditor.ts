import { ref, computed, type Ref } from 'vue'

export const isValidDateString = (dateStr?: string | null): boolean => {
  if (!dateStr || !dateStr.trim()) return false
  if (dateStr.trim() === 'Present') return true
  const parts = dateStr.trim().split(/\s+/)
  return parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1])
}

const MONTHS_ORDER: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
}

const parseMonthYearToDate = (dateString?: string | null): Date | null => {
  if (!dateString || dateString.trim() === 'Present') return null
  const [month, year] = dateString.trim().split(/\s+/)
  if (!month || !year || MONTHS_ORDER[month] === undefined || Number.isNaN(Number(year))) return null
  return new Date(Number(year), MONTHS_ORDER[month], 1)
}

export const isEndDateBeforeStartDate = (startDate?: string | null, endDate?: string | null): boolean => {
  if (!startDate || !endDate || endDate.trim() === 'Present') return false
  const start = parseMonthYearToDate(startDate)
  const end = parseMonthYearToDate(endDate)
  if (!start || !end) return false
  return end < start
}

export function useCVSectionEditor<T extends { id: string }>(
  items: Ref<T[]>,
  createEmpty: () => T,
  validateItem: (item: T) => boolean,
  isUntouched: (item: T) => boolean,
) {
  const activeId = ref<string | null>(items.value[0]?.id ?? null)
  const itemToDeleteId = ref<string | null>(null)
  const showErrors = ref(false)
  const savedEndDates = ref<Record<string, string>>({})

  const handleAddEntry = () => {
    const newItem = createEmpty()
    items.value.push(newItem)
    activeId.value = newItem.id
    showErrors.value = false
  }

  const promptDelete = (id: string) => {
    itemToDeleteId.value = id
  }

  const confirmDelete = () => {
    if (!itemToDeleteId.value) return
    const id = itemToDeleteId.value
    const idx = items.value.findIndex(item => item.id === id)
    if (idx !== -1) {
      items.value.splice(idx, 1)
      const { [id]: _removed, ...rest } = savedEndDates.value
      savedEndDates.value = rest
    }
    if (activeId.value === id) {
      activeId.value = items.value.length > 0 ? (items.value[Math.max(0, idx - 1)]?.id ?? null) : null
    }
    itemToDeleteId.value = null
  }

  const toggleCurrentStatus = (item: T & { endDate: string }, isCurrent: boolean) => {
    if (isCurrent) {
      if (item.endDate && item.endDate !== 'Present') {
        savedEndDates.value[item.id] = item.endDate
      }
      item.endDate = 'Present'
    }
    else {
      item.endDate = savedEndDates.value[item.id] || ''
    }
  }

  const isValid = computed(() => {
    if (items.value.length === 0) return true
    return items.value.every(validateItem)
  })

  const validateAndProceed = (onSuccess: () => void) => {
    items.value = items.value.filter(item => !isUntouched(item))

    if (!isValid.value) {
      showErrors.value = true
      const firstInvalid = items.value.find(item => !validateItem(item))
      if (firstInvalid) {
        activeId.value = firstInvalid.id
      }
      return
    }

    onSuccess()
  }

  return {
    activeId,
    itemToDeleteId,
    showErrors,
    handleAddEntry,
    promptDelete,
    confirmDelete,
    toggleCurrentStatus,
    isValid,
    validateAndProceed,
  }
}
