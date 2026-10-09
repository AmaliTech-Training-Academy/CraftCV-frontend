<template>
  <div class="w-full max-w-[420px] mx-auto">
    <div class="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
      <!-- Mail Badge Icon -->
      <div class="w-14 h-14 rounded-full bg-[#FBE4D9] flex items-center justify-center mb-6 text-[#E2673D] transition-transform duration-200 hover:scale-105">
        <Mail class="w-7 h-7 stroke-[1.75]" />
      </div>

      <!-- Heading & Email Pill -->
      <div class="text-center mb-7">
        <h1
          ref="headingEl"
          tabindex="-1"
          class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight"
        >
          Check your email
        </h1>
        <p class="text-[#78716C] text-[14px] leading-relaxed max-w-[340px] mx-auto font-normal mt-2">
          We sent a 6-digit verification code to
          <span
            id="email-pill"
            class="inline-flex items-center gap-1 mt-1.5 mx-auto px-2.5 py-0.5 rounded-full bg-[#FBE4D9] text-[#C9552F] font-medium text-[13px] font-mono tracking-tight"
          >
            <svg
              class="w-3 h-3 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect
                width="20"
                height="16"
                x="2"
                y="4"
                rx="2"
              />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {{ email }}
          </span>
        </p>
      </div>

      <!-- Unverified Banner Notice -->
      <div
        v-if="isUnverifiedNotice"
        id="unverified-notice"
        class="w-full mb-5 p-3.5 rounded-[10px] bg-amber-50 border border-amber-200 text-amber-900 text-[13px] font-medium text-center flex items-center justify-center gap-2 animate-in fade-in duration-200"
        role="alert"
      >
        <AlertCircle
          class="w-4 h-4 shrink-0 text-amber-600"
          aria-hidden="true"
        />
        <span>Your account is not verified yet. Please enter the verification code sent to your email.</span>
      </div>

      <!-- Form -->
      <form
        class="w-full space-y-4"
        novalidate
        @submit.prevent="handleVerify"
      >
        <div class="flex flex-col gap-1.5">
          <Label class="text-[12px] font-medium text-[#57504A] text-center">
            Verification code
          </Label>
          <div
            class="flex justify-between gap-2 w-full mt-1"
            role="group"
            aria-label="6-digit verification code"
            :aria-describedby="errorMessage ? 'verify-error' : undefined"
          >
            <input
              v-for="(_, index) in otp"
              :key="index"
              ref="otpInputs"
              v-model="otp[index]"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              autocomplete="one-time-code"
              :aria-label="`Digit ${index + 1} of 6`"
              class="w-[48px] h-[56px] rounded-[10px] border-[1.5px] border-[#E5DDD1] bg-white text-[24px] font-bold text-center text-[#2B2622] focus:outline-none focus:ring-[3px] focus:ring-[#FBE4D9] focus:border-[#E2673D] transition-shadow shadow-sm"
              @input="handleOtpInput($event, index)"
              @keydown="handleOtpKeydown($event, index)"
              @paste="handleOtpPaste"
            >
          </div>
        </div>

        <!-- Alert messages -->
        <p
          v-if="errorMessage"
          id="verify-error"
          class="text-[13px] text-red-500 font-medium text-center mt-2 flex items-center justify-center gap-1.5"
          role="alert"
        >
          <AlertCircle
            class="w-4 h-4 shrink-0"
            aria-hidden="true"
          />
          {{ errorMessage }}
        </p>

        <p
          v-if="successMessage"
          id="verify-success"
          class="text-[13px] text-[#17B26A] font-medium text-center mt-2 flex items-center justify-center gap-1.5"
          role="status"
        >
          <CheckCircle
            class="w-4 h-4 shrink-0"
            aria-hidden="true"
          />
          {{ successMessage }}
        </p>

        <!-- Submit Button -->
        <div class="pt-1.5">
          <Button
            type="submit"
            :disabled="!isCodeComplete || isLoading"
            class="w-full h-[46px] bg-[#E2673D] hover:bg-[#C9552F] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] shadow-sm transition-all duration-150 flex items-center justify-center tracking-wide disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg
              v-if="isLoading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ isLoading ? 'Verifying code...' : 'Verify code' }}
          </Button>
        </div>

        <!-- Resend Section & Back Link -->
        <div class="text-center pt-3 space-y-2">
          <!-- Live Region for Screen Readers -->
          <p
            aria-live="polite"
            aria-atomic="true"
            class="sr-only"
          >
            {{ resendAnnouncement }}
          </p>

          <!-- State: cooling down -->
          <p
            v-if="resendCooldown > 0 && resendStatus !== 'sent'"
            id="resend-cooldown"
            class="text-[13px] text-[#948573] flex items-center justify-center gap-1.5"
          >
            <Clock
              class="w-3.5 h-3.5 shrink-0"
              aria-hidden="true"
            />
            Resend in
            <span class="font-semibold tabular-nums text-[#57504A] min-w-[2.5ch] inline-block">{{ resendCooldown }}s</span>
          </p>

          <!-- State: max attempts reached -->
          <p
            v-else-if="resendAttempts >= MAX_RESEND_ATTEMPTS"
            class="text-[13px] text-[#948573] leading-relaxed text-center"
          >
            Too many resend attempts.
          </p>

          <!-- State: ready or sent flash -->
          <template v-else>
            <p
              v-if="resendStatus === 'sent'"
              class="text-[13px] text-[#17B26A] flex items-center justify-center gap-1 font-medium"
              aria-live="polite"
            >
              <CheckCircle
                class="w-4 h-4 shrink-0"
                aria-hidden="true"
              />
              Code sent! Check your inbox.
            </p>
            <button
              v-else
              id="resend-btn"
              type="button"
              class="text-[14px] text-[#948573] hover:text-[#57504A] transition-colors duration-150 cursor-pointer"
              @click="handleResend"
            >
              Didn't receive a code?
              <span class="text-[#E2673D] hover:text-[#C9552F] underline underline-offset-4 decoration-[#F5C7AE]">Resend</span>
            </button>
          </template>

          <div class="pt-0.5">
            <NuxtLink
              id="change-email-link"
              :to="{ path: '/register', query: email ? { email } : undefined }"
              class="text-[13px] font-medium text-[#948573] hover:text-[#57504A] transition-colors cursor-pointer"
            >
              Use a different email
            </NuxtLink>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Mail, AlertCircle, CheckCircle, Clock } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { extractErrorMessage } from '~/utils/api'
