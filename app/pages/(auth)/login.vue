<template>
  <div>
    <div class="mb-4 lg:mb-6 text-center md:text-left">
      <h1
        class="font-display font-bold text-3xl sm:text-4xl text-stone-900 leading-tight mb-2"
      >
        Welcome <span class="text-brand-600">back.</span>
      </h1>
      <p class="text-stone-500 text-sm">
        Enter your email and password to continue.
      </p>
    </div>

    <form
      novalidate
      @submit.prevent="handleSubmit"
    >
      <div class="mb-5">
        <Label
          for="email"
          class="block mb-2 text-stone-800"
        >Email address</Label>
        <Input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :aria-invalid="!!fieldError('email')"
          :aria-describedby="fieldError('email') ? 'email-error' : undefined"
          :class="[
            'h-11',
            fieldError('email')
              ? 'border-destructive focus-visible:ring-destructive'
              : 'focus-visible:ring-brand-600',
          ]"
          @blur="touch('email')"
        />
        <p
          v-if="fieldError('email')"
          id="email-error"
          class="mt-1.5 text-xs text-destructive"
        >
          {{ fieldError("email") }}
        </p>
      </div>

      <div class="mb-4">
        <Label
          for="password"
          class="block mb-2 text-stone-800"
        >Password</Label>
        <div class="relative">
          <Input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Your password"
            :aria-invalid="!!fieldError('password')"
            :aria-describedby="
              fieldError('password') ? 'password-error' : undefined
            "
            :class="[
              'h-11 pr-11',
              fieldError('password')
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-brand-600',
            ]"
            @blur="touch('password')"
          />
          <button
            type="button"
            class="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            :aria-pressed="showPassword"
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
          id="password-error"
          class="mt-1.5 text-xs text-destructive"
        >
          {{ fieldError("password") }}
        </p>
      </div>

      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            v-model="form.rememberMe"
            class="cursor-pointer"
          />
          <Label
            for="rememberMe"
            class="select-none font-normal cursor-pointer text-sm text-stone-600"
          >
            Remember me
          </Label>
        </div>
        <NuxtLink
          to="/forgot-password"
          class="text-[14px] font-medium text-brand-600 hover:text-brand-700 transition cursor-pointer"
        >Forgot password?
        </NuxtLink>
      </div>

      <div
        v-if="serverError"
        role="alert"
        class="mb-4 rounded-xl p-3 text-xs sm:text-sm font-medium"
        :class="isUnverifiedError
          ? 'bg-amber-50 text-amber-900 border border-amber-200'
          : 'bg-rose-50 text-rose-700 border border-rose-200'"
      >
        <p>{{ serverError }}</p>

        <div
          v-if="isUnverifiedError"
          class="mt-2"
        >
          <NuxtLink
            :to="{ path: '/verify-email', query: { email: form.email } }"
            class="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline underline-offset-2 transition"
          >
            <span>Verify your email now</span>
            <span aria-hidden="true">&rarr;</span>
          </NuxtLink>
        </div>
      </div>

      <Button
        id="login-submit-btn"
        type="submit"
        :disabled="loading"
        class="w-full h-12 bg-brand-600 hover:bg-brand-700 text-base font-semibold cursor-pointer"
      >
        <svg
          v-if="loading"
          class="animate-spin w-4 h-4 mr-2"
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
        {{ loading ? "Signing in\u2026" : "Sign in" }}
      </Button>
    </form>

    <p class="mt-6 text-center text-[14px] text-stone-600">
      Don't have an account?
      <NuxtLink
        to="/register"
        class="font-medium text-brand-600 hover:text-brand-700 transition cursor-pointer"
      >Sign up</NuxtLink>
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
  title: 'Sign in \u2014 CraftCV',
  meta: [
    {
      name: 'description',
      content: 'Sign in to your CraftCV account to access your CV dashboard.',
    },
  ],
})

definePageMeta({ layout: 'auth' })

const { login, loading, error: serverError } = useAuth()

const isUnverifiedError = computed(() => {
  const msg = (serverError.value || '').toLowerCase()
  return (
    msg.includes('not verified')
    || msg.includes('unverified')
    || msg.includes('verify your email')
  )
})

const savedEmail = useSessionStorage('craftcv-login-email', '')

const form = reactive({
  email: savedEmail.value,
  password: '',
  rememberMe: false,
})

watch(() => form.email, (newVal) => {
  savedEmail.value = newVal
})
const touched = reactive({ email: false, password: false })
const showPassword = ref(false)

function touch(field: 'email' | 'password') {
  touched[field] = true
}

function fieldError(field: 'email' | 'password') {
  if (!touched[field]) return ''
  if (field === 'email') {
    if (!form.email.trim()) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return 'Please enter a valid email address.'
  }
  if (field === 'password') {
    if (!form.password) return 'Password is required.'
  }
  return ''
}

function isValid() {
  touched.email = true
  touched.password = true
  return !fieldError('email') && !fieldError('password')
}

async function handleSubmit() {
  if (!isValid()) return
  try {
    await login(
      { email: form.email.trim(), password: form.password },
      form.rememberMe,
    )
  }
  catch {
    // useAuth surfaces errors via serverError
  }
}
</script>
