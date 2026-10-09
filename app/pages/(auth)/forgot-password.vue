<template>
  <div>
    <div class="w-full max-w-[420px] mx-auto flex flex-col items-center">
      <!-- Step Markers (Dynamic based on 'step' state) -->
      <!-- Pattern: completed = green+checkmark, active = orange+number, future = grey+number -->
      <!-- Step indicator: semantic nav > ol > li with aria-current for screen readers -->
      <nav
        aria-label="Progress"
        class="w-full mb-8"
      >
        <ol class="flex items-center justify-between text-xs font-medium mb-2.5 px-0.5 m-0 p-0 list-none">
          <!-- Step 1: Email -->
          <li
            class="flex items-center gap-1.5 transition-colors duration-300"
            :style="{ color: step > 1 ? '#17B26A' : step === 1 ? '#E2673D' : '#B5A695', fontWeight: step >= 1 ? '600' : '400' }"
            :aria-current="step === 1 ? 'step' : undefined"
          >
            <span
              class="w-5 h-5 rounded-full flex items-center justify-center leading-none transition-all duration-300"
              :style="{
                backgroundColor: step > 1 ? '#17B26A' : step === 1 ? '#E2673D' : '#E5DDD1',
                color: step >= 1 ? '#fff' : '#78716C',
              }"
              aria-hidden="true"
            >
              <Check
                v-if="step > 1"
                style="width:11px; height:11px; stroke-width:3;"
              />
              <span
                v-else
                style="font-size:10px;"
              >1</span>
            </span>
            <span>Email</span>
          </li>

          <!-- Step 2: Verification -->
          <li
            class="flex items-center gap-1.5 transition-colors duration-300"
            :style="{ color: step > 2 ? '#17B26A' : step === 2 ? '#E2673D' : '#B5A695', fontWeight: step >= 2 ? '600' : '400' }"
            :aria-current="step === 2 ? 'step' : undefined"
          >
            <span
              class="w-5 h-5 rounded-full flex items-center justify-center leading-none transition-all duration-300"
              :style="{
                backgroundColor: step > 2 ? '#17B26A' : step === 2 ? '#E2673D' : '#E5DDD1',
                color: step >= 2 ? '#fff' : '#78716C',
              }"
              aria-hidden="true"
            >
              <Check
                v-if="step > 2"
                style="width:11px; height:11px; stroke-width:3;"
              />
              <span
                v-else
                style="font-size:10px;"
              >2</span>
            </span>
            <span>Verification</span>
          </li>

          <!-- Step 3: New Password -->
          <li
            class="flex items-center gap-1.5 transition-colors duration-300"
            :style="{ color: step > 3 ? '#17B26A' : step === 3 ? '#E2673D' : '#B5A695', fontWeight: step >= 3 ? '600' : '400' }"
            :aria-current="step === 3 ? 'step' : undefined"
          >
            <span
              class="w-5 h-5 rounded-full flex items-center justify-center leading-none transition-all duration-300"
              :style="{
                backgroundColor: step > 3 ? '#17B26A' : step === 3 ? '#E2673D' : '#E5DDD1',
                color: step >= 3 ? '#fff' : '#78716C',
              }"
              aria-hidden="true"
            >
              <Check
                v-if="step > 3"
                style="width:11px; height:11px; stroke-width:3;"
              />
              <span
                v-else
                style="font-size:10px;"
              >3</span>
            </span>
            <span>New password</span>
          </li>
        </ol>
        <!-- Progress Bars -->
        <div
          class="grid grid-cols-3 gap-2 w-full"
          aria-hidden="true"
        >
          <div
            class="h-1 rounded-full transition-colors duration-300"
            :style="{ backgroundColor: step > 1 ? '#17B26A' : step === 1 ? '#E2673D' : '#E5DDD1' }"
          />
          <div
            class="h-1 rounded-full transition-colors duration-300"
            :style="{ backgroundColor: step > 2 ? '#17B26A' : step === 2 ? '#E2673D' : '#E5DDD1' }"
          />
          <div
            class="h-1 rounded-full transition-colors duration-300"
            :style="{ backgroundColor: step > 3 ? '#17B26A' : step === 3 ? '#E2673D' : '#E5DDD1' }"
          />
        </div>
      </nav>

      <!-- ============================================== -->
      <!-- STEP 1: EMAIL REQUEST -->
      <!-- ============================================== -->
      <div
        v-if="step === 1"
        class="w-full flex flex-col items-center"
      >
        <!-- Envelope Badge -->
        <div class="w-14 h-14 rounded-full bg-[#FBE4D9] flex items-center justify-center mb-6 text-[#E2673D] transition-transform duration-200 hover:scale-105">
          <Mail class="w-7 h-7 stroke-[1.75]" />
        </div>

        <!-- Heading -->
        <div class="text-center mb-7">
          <h1
            ref="stepHeading"
            tabindex="-1"
            class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight"
          >
            Forgot your password?
          </h1>
          <p class="text-[#78716C] text-[14px] leading-relaxed max-w-[340px] mx-auto font-normal mt-2">
            Enter the email linked to your account. We'll send you a code to reset your password.
          </p>
        </div>

        <!-- Form -->
        <form
          class="w-full space-y-4"
          @submit.prevent="onSendCode"
        >
          <div class="flex flex-col gap-1.5">
            <Label
              for="email"
              class="text-[12px] font-medium text-[#57504A]"
            >
              Email address
            </Label>
            <Input
              id="email"
              v-model="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
              autocomplete="email"
              :aria-invalid="emailError ? 'true' : 'false'"
              aria-describedby="email-error"
              :class="[
                'w-full h-11 rounded-[10px] border bg-white text-[14px] text-[#2B2622] placeholder:text-[#B5A695] focus-visible:ring-[3px] focus-visible:ring-offset-0 px-3.5 transition-colors',
                emailError
                  ? 'border-[#E2673D] focus-visible:border-[#E2673D] focus-visible:ring-[#FBE4D9]'
                  : 'border-[#E5DDD1] focus-visible:border-[#E2673D] focus-visible:ring-[#FBE4D9]',
              ]"
              @blur="onEmailBlur"
              @input="onEmailInput"
            />
            <!-- Inline error / hint –– reserves height so layout doesn't jump -->
            <div
              id="email-error"
              aria-live="polite"
              style="min-height: 18px;"
            >
              <p
                v-if="emailError"
                role="alert"
                class="text-[12px] text-[#E2673D] flex items-center gap-1 mt-0.5"
              >
                <AlertCircle style="width:13px; height:13px; flex-shrink:0;" />
                {{ emailError }}
              </p>
              <p
                v-else
                class="text-[12px] text-[#948573] font-normal"
              >
                We'll only use this to send your reset code.
              </p>
            </div>
          </div>

          <div class="pt-1.5">
            <Button
              type="submit"
              :disabled="isLoading"
              class="w-full h-[46px] bg-[#E2673D] hover:bg-[#C9552F] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] shadow-sm transition-all duration-150 flex items-center justify-center tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send code
            </Button>
          </div>

          <div class="text-center pt-2">
            <NuxtLink
              to="/login"
              class="inline-block text-[14px] font-medium text-[#E2673D] hover:text-[#C9552F] underline underline-offset-4 decoration-[#F5C7AE] hover:decoration-[#E2673D] transition-colors duration-150"
            >
              Back to login
            </NuxtLink>
          </div>
        </form>
      </div>

      <!-- ============================================== -->
      <!-- STEP 2: VERIFICATION CODE -->
      <!-- ============================================== -->
      <div
        v-else-if="step === 2"
        class="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
      >
        <!-- Key / Shield Badge -->
        <div class="w-14 h-14 rounded-full bg-[#FBE4D9] flex items-center justify-center mb-6 text-[#E2673D] transition-transform duration-200 hover:scale-105">
          <KeyRound class="w-7 h-7 stroke-[1.75]" />
        </div>

        <!-- Heading -->
        <div class="text-center mb-7">
          <h1
            ref="stepHeading"
            tabindex="-1"
            class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight"
          >
            Check your email
          </h1>
          <p class="text-[#78716C] text-[14px] leading-relaxed max-w-[340px] mx-auto font-normal mt-2">
            We sent a 6-digit verification code to
            <span class="inline-flex items-center gap-1 mt-1.5 mx-auto px-2.5 py-0.5 rounded-full bg-[#FBE4D9] text-[#C9552F] font-medium text-[13px] font-mono tracking-tight">
              <svg
                class="w-3 h-3 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              ><rect
                width="20"
                height="16"
                x="2"
                y="4"
                rx="2"
              /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              {{ email }}
            </span>
          </p>
        </div>

        <!-- Form -->
        <form
          class="w-full space-y-4"
          @submit.prevent="onVerifyCode"
        >
          <div class="flex flex-col gap-1.5">
            <Label class="text-[12px] font-medium text-[#57504A] text-center">
              Verification code
            </Label>
            <div
              class="flex justify-between gap-2 w-full mt-1"
              role="group"
              aria-label="6-digit verification code"
            >
              <input
                v-for="(digit, index) in otp"
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

          <p
            v-if="otpError"
            class="text-[13px] text-red-500 font-medium text-center mt-2 flex items-center justify-center gap-1.5"
            role="alert"
          >
            <AlertCircle
              class="w-4 h-4"
              aria-hidden="true"
            />
            {{ otpError }}
          </p>

          <div class="pt-1.5">
            <Button
              type="submit"
              :disabled="!isOtpComplete || isLoading"
              class="w-full h-[46px] bg-[#E2673D] hover:bg-[#C9552F] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] shadow-sm transition-all duration-150 flex items-center justify-center tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify code
            </Button>
          </div>

          <!-- Resend section with cooldown, attempt limit, and accessible live region -->
          <div class="text-center pt-3 space-y-2">
            <!-- sr-only live region: announces state changes to screen readers -->
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

            <!-- State: ready or just sent -->
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
                type="button"
                class="text-[14px] text-[#948573] hover:text-[#57504A] transition-colors duration-150"
                @click="onResendCode"
              >
                Didn't receive a code?
                <span class="text-[#E2673D] hover:text-[#C9552F] underline underline-offset-4 decoration-[#F5C7AE]">Resend</span>
              </button>
            </template>

            <div class="pt-0.5">
              <button
                type="button"
                class="text-[13px] font-medium text-[#948573] hover:text-[#57504A] transition-colors"
                @click="goToStep1"
              >
                {{ resendAttempts >= MAX_RESEND_ATTEMPTS ? 'Try a different email' : 'Use a different email' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- ============================================== -->
      <!-- STEP 3: NEW PASSWORD -->
      <!-- ============================================== -->
      <div
        v-else-if="step === 3"
        class="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
      >
        <div class="text-center mb-7">
          <h1
            ref="stepHeading"
            tabindex="-1"
            class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight"
          >
            Set a new password.
          </h1>
          <p class="text-[#78716C] text-[14px] leading-relaxed max-w-[340px] mx-auto font-normal mt-2">
            Choose something strong that you haven't used before.
          </p>
        </div>

        <form
          class="w-full space-y-4"
          novalidate
          @submit.prevent="onResetPassword"
        >
          <!-- New Password -->
          <div class="flex flex-col gap-1.5 text-left">
            <label
              for="new-password"
              class="text-[12px] font-medium text-[#57504A]"
            >New password</label>
            <div class="relative">
              <input
                id="new-password"
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Create a new password"
                autocomplete="new-password"
                required
                :aria-describedby="!isPasswordFocused && passwordError ? 'password-error' : isPasswordFocused && newPassword.length > 0 ? 'password-guidance' : undefined"
                :aria-invalid="Boolean(!isPasswordFocused && passwordError) ? 'true' : 'false'"
                aria-required="true"
                class="block w-full h-[44px] rounded-[10px] bg-white text-[14px] text-[#2B2622] px-3.5 pr-11 border outline-none transition-all"
                :class="[!isPasswordFocused && passwordError ? 'border-[#E2673D] ring-4 ring-[#FBE4D9]' : 'border-[#E5DDD1] focus:border-[#E2673D] focus:ring-4 focus:ring-[#FBE4D9]']"
                @focus="isPasswordFocused = true"
                @input="isPasswordFocused = true"
                @blur="isPasswordFocused = false"
              >
              <button
                type="button"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                class="absolute top-0 bottom-0 right-0 w-10 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#B5A695]"
                @click="showPassword = !showPassword"
              >
                <EyeOff
                  v-if="!showPassword"
                  class="w-4 h-4"
                />
                <Eye
                  v-else
                  class="w-4 h-4"
                />
              </button>
            </div>
            <!-- Inline Error / Guidance -->
            <p
              v-if="isPasswordFocused && newPassword.length > 0"
              id="password-guidance"
              class="mt-1 text-xs text-stone-500 transition-colors"
            >
              {{ passwordGuidance }}
            </p>
            <p
              v-else-if="!isPasswordFocused && passwordError"
              id="password-error"
              class="text-[12px] text-[#E2673D] flex items-start gap-1 mt-1 leading-snug"
            >
              <AlertCircle class="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{{ passwordError }}</span>
            </p>
          </div>

          <!-- Confirm Password -->
          <div class="flex flex-col gap-1.5 text-left">
            <label
              for="confirm-password"
              class="text-[12px] font-medium text-[#57504A]"
            >Confirm new password</label>
            <div class="relative">
              <input
                id="confirm-password"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Repeat your new password"
                autocomplete="new-password"
                required
                :aria-invalid="confirmMismatch ? 'true' : 'false'"
                aria-describedby="confirm-error"
                aria-required="true"
                class="block w-full h-[44px] rounded-[10px] bg-white text-[14px] text-[#2B2622] px-3.5 pr-11 border outline-none transition-all"
                :class="[confirmMismatch ? 'border-[#E2673D] ring-4 ring-[#FBE4D9]' : 'border-[#E5DDD1] focus:border-[#E2673D] focus:ring-4 focus:ring-[#FBE4D9]']"
              >
              <button
                type="button"
                :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                class="absolute top-0 bottom-0 right-0 w-10 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#B5A695]"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <EyeOff
                  v-if="!showConfirmPassword"
                  class="w-4 h-4"
                />
                <Eye
                  v-else
                  class="w-4 h-4"
                />
              </button>
            </div>
            <!-- Live mismatch error -->
            <div
              id="confirm-error"
              role="alert"
              aria-live="polite"
              class="min-h-[20px] mt-0.5"
            >
              <p
                v-if="confirmMismatch"
                class="text-[12px] text-[#E2673D] flex items-start gap-1 m-0 leading-snug"
              >
                <AlertCircle class="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Passwords do not match</span>
              </p>
            </div>
          </div>

          <div class="pt-2">
            <Button
              type="submit"
              :disabled="!isResetFormValid || isLoading"
              class="w-full h-[46px] bg-[#E2673D] hover:bg-[#C9552F] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] shadow-sm transition-all duration-150 flex items-center justify-center tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset password
            </Button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- SUCCESS MODAL (shown after password reset)     -->
    <!-- ============================================== -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showSuccessModal"
          class="fixed inset-0 z-50 flex items-center justify-center px-4"
          style="background: rgba(43,38,34,0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          aria-describedby="success-modal-desc"
        >
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-2"
            enter-to-class="opacity-100 scale-100 translate-y-0"
          >
            <div
              v-if="showSuccessModal"
              class="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl flex flex-col items-center text-center px-8 py-10"
              style="box-shadow: 0 24px 48px -8px rgba(43,38,34,0.18), 0 0 0 1px #E5DDD1;"
            >
              <!-- Animated check circle -->
              <div
                class="w-[72px] h-[72px] rounded-full flex items-center justify-center mb-6"
                style="background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);"
              >
                <ShieldCheck
                  class="w-9 h-9"
                  style="color: #17B26A; stroke-width: 1.75;"
                  aria-hidden="true"
                />
              </div>

              <!-- Heading -->
              <h2
                id="success-modal-title"
                class="font-['Poppins'] font-semibold text-[22px] text-[#2B2622] leading-snug mb-2 tracking-tight"
              >
                Password reset!
              </h2>

              <!-- Description -->
              <p
                id="success-modal-desc"
                class="text-[14px] text-[#78716C] leading-relaxed max-w-[300px] mb-6"
              >
                Your password has been successfully reset. Redirecting to login in
                <span class="font-semibold tabular-nums text-[#2B2622]">{{ redirectCountdown }}s</span>...
              </p>

              <!-- CTA -->
              <button
                ref="loginBtn"
                type="button"
                class="w-full h-[46px] rounded-[10px] font-semibold text-sm tracking-wide text-white transition-all duration-150 active:scale-[0.98]"
                style="background: #E2673D;"
                @click="goToLoginNow"
                @mouseenter="(e) => (e.currentTarget as HTMLElement).style.background = '#C9552F'"
                @mouseleave="(e) => (e.currentTarget as HTMLElement).style.background = '#E2673D'"
              >
                Go to login
              </button>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePasswordReset } from '~/composables/usePasswordReset'
import { extractErrorMessage } from '~/utils/api'

useHead({ title: 'Forgot Password' })

definePageMeta({
  layout: 'auth',
})

const { requestReset, verifyCode, resetPassword } = usePasswordReset()

// Shared loading + error state
const isLoading = ref(false)
const otpError = ref('')

const step = ref(1)
const stepHeading = ref<HTMLHeadingElement | null>(null)
watch(step, () => nextTick(() => stepHeading.value?.focus()))

// ── Step 1: Email state & validation ──────────────────────────────────────────
const email = ref('')
const emailError = ref('')
const emailTouched = ref(false)

/**
 * Validates an email address with a practical RFC-5321-compatible regex.
 * Returns an error string, or '' if valid.
 */
function validateEmail(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return 'Email address is required.'
  if (/\s/.test(trimmed)) return 'Email address must not contain spaces.'
  const atCount = (trimmed.match(/@/g) || []).length
  if (atCount === 0) return 'Email address must include an @ symbol.'
  if (atCount > 1) return 'Email address must contain only one @ symbol.'
  const [local, domain] = trimmed.split('@')
  if (!local) return 'Email address is missing the part before @.'
  if (local.startsWith('.') || local.endsWith('.')) return 'Email address cannot start or end with a dot before @.'
  if (/\.\./.test(local)) return 'Email address cannot have consecutive dots.'
  if (!domain) return 'Email address is missing the domain (e.g. gmail.com).'
  if (!domain.includes('.')) return 'Email domain must include a dot (e.g. gmail.com).'
  if (domain.startsWith('.') || domain.endsWith('.')) return 'Email domain cannot start or end with a dot.'
  if (/\.\.\./.test(domain)) return 'Email domain cannot have consecutive dots.'
  const tld = domain.split('.').pop() ?? ''
  if (tld.length < 2) return 'Email domain extension must be at least 2 characters (e.g. .com).'
  if (!/^[a-zA-Z]+$/.test(tld)) return 'Email domain extension must contain only letters.'
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(trimmed)) return 'Please enter a valid email address (e.g. you@example.com).'
  return ''
}

