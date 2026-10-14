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

const { personal, saveErrorFor, sectionError } = useCVState()

const router = useRouter()
const showErrors = ref(false)

/**
 * A rejected save names the fields it rejected; the editor shows each message
 * beside the input that caused it instead of in the header badge, where all it
 * could say was DRF's summary: "Invalid CV data." These belong to the
 * personal-details record, so `saveErrorFor` scopes them to it.
 */
const backendError = (key: string) => saveErrorFor('personal', key)

const isValidEmail = (email: string) => {
  const trimmed = email.trim()
  if (!trimmed) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 7 && !/[a-zA-Z]/.test(phone)
}

const emailTouched = ref(false)
const phoneTouched = ref(false)

const emailError = computed(() => {
  if (backendError('email')) return backendError('email')
  if (!showErrors.value && !emailTouched.value) return ''
  if (!personal.value.email.trim()) {
    return showErrors.value ? 'Email address is required' : ''
  }
  if (!isValidEmail(personal.value.email)) return 'Please enter a valid email address'
  return ''
})

const phoneError = computed(() => {
  if (backendError('phone')) return backendError('phone')
  if (!showErrors.value && !phoneTouched.value) return ''
  if (!personal.value.phone.trim()) {
    return showErrors.value ? 'Phone number is required' : ''
  }
  if (!isValidPhone(personal.value.phone)) return 'Please enter a valid phone number (at least 7 digits)'
  return ''
})

// Phone and location are required by the backend, not optional extras: it
// rejects either one blank with "This field may not be blank", so a save cannot
// succeed without them and Next should not wave them through.
const isValid = computed(() => {
  return personal.value.firstName.trim() !== ''
    && personal.value.lastName.trim() !== ''
    && personal.value.email.trim() !== ''
    && isValidEmail(personal.value.email)
    && personal.value.phone.trim() !== ''
    && isValidPhone(personal.value.phone)
    && personal.value.location.trim() !== ''
})

const handleNext = () => {
  if (!isValid.value) {
    showErrors.value = true
    sectionError.value = 'Please complete all required fields before proceeding to the next section.'
    return
  }
  sectionError.value = null
  showErrors.value = false
  router.push('/editor/summary')
}

const handleSkip = () => {
  sectionError.value = null
  showErrors.value = false
  router.push('/editor/summary')
}

type AdditionalFieldKey = 'website' | 'linkedin' | 'github' | 'twitter'

const additionalFields = reactive<Record<AdditionalFieldKey, boolean>>({
  website: false,
  linkedin: false,
  github: false,
  twitter: false,
})

const toggleAdditionalField = (fieldId: AdditionalFieldKey) => {
  additionalFields[fieldId] = !additionalFields[fieldId]
  if (!additionalFields[fieldId]) {
    // Clear the data when the field is hidden so it doesn't show in preview
    personal.value[fieldId] = ''
  }
}

// Initialize toggles if data was loaded from backend
watchEffect(() => {
  if (personal.value.website) additionalFields.website = true
  if (personal.value.linkedin) additionalFields.linkedin = true
  if (personal.value.github) additionalFields.github = true
  if (personal.value.twitter) additionalFields.twitter = true
})

const additionalFieldConfigs: Array<{
  id: AdditionalFieldKey
  label: string
  placeholder: string
  tooltip: string
  kind: 'text'
}> = [
  { id: 'website', label: 'Website', placeholder: 'e.g. www.portfolio.com', tooltip: 'Your personal website, blog, or online portfolio link', kind: 'text' },
  { id: 'linkedin', label: 'LinkedIn', placeholder: 'e.g. linkedin.com/in/username', tooltip: 'Your public LinkedIn profile URL', kind: 'text' },
  { id: 'github', label: 'GitHub', placeholder: 'e.g. github.com/username', tooltip: 'Your GitHub account or code repository link', kind: 'text' },
  { id: 'twitter', label: 'Twitter / X', placeholder: 'e.g. twitter.com/username', tooltip: 'Your professional Twitter or X profile URL', kind: 'text' },
]
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
          tooltip="Your legal or preferred first name as it should appear to hiring managers."
          :error="backendError('firstName') || (showErrors && !personal.firstName.trim() ? 'First name is required' : '')"
        />
        <EditorFormField
          v-model="personal.lastName"
          label="Last Name"
          placeholder="e.g. Chen"
          autocomplete="family-name"
          required
          tooltip="Your legal or preferred family name / surname."
          :error="backendError('lastName') || (showErrors && !personal.lastName.trim() ? 'Last name is required' : '')"
        />
      </div>

      <!-- Professional Title -->
      <EditorFormField
        v-model="personal.title"
        label="Professional Title"
        placeholder="e.g. Senior Product Designer"
        autocomplete="organization-title"
        tooltip="A concise headline targeting your role, e.g. 'Senior Frontend Engineer' or 'UX Designer'."
        :error="saveErrorFor('cv', 'professionalTitle')"
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
          tooltip="Your primary professional email address for recruiter contact."
          :error="emailError"
          @blur="emailTouched = true"
        />
        <EditorFormField
          v-model="personal.phone"
          label="Phone Number"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="e.g. +1 (555) 382-9014"
          required
          tooltip="Include your international country code (e.g. +1 for US, +44 for UK, +233 for Ghana)."
          :error="phoneError"
          @blur="phoneTouched = true"
        />
        <EditorFormField
          v-model="personal.location"
          label="Location"
          autocomplete="address-level2"
          placeholder="e.g. San Francisco, CA"
          required
          tooltip="City and state/country or 'Remote' (e.g. 'San Francisco, CA' or 'London, UK')."
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
            <EditorFormField
              v-model="personal[field.id]"
              :label="field.label"
              type="url"
              inputmode="url"
              :placeholder="field.placeholder"
              :tooltip="field.tooltip"
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
            type="button"
            :aria-pressed="additionalFields[field.id]"
            :aria-label="additionalFields[field.id] ? `Remove ${field.label} field` : `Add ${field.label} field`"
            :class="additionalFields[field.id] ? 'bg-[#FCF1EC] border-[#C54A22] text-[#C54A22]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
            class="px-3 py-1.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#C54A22]/30 cursor-pointer"
            @click="toggleAdditionalField(field.id)"
          >
            <span
              v-if="!additionalFields[field.id]"
              class="text-[#C54A22] text-lg leading-none"
              aria-hidden="true"
            >+</span>
            <span
              v-else
              class="text-[#C54A22] text-sm leading-none"
              aria-hidden="true"
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
        class="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
        @click="handleSkip"
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