import { useAuth } from '~/composables/useAuth'

useHead({
  title: 'Check your email — CraftCV',
})

definePageMeta({
  layout: 'auth',
})

const auth = useAuth()
const verifyEmail = auth.verifyEmail
const resendVerification = auth.resendVerification
const route = useRoute()
const headingEl = ref<HTMLHeadingElement | null>(null)

const email = computed(() => {
  const q = route.query.email
  if (Array.isArray(q)) return q[0] ?? ''
  return (typeof q === 'string' ? q : '')
})

const isUnverifiedNotice = computed(() => {
  const q = route.query.unverified
  if (Array.isArray(q)) return q[0] === 'true'
  return q === 'true'
})

if (import.meta.server || import.meta.client) {
  if (!email.value || !email.value.trim()) {
    await navigateTo('/register', { replace: true })
  }
}

const otp = ref<string[]>(['', '', '', '', '', ''])
const otpInputs = ref<(HTMLInputElement | null)[]>([])

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const isCodeComplete = computed(() => {
  return otp.value.every(digit => digit.trim().length > 0)
})

// Auto-advance between boxes on input and restrict to digits only
function handleOtpInput(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const rawValue = target.value
  const cleanDigits = rawValue.replace(/\D/g, '')

  if (!cleanDigits) {
    otp.value[index] = ''
    target.value = ''
    return
  }

  // Handle multi-digit autofill (e.g. SMS verification codes)
  if (cleanDigits.length >= 4) {
    const digits = cleanDigits.substring(0, 6).split('')
    for (let i = 0; i < digits.length; i++) {
      otp.value[i] = digits[i] ?? ''
    }
    const nextFocusIndex = Math.min(digits.length, 5)
    otpInputs.value[nextFocusIndex]?.focus()
  }
  else {
    const digit = cleanDigits.slice(-1)
    otp.value[index] = digit
    target.value = digit

    // Move focus forward if not at the end
    if (index < 5) {
      otpInputs.value[index + 1]?.focus()
    }
  }

  // Auto-trigger verification when all 6 digits are provided
  if (isCodeComplete.value && !isLoading.value) {
    handleVerify()
  }
}