function onEmailBlur() {
  emailTouched.value = true
  emailError.value = validateEmail(email.value)
}

function onEmailInput() {
  // Live-clear the error once the user starts correcting
  if (emailError.value) emailError.value = validateEmail(email.value)
}

// ── Step 2: Resend-code state ─────────────────────────────────────────────────
const RESEND_COOLDOWN_SECS = 60
const MAX_RESEND_ATTEMPTS = 3

const resendCooldown = ref(0) // seconds remaining; 0 = ready
const resendAttempts = ref(0) // how many times user has resent
const resendStatus = ref<'idle' | 'sent'>('idle') // drives the "Code sent!" flash
const resendAnnouncement = ref('') // sr-only live region text

let cooldownInterval: ReturnType<typeof setInterval> | null = null
let sentFlashTimeout: ReturnType<typeof setTimeout> | null = null

function startCooldown() {
  resendCooldown.value = RESEND_COOLDOWN_SECS
  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownInterval = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--
      if (resendCooldown.value === 0) {
        resendAnnouncement.value = 'You can now resend the verification code.'
        clearInterval(cooldownInterval!)
        cooldownInterval = null
      }
    }
  }, 1000)
}

// Start cooldown automatically whenever the user enters step 2
watch(
  () => step.value,
  (newStep) => {
    if (newStep === 2) {
      resendAttempts.value = 0
      resendStatus.value = 'idle'
      startCooldown()
    }
    else {
      if (cooldownInterval) {
        clearInterval(cooldownInterval)
        cooldownInterval = null
      }
    }
  },
)

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
  if (sentFlashTimeout) clearTimeout(sentFlashTimeout)
})
// ─────────────────────────────────────────────────────────────────────────────

