<template>
  <div class="w-full max-w-100 mx-auto">
    <div class="mb-4 lg:mb-6 text-center md:text-left">
      <h1 class="font-display font-bold text-3xl sm:text-4xl text-stone-900 leading-tight mb-2">
        Create your <span class="text-brand-600">account.</span>
      </h1>
      <p class="text-stone-500 text-sm">
        Build a CV that opens doors. It takes less than 5 minutes.
      </p>
    </div>

    <form
      class="space-y-3.5 lg:space-y-4"
      novalidate
      @submit.prevent="handleSubmit"
    >
      <div
        v-if="serverError"
        class="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600"
        role="alert"
      >
        {{ serverError }}
      </div>

      <div
        v-if="successMessage"
        class="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700"
        role="status"
      >
        {{ successMessage }}
      </div>

      <div class="space-y-1.5">
        <Label
          for="email"
          class="block text-stone-800"
        >Email address</Label>
        <Input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :aria-invalid="Boolean(fieldError('email'))"
          :aria-describedby="fieldError('email') ? 'email-error' : undefined"
          :class="[
            'h-11',
            fieldError('email')
              ? 'border-destructive focus-visible:ring-destructive'
              : 'focus-visible:ring-[#EA580C]',
          ]"
          @blur="touch('email')"
        />
        <p
          v-if="fieldError('email')"
          id="email-error"
          class="text-xs text-destructive"
        >
          {{ fieldError('email') }}
        </p>
      </div>

      <div class="space-y-1.5">
        <Label
          for="password"
          class="block text-stone-800"
        >Password</Label>
        <div class="relative">
          <Input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Create a password"
            :aria-invalid="Boolean(!isPasswordFocused && fieldError('password'))"
            :aria-describedby="!isPasswordFocused && fieldError('password') ? 'password-error' : form.password.length > 0 ? 'password-guidance' : undefined"
            :class="[
              'h-11 pr-11',
              !isPasswordFocused && fieldError('password')
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[#EA580C]',
            ]"
            @focus="isPasswordFocused = true"
            @input="isPasswordFocused = true"
            @blur="handlePasswordBlur"
          />
          <button
            type="button"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <svg
              v-if="!showPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle
                cx="12"
                cy="12"
                r="3"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line
                x1="2"
                x2="22"
                y1="2"
                y2="22"
              />
            </svg>
          </button>
        </div>
        <!-- Either Error Message (when blurred/another field engaged) OR Dynamic Guidance (when focused/typing) -->
        <p
          v-if="!isPasswordFocused && fieldError('password')"
          id="password-error"
          class="text-xs text-destructive"
        >
          {{ fieldError('password') }}
        </p>

        <!-- Inline Guidance (Standard text, zero layout expansion) -->
        <p
          v-else-if="form.password.length > 0"
          id="password-guidance"
          class="mt-1 text-xs text-stone-500 transition-colors"
        >
          {{ passwordGuidance }}
        </p>
      </div>

      <div class="space-y-1.5">
        <Label
          for="confirmPassword"
          class="block text-stone-800"
        >Confirm password</Label>
        <div class="relative">
          <Input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Create a password"
            :aria-invalid="Boolean(fieldError('confirmPassword') || confirmMismatch)"
            :aria-describedby="fieldError('confirmPassword') || confirmMismatch ? 'confirm-password-error' : undefined"
            :class="[
              'h-11 pr-11',
              fieldError('confirmPassword') || confirmMismatch
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[#EA580C]',
            ]"
            @blur="touch('confirmPassword')"
          />
          <button
            type="button"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
            :aria-label="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <svg
              v-if="!showConfirmPassword"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle
                cx="12"
                cy="12"
                r="3"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line
                x1="2"
                x2="22"
                y1="2"
                y2="22"
              />
            </svg>
          </button>
        </div>
        <p
          v-if="fieldError('confirmPassword') || confirmMismatch"
          id="confirm-password-error"
          class="text-xs text-destructive"
        >
          {{ fieldError('confirmPassword') || (confirmMismatch ? 'Passwords do not match.' : '') }}
        </p>
      </div>

      <div class="pt-1">
        <div class="flex items-center gap-1.5 text-xs sm:text-sm text-stone-600 leading-snug">
          <Checkbox
            id="agreeTerms"
            v-model="form.agreeTerms"
            class="cursor-pointer"
          />
          <Label
            for="agreeTerms"
            class="select-none font-normal cursor-pointer text-xs sm:text-sm text-stone-600 leading-snug"
          >
            I agree to the
          </Label>
          <NuxtLink
            to="/terms"
            target="_blank"
            class="text-[#EA580C] font-medium underline hover:text-[#c2410c] transition cursor-pointer"
          >Terms and Privacy Policy</NuxtLink>
        </div>
        <p
          v-if="fieldError('agreeTerms')"
          class="text-xs text-destructive mt-1"
        >
          {{ fieldError('agreeTerms') }}
        </p>
      </div>

      <div class="pt-1">
        <Button
          type="submit"
          :disabled="!isFormValid || loading || isRedirecting"
          :class="[
            'w-full h-11 lg:h-12 bg-brand-600 text-white hover:bg-brand-700 font-medium transition-colors cursor-pointer',
            !isFormValid && !loading && !isRedirecting ? 'opacity-50 hover:bg-brand-600 cursor-not-allowed' : '',
          ]"
        >
          <svg
            v-if="loading || isRedirecting"
            class="animate-spin w-4 h-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          <span class="font-medium ml-2">{{ loading || isRedirecting ? 'Creating account…' : 'Create account' }}</span>
        </Button>
      </div>
    </form>

    <p class="mt-4 lg:mt-6 text-center text-sm text-stone-600">
      Already have an account?
      <NuxtLink
        to="/login"
        class="text-brand-600 hover:text-brand-700 font-medium transition cursor-pointer"
      >
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useSessionStorage } from '@vueuse/core'

