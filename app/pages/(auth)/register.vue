<template>
  <div class="w-full max-w-[400px] mx-auto">
    <div class="mb-4 lg:mb-6 text-center md:text-left">
      <h1 class="font-display font-bold text-3xl sm:text-4xl text-stone-900 leading-tight mb-2">
        Create your <span class="text-[#EA580C]">account.</span>
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
      >
        {{ serverError }}
      </div>

      <div
        v-if="successMessage"
        class="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700"
      >
        {{ successMessage }}
      </div>

      <div class="space-y-1.5">
        <label
          for="email"
          class="block text-sm font-medium text-stone-800"
        >Email address</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :class="[
            'w-full h-11 rounded-lg border bg-white px-3.5 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
            fieldError('email')
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-stone-200 focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20',
          ]"
          @blur="touch('email')"
        >
        <p
          v-if="fieldError('email')"
          class="text-xs text-red-500"
        >
          {{ fieldError('email') }}
        </p>
      </div>

      <div class="space-y-1.5">
        <label
          for="password"
          class="block text-sm font-medium text-stone-800"
        >Password</label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Create a password"
            :class="[
              'w-full h-11 rounded-lg border bg-white pl-3.5 pr-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
              fieldError('password')
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-stone-200 focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20',
            ]"
            @blur="touch('password')"
          >
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
        <p
          v-if="fieldError('password')"
          class="text-xs text-red-500"
        >
          {{ fieldError('password') }}
        </p>
      </div>

      <div class="space-y-1.5">
        <label
          for="confirmPassword"
          class="block text-sm font-medium text-stone-800"
        >Confirm password</label>
        <div class="relative">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Create a password"
            :class="[
              'w-full h-11 rounded-lg border bg-white pl-3.5 pr-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
              fieldError('confirmPassword')
                ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border-stone-200 focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/20',
            ]"
            @blur="touch('confirmPassword')"
          >
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
          v-if="fieldError('confirmPassword')"
          class="text-xs text-red-500"
        >
          {{ fieldError('confirmPassword') }}
        </p>
      </div>

      <div class="pt-1">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            id="agreeTerms"
            v-model="form.agreeTerms"
            type="checkbox"
            class="w-4 h-4 rounded border-stone-300 accent-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 cursor-pointer"
            @change="touch('agreeTerms')"
          >
          <span class="text-xs sm:text-sm text-stone-600 leading-snug">
            I agree to the
            <span class="text-brand-600 font-medium hover:underline cursor-pointer">Terms</span>
            &amp;
            <span class="text-brand-600 font-medium hover:underline cursor-pointer">Privacy Policy</span>
          </span>
        </label>
      </div>

      <div class="pt-1">
        <Button
          type="submit"
          :disabled="isSubmitDisabled"
          class="w-full h-11 lg:h-12 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
          :class="isSubmitDisabled ? 'bg-[#EA580C]/50 text-white cursor-not-allowed hover:bg-[#EA580C]/50' : 'bg-[#EA580C] text-white hover:bg-[#c2410c] cursor-pointer shadow-sm'"
        >
          <svg
            v-if="loading"
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
          <span class="text-white font-medium">{{ loading ? 'Creating account…' : 'Create account' }}</span>
        </Button>
      </div>
    </form>

    <p class="mt-4 lg:mt-6 text-center text-sm text-stone-600">
      Already have an account?
      <NuxtLink
        to="/login"
        class="text-[#EA580C] hover:text-[#c2410c] font-medium transition"
      >
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'

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

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
})

const touched = reactive({
  email: false,
  password: false,
  confirmPassword: false,
  agreeTerms: false,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const serverError = ref('')
const successMessage = ref('')

type Field = 'email' | 'password' | 'confirmPassword' | 'agreeTerms'

function touch(field: Field) {
  touched[field] = true
}

function fieldError(field: 'email' | 'password' | 'confirmPassword') {
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
  }
  if (field === 'confirmPassword') {
    if (!form.confirmPassword) return 'Please confirm your password.'
    if (form.confirmPassword !== form.password) return 'Passwords do not match.'
  }
  return ''
}

const isFormValid = computed(() => {
  const isEmailValid = Boolean(form.email.trim()) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  const isPasswordValid = Boolean(form.password) && form.password.length >= 8
  const isConfirmValid = Boolean(form.confirmPassword) && form.confirmPassword === form.password
  return Boolean(isEmailValid && isPasswordValid && isConfirmValid && form.agreeTerms)
})

const isSubmitDisabled = computed(() => loading.value || !isFormValid.value)

async function handleSubmit() {
  if (loading.value) return

  touch('email')
  touch('password')
  touch('confirmPassword')
  touch('agreeTerms')

  if (!isFormValid.value) return

  loading.value = true
  serverError.value = ''
  successMessage.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 600))
    router.push('/dashboard')
  }
  catch {
    serverError.value = 'Failed to create account. Please try again.'
  }
  finally {
    loading.value = false
  }
}
</script>
