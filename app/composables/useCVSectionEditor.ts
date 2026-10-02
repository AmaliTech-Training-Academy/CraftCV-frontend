import { ref, computed, watch, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'

export const isValidDateString = (dateStr?: string | null): boolean => {
  if (!dateStr || !dateStr.trim()) return false
  if (dateStr.trim().toLowerCase() === 'present') return true
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
  if (!dateString || !dateString.trim()) return null
  const [month, year] = dateString.trim().split(/\s+/)
  if (!month || !year || MONTHS_ORDER[month] === undefined || Number.isNaN(Number(year))) return null
  return new Date(Number(year), MONTHS_ORDER[month], 1)
}

export const isEndDateBeforeStartDate = (startDate?: string | null, endDate?: string | null, isCurrent?: boolean): boolean => {
  if (isCurrent) return false
  if (!startDate || !endDate) return false
  const start = parseMonthYearToDate(startDate)
  const end = parseMonthYearToDate(endDate)
  if (!start || !end) return false
  return end < start
}

export function useCVSectionEditor<T extends { id: string }>(
  items: Ref<T[]>,
  createEmpty: () => T,
  validateItem: (item: T) => boolean,
) {
  const router = useRouter()
  const route = useRoute()
  const isMobile = useMediaQuery('(max-width: 640px)')

  // Determine active ID: on mobile, prefer URL query; on desktop, prefer local state.
  const localActiveId = ref<string | null>(items.value[0]?.id ?? null)

  const activeId = computed({
    get: () => {
      if (isMobile.value && route?.query?.edit) return route.query.edit as string
      return localActiveId.value
    },
    set: (val: string | null) => {
      if (isMobile.value) {
        if (val) {
          // Push query if not already there
          if (route?.query?.edit !== val) router?.push({ query: { edit: val } })
        }
        else {
          // Close sheet: pop history or clear query
          if (route?.query?.edit) {
            if (typeof window !== 'undefined' && window.history?.state?.back) router?.back()
            else router?.replace({ query: {} })
          }
        }
      }
      localActiveId.value = val
    },
  })

  // Watch for external back-button presses on mobile to sync local state
  watch(() => route?.query?.edit, (newEdit) => {
    if (isMobile.value) localActiveId.value = (newEdit as string) || null
  })

  const itemToDeleteId = ref<string | null>(null)
  const showErrors = ref(false)
  const savedEndDates = ref<Record<string, string>>({})

  const handleAddEntry = () => {
    const newItem = createEmpty()
    items.value.push(newItem)
    // Avoid double push in activeId setter by checking if we need to replace instead for completely new unsaved items?
    // Actually, setting activeId will push ?edit=new_id naturally.
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

  const toggleCurrentStatus = (item: T & { endDate: string | null, isCurrent?: boolean }, isCurrent: boolean) => {
    console.log('toggleCurrentStatus called for', item.id, 'with isCurrent=', isCurrent, 'item.endDate=', item.endDate)
    item.isCurrent = isCurrent
    if (isCurrent) {
      if (item.endDate) {
        savedEndDates.value[item.id] = item.endDate
        console.log('saved', item.endDate, 'to savedEndDates for', item.id)
      }
      item.endDate = null
    }
    else {
      console.log('restoring from savedEndDates for', item.id, 'which is', savedEndDates.value[item.id])
      item.endDate = savedEndDates.value[item.id] || ''
    }
    console.log('after toggle, item.endDate=', item.endDate)
  }

  const isValid = computed(() => {
    if (items.value.length === 0) return true
    return items.value.every(validateItem)
  })

  const validateAndProceed = (onSuccess: () => void) => {
    // Silently discard empty or incomplete items when navigating away
    items.value = items.value.filter(item => validateItem(item))
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
