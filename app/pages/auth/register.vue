<template>
  <div>
    <div class="mb-6 text-center md:text-left">
      <h1
        class="font-display text-4xl font-semibold text-stone-900 leading-tight mb-2"
      >
        Create your account.
      </h1>
      <p class="text-stone-600 text-sm">
        Build a CV that opens doors. It takes less than 5 minutes.
      </p>
    </div>

    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-stone-500">Step {{ currentStep }} of 3</span>
        <span class="text-xs font-medium text-stone-500">{{
          stepLabels[currentStep - 1]
        }}</span>
      </div>
      <div class="flex gap-1.5">
        <div
          v-for="step in 3"
          :key="step"
          class="h-1.5 flex-1 rounded-full transition-colors"
          :class="currentStep >= step ? 'bg-brand-600' : 'bg-stone-200'"
        />
      </div>
    </div>

    <form
      novalidate
      @submit.prevent="onFormSubmit"
    >
      <Transition
        name="step"
        mode="out-in"
      >
        <div
          v-if="currentStep === 1"
          key="step-1"
          class="space-y-5"
        >
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label
                for="firstName"
                class="block text-sm font-medium text-stone-800"
              >First name</label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                autocomplete="given-name"
                placeholder="Jane"
                :class="[
                  'w-full rounded-[10px] border bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
                  fieldError('firstName')
                    ? 'border-error focus:ring-2 focus:ring-error/30'
                    : 'border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
                ]"
                @blur="touch('firstName')"
              >
              <p
                v-if="fieldError('firstName')"
                class="text-xs text-error"
              >
                {{ fieldError("firstName") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label
                for="lastName"
                class="block text-sm font-medium text-stone-800"
              >Last name</label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                autocomplete="family-name"
                placeholder="Doe"
                :class="[
                  'w-full rounded-[10px] border bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
                  fieldError('lastName')
                    ? 'border-error focus:ring-2 focus:ring-error/30'
                    : 'border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
                ]"
                @blur="touch('lastName')"
              >
              <p
                v-if="fieldError('lastName')"
                class="text-xs text-error"
              >
                {{ fieldError("lastName") }}
              </p>
            </div>
          </div>

          <div class="space-y-1.5">
            <label
              for="otherName"
              class="block text-sm font-medium text-stone-800"
            >Other names
              <span class="font-normal text-stone-400">(optional)</span></label>
            <input
              id="otherName"
              v-model="form.otherName"
              type="text"
              autocomplete="additional-name"
              placeholder="Middle or other names"
              class="w-full rounded-[10px] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
            >
          </div>

          <Button
            type="submit"
            class="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-[10px] py-3"
          >
            Continue
          </Button>
        </div>

        <div
          v-else-if="currentStep === 2"
          key="step-2"
          class="space-y-5"
        >
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
                'w-full rounded-[10px] border bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
                fieldError('email')
                  ? 'border-error focus:ring-2 focus:ring-error/30'
                  : 'border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
              ]"
              @blur="touch('email')"
            >
            <p
              v-if="fieldError('email')"
              class="text-xs text-error"
            >
              {{ fieldError("email") }}
            </p>
          </div>

          <div class="flex gap-3">
            <Button
              type="button"
              variant="outline"
              class="w-1/3 rounded-[10px] py-3 border-stone-200 text-stone-700 hover:bg-stone-50"
              @click="goBack"
            >
              Back
            </Button>
            <Button
              type="submit"
              class="flex-1 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-[10px] py-3"
            >
              Continue
            </Button>
          </div>
        </div>

        <div
          v-else
          key="step-3"
          class="space-y-5"
        >
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
                placeholder="••••••••"
                :class="[
                  'w-full rounded-[10px] border bg-white px-4 py-3 pr-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
                  fieldError('password')
                    ? 'border-error focus:ring-2 focus:ring-error/30'
                    : 'border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
                ]"
                @blur="touch('password')"
              >
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
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
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
                  />
                  <path
                    d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
                  />
                  <line
                    x1="1"
                    y1="1"
                    x2="23"
                    y2="23"
                  />
                </svg>
              </button>
            </div>
            <p
              v-if="fieldError('password')"
              class="text-xs text-error"
            >
              {{ fieldError("password") }}
            </p>
            <p
              v-else-if="form.password && form.password.length < 8"
              class="text-xs text-stone-500"
            >
              Must be at least 8 characters.
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
                placeholder="••••••••"
                :class="[
                  'w-full rounded-[10px] border bg-white px-4 py-3 pr-11 text-sm text-stone-900 placeholder-stone-400 outline-none transition',
                  fieldError('confirmPassword')
                    ? 'border-error focus:ring-2 focus:ring-error/30'
                    : 'border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
                ]"
                @blur="touch('confirmPassword')"
              >
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                :aria-label="
                  showConfirmPassword ? 'Hide password' : 'Show password'
                "
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg
                  v-if="!showConfirmPassword"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
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
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
                  />
                  <path
                    d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"
                  />
                  <line
                    x1="1"
                    y1="1"
                    x2="23"
                    y2="23"
                  />
                </svg>
              </button>
            </div>
            <p
              v-if="fieldError('confirmPassword')"
              class="text-xs text-error"
            >
              {{ fieldError("confirmPassword") }}
            </p>
          </div>

          <div
            v-if="successMessage"
            class="flex items-center gap-2 rounded-[10px] bg-success-tint border border-success/20 px-4 py-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              stroke="#7a9471"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
              class="flex-shrink-0"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <p class="text-sm text-success">
              {{ successMessage }}
            </p>
          </div>

          <div
            v-if="serverError"
            class="flex items-center gap-2 rounded-[10px] bg-error-tint border border-error/20 px-4 py-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              stroke="#c9564a"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
              class="flex-shrink-0"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
              />
              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
              />
              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
              />
            </svg>
            <p class="text-sm text-error">
              {{ serverError }}
            </p>
          </div>

          <div class="flex gap-3">
            <Button
              type="button"
              variant="outline"
              :disabled="loading"
              class="w-1/3 rounded-[10px] py-3 border-stone-200 text-stone-700 hover:bg-stone-50"
              @click="goBack"
            >
              Back
            </Button>
            <Button
              id="register-submit-btn"
              type="submit"
              :disabled="loading"
              class="flex-1 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-[10px] py-3"
            >
              <svg
                v-if="loading"
                class="animate-spin w-4 h-4"
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
              <span>{{
                loading ? "Creating account…" : "Create account"
              }}</span>
            </Button>
          </div>
        </div>
      </Transition>
    </form>

    <p class="mt-8 text-center text-sm text-stone-600">
      Already have an account?
      <NuxtLink
        to="/login"
        class="text-brand-600 hover:text-brand-700 font-medium transition"
      >Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Create your account — CraftCV',
  meta: [
    {
      name: 'description',
      content: 'Create a CraftCV account to start building your CV.',
    },
  ],
})

