<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label: string
  type?: string
  placeholder?: string
  modelValue?: string
  required?: boolean
  error?: string
  autocomplete?: string
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send'
}>()
defineEmits<{
  'update:modelValue': [value: string]
  'remove': []
}>()
const id = useId()
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <div class="flex items-center justify-between">
      <label
        :for="id"
        class="text-[13px] font-semibold text-gray-700"
      >
        {{ label }} <span
          v-if="required"
          class="text-[#C54A22]"
        >*</span>
      </label>
      <button
        v-if="$attrs.onRemove"
        class="text-gray-400 hover:text-[#C54A22] transition-colors p-1"
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
        class="w-full h-12 rounded-xl border px-4 focus:outline-none focus:ring-2 transition-all text-[16px] min-h-[48px] scroll-mt-[60px]"
        :class="error ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20' : 'border-gray-300 focus:border-[#C54A22] focus:ring-[#C54A22]/20'"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      >
      <span
        v-if="error"
        class="text-[11px] font-semibold text-red-500 animate-in fade-in zoom-in duration-200"
      >{{ error }}</span>
    </div>
  </div>
</template>