const otp = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])
const isOtpComplete = computed(() => otp.value.every(digit => digit.trim().length > 0))

// Step 3 state
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isPasswordFocused = ref(false)

// Live check: are the two passwords mismatched (only show after confirm has content)
const confirmMismatch = computed(() =>
  confirmPassword.value.length > 0 && newPassword.value !== confirmPassword.value,
)

// Individual password rule definitions with live pass/fail state
const passwordCriteria = computed(() => {
  const pw = newPassword.value || ''
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
  if (!newPassword.value) return ''

  const missing = passwordCriteria.value.filter(c => !c.passed)

  if (missing.length === 0) {
    return 'Password is strong.'
  }

  // If password is just started (e.g. 1-2 characters), show general tip
  if (newPassword.value.length < 3) {
    return 'Tip: A strong password includes 8+ characters, uppercase, lowercase, numbers, and symbols.'
  }

  // Specifically tell the user what to add to make it strong
  const missingHints = missing.map(m => m.hint)
  return `To make it stronger, add: ${missingHints.join(', ')}.`
})

const isResetFormValid = computed(() => {
  return Boolean(isPasswordValid.value && confirmPassword.value && newPassword.value === confirmPassword.value)
})

// Handle single character typing and moving focus forward (digits only)
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

    // move focus to next input if we're not at the end
    if (index < 5) {
      otpInputs.value[index + 1]?.focus()
    }
  }

  if (isOtpComplete.value && !isLoading.value) {
    onVerifyCode()
  }
}

