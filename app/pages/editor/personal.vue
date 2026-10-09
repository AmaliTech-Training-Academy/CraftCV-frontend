<script setup lang="ts">
import { reactive, computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { Check } from '@lucide/vue'
import { useCVState } from '~/composables/useCVState'

useHead({ title: 'Personal Details' })

definePageMeta({
  layout: 'editor',
  middleware: ['auth'],
})

const { personal, saveErrorFor } = useCVState()

const router = useRouter()
const showErrors = ref(false)

/**
 * A rejected save names the fields it rejected; the editor shows each message
 * beside the input that caused it instead of in the header badge, where all it
 * could say was DRF's summary: "Invalid CV data." These belong to the
 * personal-details record, so `saveErrorFor` scopes them to it.
 */
const backendError = (key: string) => saveErrorFor('personal', key)

// Phone and location are required by the backend, not optional extras: it
// rejects either one blank with "This field may not be blank", so a save cannot
// succeed without them and Next should not wave them through.
const isValid = computed(() => {
  return personal.value.firstName.trim() !== ''
    && personal.value.lastName.trim() !== ''
    && personal.value.email.trim() !== ''
    && personal.value.phone.trim() !== ''
    && personal.value.location.trim() !== ''
})

const handleNext = () => {
  if (!isValid.value) {
    showErrors.value = true
    return
  }
  router.push('/editor/summary')
}

const toggleAdditionalField = (fieldId: string) => {
  additionalFields[fieldId] = !additionalFields[fieldId]
  if (!additionalFields[fieldId]) {
    // Clear the data when the field is hidden so it doesn't show in preview
    personal.value[fieldId as keyof typeof personal.value] = ''
  }
}

const additionalFields = reactive<Record<string, boolean>>({
  websiteUrl: false,
  linkedinUrl: false,
  githubUrl: false,
  twitterUrl: false,
})

// Initialize toggles if data was loaded from backend
watchEffect(() => {
  if (personal.value.websiteUrl || personal.value.website) additionalFields.websiteUrl = true
  if (personal.value.linkedinUrl) additionalFields.linkedinUrl = true
  if (personal.value.githubUrl) additionalFields.githubUrl = true
  if (personal.value.twitterUrl) additionalFields.twitterUrl = true
})

const additionalFieldConfigs = [
  { id: 'websiteUrl', label: 'Website', placeholder: 'e.g. www.portfolio.com', kind: 'text' },
  { id: 'linkedinUrl', label: 'LinkedIn', placeholder: 'e.g. linkedin.com/in/username', kind: 'text' },
  { id: 'githubUrl', label: 'GitHub', placeholder: 'e.g. github.com/username', kind: 'text' },
  { id: 'twitterUrl', label: 'Twitter / X', placeholder: 'e.g. twitter.com/username', kind: 'text' },
] as const
</script>

<template>
  <div class="px-4 sm:px-8 lg:px-20 py-10 max-w-4xl mx-auto w-full">
    <!-- Header -->
    <EditorSectionHeader
      title="Personal Details"
      description="Get started with your basic contact information and professional headline."
      back-link="/dashboard"
      back-text="Back to Resumes"
    />

    <div class="flex flex-col gap-8">
      <!-- First & Last Name -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <EditorFormField
          v-model="personal.firstName"

          label="First Name"
          placeholder="e.g. Alexandra"
          autocomplete="given-name"
          required
          :error="backendError('firstName') || (showErrors && !personal.firstName.trim() ? 'First name is required' : '')"
        />
        <EditorFormField
          v-model="personal.lastName"

          label="Last Name"
          placeholder="e.g. Chen"
          autocomplete="family-name"
          required
          :error="backendError('lastName') || (showErrors && !personal.lastName.trim() ? 'Last name is required' : '')"
        />
      </div>

      <!-- Professional Title -->
      <EditorFormField
        v-model="personal.title"

        label="Professional Title"
        placeholder="e.g. Senior Product Designer"
        autocomplete="organization-title"
      />

      <!-- Contact Details Section -->
      <div class="flex flex-col gap-6 mt-2">
        <EditorFormField
          v-model="personal.email"

          label="Email Address"
          type="email"
          inputmode="email"
          autocomplete="email"
          placeholder="e.g. email@example.com"
          required
          :error="backendError('email') || (showErrors && !personal.email.trim() ? 'Email address is required' : '')"
        />
        <EditorFormField
          v-model="personal.phone"

          label="Phone Number"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="e.g. +1 (555) 382-9014"
          required
          :error="backendError('phone') || (showErrors && !personal.phone.trim() ? 'Phone number is required' : '')"
        />
        <EditorFormField
          v-model="personal.location"

          label="Location"
          autocomplete="address-level2"
          placeholder="e.g. San Francisco, CA"
          required
          :error="backendError('location') || (showErrors && !personal.location.trim() ? 'Location is required' : '')"
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
            <EditorMonthYearPicker
              v-if="field.kind === 'date'"
              v-model="personal[field.id]"
              mode="day"
              removable
              :label="field.label"
              :placeholder="field.placeholder"
              @remove="toggleAdditionalField(field.id)"
            />
            <EditorFormField
              v-else
              v-model="personal[field.id]"

              :label="field.label"
              :placeholder="field.placeholder"
              :error="backendError(field.id)"
              @remove="toggleAdditionalField(field.id)"
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
            @click="toggleAdditionalField(field.id)"
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