// Backspace navigation to previous box and prevent non-digit keys
function handleOtpKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace') {
    if (!otp.value[index] && index > 0) {
      otp.value[index - 1] = ''
      otpInputs.value[index - 1]?.focus()
    }
    return
  }

  const allowedNavKeys = ['Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Home', 'End']
  if (allowedNavKeys.includes(event.key)) {
    return
  }

  if (event.ctrlKey || event.metaKey) {
    return
  }

  // Prevent any non-digit character from being typed
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault()
  }
}

// Paste full 6-digit code (numbers only)
function handleOtpPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')
  if (!pastedData) return

  const numbers = pastedData.replace(/\D/g, '').substring(0, 6).split('')
  if (numbers.length === 0) return

  for (let i = 0; i < 6; i++) {
    otp.value[i] = numbers[i] ?? ''
  }

  const nextFocusIndex = Math.min(numbers.length, 5)
  otpInputs.value[nextFocusIndex]?.focus()

  if (numbers.length === 6 && !isLoading.value) {
    handleVerify()
  }
}

async function handleVerify() {
  if (!isCodeComplete.value || isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await verifyEmail({
      email: email.value.trim(),
      code: otp.value.join(''),
    })

    successMessage.value = 'Email verified successfully! Redirecting...'
    await navigateTo('/dashboard')
  }
  catch (err: unknown) {
    errorMessage.value = extractErrorMessage(err, 'Invalid or expired verification code.')
  }
  finally {
    isLoading.value = false
  }
}

// Resend timer and cooldown logic
const RESEND_COOLDOWN_SECS = 60
const MAX_RESEND_ATTEMPTS = 3

const resendCooldown = ref(0)
const resendAttempts = ref(0)
const resendStatus = ref<'idle' | 'sent'>('idle')
const resendAnnouncement = ref('')

let cooldownInterval: ReturnType<typeof setInterval> | null = null
let sentFlashTimeout: ReturnType<typeof setTimeout> | null = null

function startCooldown() {
  resendCooldown.value = RESEND_COOLDOWN_SECS
  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownInterval = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--
    }
    else {
      if (cooldownInterval) clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

async function handleResend() {
  if (resendCooldown.value > 0 || resendAttempts.value >= MAX_RESEND_ATTEMPTS || isLoading.value) return
  otp.value = ['', '', '', '', '', '']
  errorMessage.value = ''
  isLoading.value = true
  try {
    await resendVerification(email.value.trim())
    resendAttempts.value++
    resendStatus.value = 'sent'
    resendAnnouncement.value = `Verification code resent to ${email.value}.`
    nextTick(() => otpInputs.value[0]?.focus())
    startCooldown()
    if (sentFlashTimeout) clearTimeout(sentFlashTimeout)
    sentFlashTimeout = setTimeout(() => {
      resendStatus.value = 'idle'
    }, 3000)
  }
  catch (err: unknown) {
    errorMessage.value = extractErrorMessage(err, 'Failed to resend code. Please try again.')
  }
  finally {
    isLoading.value = false
  }
}

onMounted(() => {
  startCooldown()
  nextTick(() => {
    otpInputs.value[0]?.focus()
  })
})

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
  if (sentFlashTimeout) clearTimeout(sentFlashTimeout)
})
</script>