useHead({
  title: 'Create your account — CraftCV',
  meta: [
    {
      name: 'description',
      content: 'Create a CraftCV account to start building your CV.',
    },
  ],
})

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const queryEmail = typeof route.query.email === 'string' ? route.query.email : ''
const savedEmail = useSessionStorage('craftcv-register-email', '')

const form = reactive({
  email: queryEmail || savedEmail.value,
  password: '',
  confirmPassword: '',
  agreeTerms: false,
})

watch(() => form.email, (newVal) => {
  savedEmail.value = newVal
})

const touched = reactive({
  email: false,
  password: false,
  confirmPassword: false,
  agreeTerms: false,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isRedirecting = ref(false)
const { register, loading, error: authError, isAuthenticated } = useAuth()
const serverError = ref('')
const successMessage = ref('')

type Field = 'email' | 'password' | 'confirmPassword' | 'agreeTerms'

function touch(field: Field) {
  touched[field] = true
}

const isPasswordFocused = ref(false)

function handlePasswordBlur() {
  isPasswordFocused.value = false
  touch('password')
}

const passwordCriteria = computed(() => {
  const pw = form.password || ''
  const commonPatterns = /(123|abc|qwerty|password|letmein|admin|iloveyou|welcome)/i

  return [
    { key: 'length', hint: 'at least 8 characters', passed: pw.length >= 8 },
    { key: 'uppercase', hint: 'an uppercase letter', passed: /[A-Z]/.test(pw) },
    { key: 'lowercase', hint: 'a lowercase letter', passed: /[a-z]/.test(pw) },
    { key: 'number', hint: 'a number', passed: /[0-9]/.test(pw) },
    { key: 'special', hint: 'a special symbol', passed: /[^A-Za-z0-9]/.test(pw) },
    {
      key: 'unpredictable',
      hint: 'avoid common sequences',
      passed: pw.length > 0 && !commonPatterns.test(pw) && !/^(.+?)\1+$/.test(pw),
    },
  ]
})

// Returns true only when all 6 rules pass
const isPasswordValid = computed(() => {
  return passwordCriteria.value.every(rule => rule.passed)
})

// Dynamic inline suggestion text
const passwordGuidance = computed(() => {
  if (!form.password) return ''

  const missing = passwordCriteria.value.filter(c => !c.passed)

  if (missing.length === 0) {
    return 'Password is strong.'
  }

  // If password is just started (e.g. 1-2 characters), show general tip
  if (form.password.length < 3) {
    return 'Tip: A strong password includes 8+ characters, uppercase, lowercase, numbers, and symbols.'
  }

  // Specifically tell the user what to add to make it strong
  const missingHints = missing.map(m => m.hint)
  return `To make it stronger, add: ${missingHints.join(', ')}.`
})

const isEmailValid = computed(() => {
  return Boolean(form.email.trim()) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
})

const isConfirmValid = computed(() => {
  return Boolean(form.confirmPassword) && form.confirmPassword === form.password
})

const confirmMismatch = computed(() => {
  return form.confirmPassword.length > 0 && form.password !== form.confirmPassword
})

function fieldError(field: Field) {
  if (!touched[field]) return ''
  if (field === 'email') {
    if (!form.email.trim()) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Please enter a valid email address.'
    }
  }
  if (field === 'password') {
    if (!form.password) return 'Password is required.'
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (!isPasswordValid.value) {
      const missing = passwordCriteria.value.filter(c => !c.passed)
      return `To make it stronger, add: ${missing.map(m => m.hint).join(', ')}.`
    }
  }
  if (field === 'confirmPassword') {
    if (!form.confirmPassword) return 'Please confirm your password.'
    if (form.confirmPassword !== form.password) return 'Passwords do not match.'
  }
  if (field === 'agreeTerms') {
    if (!form.agreeTerms) return 'You must agree to the terms to continue.'
  }
  return ''
}

const isFormValid = computed(() => {
  return Boolean(isEmailValid.value && isPasswordValid.value && isConfirmValid.value && form.agreeTerms)
})

async function handleSubmit() {
  if (loading.value || isRedirecting.value) return

  isPasswordFocused.value = false
  touch('email')
  touch('password')
  touch('confirmPassword')
  touch('agreeTerms')

  if (!form.password) return

  if (!isPasswordValid.value) {
    serverError.value = 'Password must meet all 6 security requirements.'
    return
  }

  if (form.password !== form.confirmPassword) {
    serverError.value = 'Passwords do not match.'
    return
  }

  if (!isFormValid.value) return

  serverError.value = ''
  successMessage.value = ''
  let isSuccess = false

  try {
    await register(
      {
        email: form.email.trim(),
        password: form.password,
        agreeToTerms: form.agreeTerms,
      },
      { autoNavigate: false },
    )

    const isAuthed = isAuthenticated.value

    isSuccess = true
    successMessage.value = isAuthed
      ? 'Account created successfully! Redirecting...'
      : 'Account created! Please verify your email to continue.'
    isRedirecting.value = true
  }
  catch {
    isRedirecting.value = false
    serverError.value = authError.value || 'Failed to create account. Please try again.'
  }

  if (isSuccess) {
    await new Promise(resolve => setTimeout(resolve, 600))
    await navigateTo({
      path: '/verify-email',
      query: { email: form.email.trim() },
    })
  }
}
</script>