// Handle backspace moving focus backward and prevent non-digit keys
function handleOtpKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace') {
    if (!otp.value[index] && index > 0) {
      // If the box is empty and backspace is pressed, go back one and clear it
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

// Handle pasting a full 6-digit code (numbers only)
function handleOtpPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')
  if (!pastedData) return

  const numbers = pastedData.replace(/\D/g, '').substring(0, 6).split('')
  if (numbers.length === 0) return

  for (let i = 0; i < 6; i++) {
    otp.value[i] = numbers[i] ?? ''
  }

  // Focus the next empty box, or the last box
  const nextFocusIndex = Math.min(numbers.length, 5)
  otpInputs.value[nextFocusIndex]?.focus()

  if (numbers.length === 6 && !isLoading.value) {
    onVerifyCode()
  }
}

async function onSendCode() {
  emailTouched.value = true
  emailError.value = validateEmail(email.value)
  if (emailError.value) return
  isLoading.value = true
  try {
    await requestReset(email.value.trim())
    step.value = 2
  }
  catch (err) {
    emailError.value = extractErrorMessage(err)
  }
  finally { isLoading.value = false }
}

async function onVerifyCode() {
  otpError.value = ''
  const fullCode = otp.value.join('')
  if (fullCode.length < 6) {
    otpError.value = 'Please enter the full 6-digit code.'
    return
  }
  isLoading.value = true
  try {
    await verifyCode(email.value.trim(), fullCode)
    step.value = 3
  }
  catch (err) {
    otpError.value = extractErrorMessage(err, 'Invalid or expired code. Please try again.')
  }
  finally { isLoading.value = false }
}

