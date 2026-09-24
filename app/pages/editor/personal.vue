<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Check } from '@lucide/vue'
import { useCVState } from '~/composables/useCVState'

definePageMeta({
  layout: 'editor',
})

const { personal } = useCVState()
const router = useRouter()
const showErrors = ref(false)

const isValid = computed(() => {
  return personal.value.firstName.trim() !== ''
    && personal.value.lastName.trim() !== ''
    && personal.value.email.trim() !== ''
})

const handleNext = () => {
  if (!isValid.value) {
    showErrors.value = true
    return
  }
  router.push('/editor/summary')
}

const additionalFields = reactive<Record<string, boolean>>({
  website: false,
  nationality: false,
  dateOfBirth: false,
  passport: false,
  availability: false,
})

const additionalFieldConfigs = [
  { id: 'website', label: 'Website', placeholder: 'e.g. www.portfolio.com' },
  { id: 'nationality', label: 'Nationality', placeholder: 'e.g. American' },
  { id: 'dateOfBirth', label: 'Date of Birth', placeholder: 'e.g. 24/08/1990' },
  { id: 'passport', label: 'Passport / ID', placeholder: 'e.g. AB1234567' },
  { id: 'availability', label: 'Availability', placeholder: 'e.g. Available immediately' },
] as const
</script>

<template>
  <div class="px-16 lg:px-20 py-10 max-w-4xl mx-auto w-full">
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-[32px] font-bold text-gray-900 mb-2 tracking-tight">
        Personal Details
      </h1>
      <p class="text-gray-500 text-[15px]">
        Get started with your basic contact information and professional headline.
      </p>
    </div>

    <div class="flex flex-col gap-8">
      <!-- First & Last Name -->
      <div class="grid grid-cols-2 gap-6">
        <EditorFormField
          v-model="personal.firstName"
          label="First Name"
          placeholder="e.g. Alexandra"
          required
          :error="showErrors && !personal.firstName.trim() ? 'First name is required' : ''"
        />
        <EditorFormField
          v-model="personal.lastName"
          label="Last Name"
          placeholder="e.g. Chen"
          required
          :error="showErrors && !personal.lastName.trim() ? 'Last name is required' : ''"
        />
      </div>

      <!-- Professional Title -->
      <EditorFormField
        v-model="personal.title"
        label="Professional Title"
        placeholder="e.g. Senior Product Designer"
      />

      <!-- Contact Details Section -->
      <div class="flex flex-col gap-6 mt-2">
        <EditorFormField
          v-model="personal.email"
          label="Email Address"
          type="email"
          placeholder="e.g. email@example.com"
          required
          :error="showErrors && !personal.email.trim() ? 'Email address is required' : ''"
        />
        <EditorFormField
          v-model="personal.phone"
          label="Phone Number"
          type="tel"
          placeholder="e.g. +1 (555) 382-9014"
        />
        <EditorFormField
          v-model="personal.location"
          label="Location"
          placeholder="e.g. San Francisco, CA"
        />
      </div>

      <!-- Dynamic Additional Fields -->
      <div
        v-if="additionalFieldConfigs.some(f => additionalFields[f.id])"
        class="flex flex-col gap-6 mt-2"
      >
        <template
          v-for="field in additionalFieldConfigs"
          :key="field.id"
        >
          <div
            v-if="additionalFields[field.id]"
            class="animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <EditorFormField
              v-model="personal[field.id]"
              :label="field.label"
              :placeholder="field.placeholder"
              @remove="additionalFields[field.id] = false"
            />
          </div>
        </template>
      </div>

      <!-- Additional Details Buttons -->
      <div class="mt-4">
        <h3 class="text-[13px] font-medium text-gray-700 mb-3">
          Add details
        </h3>
        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="field in additionalFieldConfigs"
            :key="field.id"
            :class="additionalFields[field.id] ? 'bg-[#FCF1EC] border-[#C54A22] text-[#C54A22]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
            class="px-3 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors"
            @click="additionalFields[field.id] = !additionalFields[field.id]"
          >
            <span
              v-if="!additionalFields[field.id]"
              class="text-[#C54A22] text-lg leading-none"
            >+</span>
            <span
              v-else
              class="text-[#C54A22] text-sm leading-none"
            ><Check class="w-3.5 h-3.5" /></span>
            {{ field.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between pb-12">
      <NuxtLink
        to="/editor/summary"
        class="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2"
      >
        Skip for now
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        /></svg>
      </NuxtLink>
      <button
        class="inline-flex items-center gap-2 px-8 py-3 bg-[#C54A22] hover:bg-[#A83D1B] active:scale-95 cursor-pointer text-white rounded-[10px] text-sm font-bold transition-all shadow-sm"
        @click="handleNext"
      >
        Next
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 12h14m-7-7l7 7-7 7"
        /></svg>
      </button>
    </div>
  </div>
</template>
