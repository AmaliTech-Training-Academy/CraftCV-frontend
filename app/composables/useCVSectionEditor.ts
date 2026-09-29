import { ref, computed, type Ref } from 'vue'

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