function goToStep1() {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
    cooldownInterval = null
  }
  resendCooldown.value = 0
  step.value = 1
  otp.value = ['', '', '', '', '', '']
  otpError.value = ''
}

async function onResendCode() {
  if (resendCooldown.value > 0 || resendAttempts.value >= MAX_RESEND_ATTEMPTS) return
  resendAttempts.value++
  otp.value = ['', '', '', '', '', '']
  otpError.value = ''
  isLoading.value = true
  try {
    await requestReset(email.value.trim())
    resendStatus.value = 'sent'
    resendAnnouncement.value = `Verification code resent to ${email.value}.`
    nextTick(() => otpInputs.value[0]?.focus())
    startCooldown()
    if (sentFlashTimeout) clearTimeout(sentFlashTimeout)
    sentFlashTimeout = setTimeout(() => {
      resendStatus.value = 'idle'
    }, 3000)
  }
  catch (err) {
    otpError.value = extractErrorMessage(err, 'Failed to resend code. Please try again.')
  }
  finally { isLoading.value = false }
}

const passwordError = ref('')
const showSuccessModal = ref(false)
const loginBtn = ref<HTMLButtonElement | null>(null)
watch(showSuccessModal, (open) => {
  if (open) nextTick(() => loginBtn.value?.focus())
})
const redirectCountdown = ref(5)
let redirectInterval: ReturnType<typeof setInterval> | null = null

const router = useRouter()

watch([newPassword, confirmPassword], () => {
  if (passwordError.value) {
    passwordError.value = ''
  }
})

async function onResetPassword() {
  isPasswordFocused.value = false
  if (!newPassword.value) return

  if (!isPasswordValid.value) {
    passwordError.value = 'Password must meet all 6 security requirements.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }
  passwordError.value = ''
  isLoading.value = true
  try {
    await resetPassword(email.value.trim(), otp.value.join(''), newPassword.value)
    showSuccessModal.value = true
    redirectCountdown.value = 5
    redirectInterval = setInterval(() => {
      redirectCountdown.value--
      if (redirectCountdown.value <= 0) {
        clearInterval(redirectInterval!)
        redirectInterval = null
        router.push('/login')
      }
    }, 1000)
  }
  catch (err) {
    passwordError.value = extractErrorMessage(err, 'Reset failed. Your code may have expired — please start again.')
  }
  finally { isLoading.value = false }
}

function goToLoginNow() {
  if (redirectInterval) clearInterval(redirectInterval)
  router.push('/login')
}

onUnmounted(() => {
  if (redirectInterval) clearInterval(redirectInterval)
})
</script>
