<script setup lang="ts">
import { computed, useId } from 'vue'
import { HelpCircle } from '@lucide/vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

const props = defineProps<{
  label: string
  type?: string
  placeholder?: string
  modelValue?: string
  required?: boolean
  error?: string
  tooltip?: string
  helpText?: string
  autocomplete?: string
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'remove': []
  'blur': [event: FocusEvent]
}>()

const id = useId()

const ariaDescribedby = computed(() => {
  const ids: string[] = []
  if (props.error) ids.push(`${id}-error`)
  if (props.helpText) ids.push(`${id}-hint`)
  if (props.tooltip) ids.push(`${id}-tooltip`)
  return ids.length > 0 ? ids.join(' ') : undefined
})

const isTel = computed(() => props.type === 'tel' || props.inputmode === 'tel')
const isNumeric = computed(() => props.type === 'number' || props.inputmode === 'numeric')
const isUrl = computed(() => props.type === 'url' || props.inputmode === 'url')
const isEmail = computed(() => props.type === 'email' || props.inputmode === 'email')

const handleKeydown = (event: KeyboardEvent) => {
  if (isTel.value) {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key.length > 1) return // Allow Backspace, Delete, Tab, Arrow keys, Enter, etc.
    // Prevent letters A-Z, a-z from being typed in phone fields
    if (/[a-zA-Z]/.test(event.key)) {
      event.preventDefault()
      return
    }
    // Allow only phone-valid characters: 0-9, +, -, (, ), spaces, ., /, #, *
    if (!/[0-9+\-()\s./#*]/.test(event.key)) {
      event.preventDefault()
    }
  }
  else if (isNumeric.value) {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key.length > 1) return
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault()
    }
  }
  else if (isUrl.value || isEmail.value) {
    if (event.key === ' ') {
      event.preventDefault()
    }
  }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let val = target.value
  if (isTel.value) {
    // Strip any letters that might have entered via paste or IME
    val = val.replace(/[a-zA-Z]/g, '')
    target.value = val
  }
  else if (isNumeric.value) {
    val = val.replace(/\D/g, '')
    target.value = val
  }
  else if (isUrl.value || isEmail.value) {
    val = val.replace(/\s/g, '')
    target.value = val
  }
  emit('update:modelValue', val)
}

const getSelection = (target: HTMLInputElement) => {
  try {
    return {
      start: target.selectionStart ?? target.value.length,
      end: target.selectionEnd ?? target.value.length,
    }
  }
  catch {
    return {
      start: target.value.length,
      end: target.value.length,
    }
  }
}

const setSelection = (target: HTMLInputElement, pos: number) => {
  try {
    target.setSelectionRange(pos, pos)
  }
  catch {
    // Some input types (e.g., type="email", type="number") do not support setSelectionRange
  }
}

const handlePaste = (event: ClipboardEvent) => {
  if (isTel.value) {
    event.preventDefault()
    const text = event.clipboardData?.getData('text') || ''
    const cleaned = text.replace(/[a-zA-Z]/g, '')
    const target = event.target as HTMLInputElement
    const { start, end } = getSelection(target)
    const current = target.value
    const next = current.slice(0, start) + cleaned + current.slice(end)
    target.value = next
    setSelection(target, start + cleaned.length)
    emit('update:modelValue', next)
  }
  else if (isNumeric.value) {
    event.preventDefault()
    const text = event.clipboardData?.getData('text') || ''
    const cleaned = text.replace(/\D/g, '')
    const target = event.target as HTMLInputElement
    const { start, end } = getSelection(target)
    const current = target.value
    const next = current.slice(0, start) + cleaned + current.slice(end)
    target.value = next
    setSelection(target, start + cleaned.length)
    emit('update:modelValue', next)
  }
  else if (isUrl.value || isEmail.value) {
    event.preventDefault()
    const text = event.clipboardData?.getData('text') || ''
    const cleaned = text.replace(/\s/g, '')
    const target = event.target as HTMLInputElement
    const { start, end } = getSelection(target)
    const current = target.value
    const next = current.slice(0, start) + cleaned + current.slice(end)
    target.value = next
    setSelection(target, start + cleaned.length)
    emit('update:modelValue', next)
  }
}
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 min-w-0">
        <label
          :for="id"
          class="text-[13px] font-semibold text-gray-700"
        >
          {{ label }}
          <span
            v-if="required"
            class="text-[#C54A22]"
            aria-hidden="true"
          >*</span>
          <span
            v-if="required"
            class="sr-only"
          >(required)</span>
        </label>

        <!-- Optional Accessible Tooltip -->
        <TooltipProvider
          v-if="tooltip"
          :delay-duration="150"
        >
          <Tooltip>
            <TooltipTrigger as-child>
              <button
                type="button"
                :aria-label="`More info about ${label}`"
                class="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C54A22] transition-colors rounded-full p-0.5 inline-flex items-center justify-center cursor-help shrink-0"
              >
                <HelpCircle
                  class="w-3.5 h-3.5"
                  aria-hidden="true"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent
              :id="`${id}-tooltip`"
              side="top"
              align="start"
              class="max-w-xs text-xs font-normal"
            >
              {{ tooltip }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <button
        v-if="$attrs.onRemove"
        type="button"
        class="text-gray-400 hover:text-[#C54A22] transition-colors p-1 rounded focus:outline-none focus:ring-1 focus:ring-[#C54A22]"
        :aria-label="`Remove ${label} field`"
        title="Remove field"
        @click="$emit('remove')"
      >
        <slot name="remove-icon">
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
        </slot>
      </button>
    </div>
    <div class="relative flex flex-col gap-1.5">
      <input
        :id="id"
        :type="type || 'text'"
        :placeholder="placeholder"
        :value="modelValue"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :enterkeyhint="enterkeyhint || 'next'"
        :aria-required="required ? 'true' : undefined"
        :aria-invalid="Boolean(error)"
        :aria-describedby="ariaDescribedby"
        class="w-full h-12 rounded-xl border px-4 focus-visible:outline-none focus-visible:ring-2 transition-all text-base min-h-12 scroll-mt-15"
        :class="error ? 'border-red-400 focus-visible:ring-red-400/20' : 'border-gray-300 focus-visible:ring-[#C54A22]/20'"
        @keydown="handleKeydown"
        @input="handleInput"
        @paste="handlePaste"
        @blur="$emit('blur', $event)"
      >
      <span
        v-if="error"
        :id="`${id}-error`"
        role="alert"
        aria-live="polite"
        class="text-[11px] font-semibold text-red-500 animate-in fade-in zoom-in duration-200"
      >{{ error }}</span>
      <span
        v-else-if="helpText"
        :id="`${id}-hint`"
        class="text-[11px] text-gray-500"
      >{{ helpText }}</span>
    </div>
  </div>
</template>