definePageMeta({ layout: 'auth' })

const router = useRouter()

const form = reactive({
  firstName: '',
  lastName: '',
  otherName: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const touched = reactive({
  firstName: false,
  lastName: false,
  email: false,
  password: false,
  confirmPassword: false,
})
const currentStep = ref<1 | 2 | 3>(1)
const stepLabels = ['Personal details', 'Email address', 'Password']
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const serverError = ref('')
const successMessage = ref('')

const STORAGE_KEY = 'craftcv_register_state'

onMounted(() => {
  const savedState = sessionStorage.getItem(STORAGE_KEY)
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState)
      const source = parsed.form ?? parsed
      if (typeof source.firstName === 'string') form.firstName = source.firstName
      if (typeof source.lastName === 'string') form.lastName = source.lastName
      if (typeof source.otherName === 'string') form.otherName = source.otherName
      if (typeof source.email === 'string') form.email = source.email
      if (parsed.currentStep === 1 || parsed.currentStep === 2 || parsed.currentStep === 3) {
        currentStep.value = parsed.currentStep
      }
    }
    catch {
      // Ignore invalid persisted registration state.
    }
  }
})

watch(
  [form, currentStep],
  () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        otherName: form.otherName,
        email: form.email,
        currentStep: currentStep.value,
      }),
    )
  },
  { deep: true },
)

type Field = keyof typeof touched

function touch(field: Field) {
  touched[field] = true
}

function fieldError(field: Field) {
  if (!touched[field]) return ''
  if (field === 'firstName') {
    if (!form.firstName.trim()) return 'First name is required.'
  }
  if (field === 'lastName') {
    if (!form.lastName.trim()) return 'Last name is required.'
  }
  if (field === 'email') {
    if (!form.email) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Please enter a valid email address.'
  }
  if (field === 'password') {
    if (!form.password) return 'Password is required.'
    if (form.password.length < 8)
      return 'Password must be at least 8 characters.'
  }
  if (field === 'confirmPassword') {
    if (!form.confirmPassword) return 'Please confirm your password.'
    if (form.confirmPassword !== form.password)
      return 'Passwords do not match.'
  }
  return ''
}

function isStep1Valid() {
  touched.firstName = true
  touched.lastName = true
  return !fieldError('firstName') && !fieldError('lastName')
}

function isStep2Valid() {
  touched.email = true
  return !fieldError('email')
}

function isStep3Valid() {
  touched.password = true
  touched.confirmPassword = true
  return !fieldError('password') && !fieldError('confirmPassword')
}

function goBack() {
  currentStep.value = (currentStep.value - 1) as 1 | 2 | 3
}

async function onFormSubmit() {
  if (currentStep.value === 1) {
    if (isStep1Valid()) currentStep.value = 2
    return
  }
  if (currentStep.value === 2) {
    if (isStep2Valid()) currentStep.value = 3
    return
  }
  await handleSubmit()
}

async function handleSubmit() {
  serverError.value = ''
  successMessage.value = ''
  if (!isStep3Valid()) return

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1200))

    if (form.email === 'test@craftcv.com') {
      serverError.value
        = 'An account with this email already exists. Try signing in instead.'
      return
    }

    successMessage.value = 'Account created! Redirecting you to sign in…'
    sessionStorage.removeItem(STORAGE_KEY)
    setTimeout(() => {
      router.push('/login')
    }, 1200)
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
