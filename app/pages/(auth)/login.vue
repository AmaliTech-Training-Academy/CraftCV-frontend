<template>
  <div>
    <h1 class="font-display text-[32px] font-bold text-stone-900 leading-tight mb-2 text-center lg:text-left">
      Welcome <span class="text-brand-600">back.</span>
    </h1>
    <p class="text-[15px] text-stone-500 mb-8 text-center lg:text-left">
      Enter your email and password to continue.
    </p>

    <form
      novalidate
      @submit.prevent="handleSubmit"
    >
      <div class="mb-5">
        <label
          for="email"
          class="block text-[14px] font-medium text-stone-800 mb-2"
        >Email address</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :aria-invalid="!!fieldError('email')"
          :aria-describedby="fieldError('email') ? 'email-error' : undefined"
          :class="[
            'w-full h-[44px] px-[14px] text-[15px] rounded-lg border bg-white text-stone-900 placeholder-stone-400 outline-none transition',
            fieldError('email')
              ? 'border-error focus:ring-2 focus:ring-error/30'
              : 'border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
          ]"
          @blur="touch('email')"
        >
        <p
          v-if="fieldError('email')"
          id="email-error"
          class="mt-1.5 text-xs text-error"
        >
          {{ fieldError('email') }}
        </p>
      </div>

      <div class="mb-4">
        <label
          for="password"
          class="block text-[14px] font-medium text-stone-800 mb-2"
        >Password</label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Your password"
            :aria-invalid="!!fieldError('password')"
            :aria-describedby="fieldError('password') ? 'password-error' : undefined"
            :class="[
              'w-full h-[44px] px-[14px] pr-11 text-[15px] rounded-lg border bg-white text-stone-900 placeholder-stone-400 outline-none transition',
              fieldError('password')
                ? 'border-error focus:ring-2 focus:ring-error/30'
                : 'border-stone-200 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20',
            ]"
            @blur="touch('password')"
          >
          <button
            type="button"
            class="absolute right-[14px] top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
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
          class="mt-1.5 text-xs text-error"
        >
          {{ fieldError('password') }}
        </p>
      </div>

      <div class="flex items-center justify-between mb-6">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            v-model="form.rememberMe"
            type="checkbox"
            class="w-4 h-4 rounded border-stone-300 accent-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
          <span class="text-sm text-stone-600">Remember me</span>
        </label>
        <a
          href="#"
          class="text-[14px] font-medium text-brand-600 hover:text-brand-700 transition"
        >Forgot password?</a>
      </div>

      <div
        v-if="serverError"
        class="mb-4 flex items-start gap-2.5 rounded-lg border border-error/20 bg-error/5 p-3"
        role="alert"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          viewBox="0 0 24 24"
          class="flex-shrink-0 mt-0.5 text-error"
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

      <button
        id="login-submit-btn"
        type="submit"
        :disabled="loading"
        class="w-full h-12 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-base font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
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
        {{ loading ? 'Signing in\u2026' : 'Sign in' }}
      </button>
    </form>

    <div class="mt-6 flex items-center gap-3">
      <div class="h-px flex-1 bg-stone-200" />
      <span class="text-sm text-stone-400 whitespace-nowrap">or continue with</span>
      <div class="h-px flex-1 bg-stone-200" />
    </div>

    <p class="mt-6 text-center text-[14px] text-stone-600">
      Don't have an account?
      <NuxtLink
        to="/register"
        class="font-medium text-brand-600 hover:text-brand-700 transition"
      >Sign up</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
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

const form = reactive({ email: '', password: '', rememberMe: false })
const touched = reactive({ email: false, password: false })
const showPassword = ref(false)

function touch(field: 'email' | 'password') {
  touched[field] = true
}

function fieldError(field: 'email' | 'password') {
  if (!touched[field]) return ''
  if (field === 'email') {
    if (!form.email) return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
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
      { email: form.email, password: form.password },
      form.rememberMe,
    )
  }
  catch {
    // useAuth surfaces errors via serverError
  }
}
</script>
