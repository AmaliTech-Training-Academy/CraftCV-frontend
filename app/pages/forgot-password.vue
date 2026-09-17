<template>
  <div class="min-h-screen bg-white text-[#2B2622] flex flex-col justify-between selection:bg-[#FBE4D9] selection:text-[#C9552F] font-['Inter']">
    
    <!-- Header -->
    <header class="w-full px-6 py-6 sm:px-10 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <NuxtLink aria-label="CraftCV Home" class="flex items-center gap-2.5 group transition-opacity hover:opacity-90" to="/">
          <div class="w-8 h-8 rounded-lg bg-[#E2673D] flex items-center justify-center text-white font-['Poppins'] font-bold text-lg shadow-sm">
            C
          </div>
          <span class="font-['Poppins'] font-semibold text-[18px] text-[#2B2622] tracking-tight">Craft<span class="text-[#E2673D]">CV</span></span>
        </NuxtLink>
      </div>
      <a class="text-xs font-medium text-[#948573] hover:text-[#3A342F] transition-colors flex items-center gap-1.5" href="#">
        <span>Need assistance?</span>
        <svg class="w-3.5 h-3.5 stroke-current" fill="none" stroke-width="2" viewBox="0 0 24 24">
          <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </a>
    </header>

    <!-- Main Content -->
    <main class="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
      <div class="w-full max-w-[420px] mx-auto flex flex-col items-center">
        
          <!-- Step Markers (Dynamic based on 'step' state) -->
          <!-- Pattern: completed = green+checkmark, active = orange+number, future = grey+number -->
          <div aria-label="Step Indicator" class="w-full mb-8">
            <div class="flex items-center justify-between text-xs font-medium mb-2.5 px-0.5">
              <!-- Step 1: Email -->
              <div
                class="flex items-center gap-1.5 transition-colors duration-300"
                :style="{ color: step > 1 ? '#17B26A' : step === 1 ? '#E2673D' : '#B5A695', fontWeight: step >= 1 ? '600' : '400' }"
              >
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center leading-none transition-all duration-300"
                  :style="{
                    backgroundColor: step > 1 ? '#17B26A' : step === 1 ? '#E2673D' : '#E5DDD1',
                    color: step >= 1 ? '#fff' : '#78716C'
                  }"
                >
                  <Check v-if="step > 1" style="width:11px; height:11px; stroke-width:3;" />
                  <span v-else style="font-size:10px;">1</span>
                </span>
                <span>Email</span>
              </div>

              <!-- Step 2: Verification -->
              <div
                class="flex items-center gap-1.5 transition-colors duration-300"
                :style="{ color: step > 2 ? '#17B26A' : step === 2 ? '#E2673D' : '#B5A695', fontWeight: step >= 2 ? '600' : '400' }"
              >
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center leading-none transition-all duration-300"
                  :style="{
                    backgroundColor: step > 2 ? '#17B26A' : step === 2 ? '#E2673D' : '#E5DDD1',
                    color: step >= 2 ? '#fff' : '#78716C'
                  }"
                >
                  <Check v-if="step > 2" style="width:11px; height:11px; stroke-width:3;" />
                  <span v-else style="font-size:10px;">2</span>
                </span>
                <span>Verification</span>
              </div>

              <!-- Step 3: New Password -->
              <div
                class="flex items-center gap-1.5 transition-colors duration-300"
                :style="{ color: step > 3 ? '#17B26A' : step === 3 ? '#E2673D' : '#B5A695', fontWeight: step >= 3 ? '600' : '400' }"
              >
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center leading-none transition-all duration-300"
                  :style="{
                    backgroundColor: step > 3 ? '#17B26A' : step === 3 ? '#E2673D' : '#E5DDD1',
                    color: step >= 3 ? '#fff' : '#78716C'
                  }"
                >
                  <Check v-if="step > 3" style="width:11px; height:11px; stroke-width:3;" />
                  <span v-else style="font-size:10px;">3</span>
                </span>
                <span>New password</span>
              </div>
            </div>
          <!-- Progress Bars -->
          <div class="grid grid-cols-3 gap-2 w-full">
            <div class="h-1 rounded-full transition-colors duration-300" :style="{ backgroundColor: step > 1 ? '#17B26A' : step === 1 ? '#E2673D' : '#E5DDD1' }"></div>
            <div class="h-1 rounded-full transition-colors duration-300" :style="{ backgroundColor: step > 2 ? '#17B26A' : step === 2 ? '#E2673D' : '#E5DDD1' }"></div>
            <div class="h-1 rounded-full transition-colors duration-300" :style="{ backgroundColor: step > 3 ? '#17B26A' : step === 3 ? '#E2673D' : '#E5DDD1' }"></div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- STEP 1: EMAIL REQUEST -->
        <!-- ============================================== -->
        <div v-if="step === 1" class="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
          <!-- Envelope Badge -->
          <div class="w-14 h-14 rounded-full bg-[#FBE4D9] flex items-center justify-center mb-6 text-[#E2673D] transition-transform duration-200 hover:scale-105">
            <Mail class="w-7 h-7 stroke-[1.75]" />
          </div>

          <!-- Heading -->
          <div class="text-center mb-7">
            <h1 class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight">
              Forgot your password?
            </h1>
            <p class="text-[#78716C] text-[14px] leading-relaxed max-w-[340px] mx-auto font-normal mt-2">
              Enter the email linked to your account. We'll send you a code to reset your password.
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="onSendCode" class="w-full space-y-4">
            <div class="flex flex-col gap-1.5">
              <Label for="email" class="text-[12px] font-medium text-[#57504A]">
                Email address
              </Label>
              <Input 
                id="email" 
                name="email" 
                placeholder="you@example.com" 
                required 
                type="email"
                class="w-full h-11 rounded-[10px] border border-[#E5DDD1] bg-white text-[14px] text-[#2B2622] placeholder:text-[#B5A695] focus-visible:border-[#E2673D] focus-visible:ring-[3px] focus-visible:ring-[#FBE4D9] focus-visible:ring-offset-0 px-3.5"
              />
              <p class="text-[12px] text-[#948573] font-normal pt-0.5">
                We'll only use this to send your reset code.
              </p>
            </div>

            <div class="pt-1.5">
              <Button type="submit" class="w-full h-[46px] bg-[#E2673D] hover:bg-[#C9552F] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] shadow-sm transition-all duration-150 flex items-center justify-center tracking-wide">
                Send code
              </Button>
            </div>

            <div class="text-center pt-2">
              <NuxtLink to="/auth/login" class="inline-block text-[14px] font-medium text-[#E2673D] hover:text-[#C9552F] underline underline-offset-4 decoration-[#F5C7AE] hover:decoration-[#E2673D] transition-colors duration-150">
                Back to login
              </NuxtLink>
            </div>
          </form>
        </div>

        <!-- ============================================== -->
        <!-- STEP 2: VERIFICATION CODE -->
        <!-- ============================================== -->
        <div v-else-if="step === 2" class="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
          <!-- Key / Shield Badge -->
          <div class="w-14 h-14 rounded-full bg-[#FBE4D9] flex items-center justify-center mb-6 text-[#E2673D] transition-transform duration-200 hover:scale-105">
            <KeyRound class="w-7 h-7 stroke-[1.75]" />
          </div>

          <!-- Heading -->
          <div class="text-center mb-7">
            <h1 class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight">
              Check your email
            </h1>
            <p class="text-[#78716C] text-[14px] leading-relaxed max-w-[340px] mx-auto font-normal mt-2">
              We sent a 6-digit verification code to your email. Enter it below to verify your identity.
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="onVerifyCode" class="w-full space-y-4">
            <div class="flex flex-col gap-1.5">
              <Label class="text-[12px] font-medium text-[#57504A] text-center">
                Verification code
              </Label>
              <div class="flex justify-between gap-2 w-full mt-1">
                <input 
                  v-for="(digit, index) in otp" 
                  :key="index"
                  ref="otpInputs"
                  v-model="otp[index]"
                  @input="handleOtpInput($event, index)"
                  @keydown="handleOtpKeydown($event, index)"
                  @paste="handleOtpPaste"
                  type="text"
                  inputmode="numeric"
                  class="w-[48px] h-[56px] rounded-[10px] border-[1.5px] border-[#E5DDD1] bg-white text-[24px] font-bold text-center text-[#2B2622] focus:outline-none focus:ring-[3px] focus:ring-[#FBE4D9] focus:border-[#E2673D] transition-shadow shadow-sm"
                />
              </div>
            </div>

            <div class="pt-1.5">
              <Button type="submit" class="w-full h-[46px] bg-[#E2673D] hover:bg-[#C9552F] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] shadow-sm transition-all duration-150 flex items-center justify-center tracking-wide">
                Verify code
              </Button>
            </div>

            <div class="text-center pt-2">
              <button type="button" @click="onResendCode" class="inline-block text-[14px] font-medium text-[#E2673D] hover:text-[#C9552F] underline underline-offset-4 decoration-[#F5C7AE] hover:decoration-[#E2673D] transition-colors duration-150">
                Didn't receive a code? Resend
              </button>
            </div>
            <div class="text-center mt-2">
              <button type="button" @click="step = 1" class="text-[13px] font-medium text-[#948573] hover:text-[#57504A] transition-colors">
                Use a different email
              </button>
            </div>
          </form>
        </div>

        <!-- ============================================== -->
        <!-- STEP 3: NEW PASSWORD -->
        <!-- ============================================== -->
        <div v-else-if="step === 3" class="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
          
          <div class="text-center mb-7">
            <h1 class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight">
              Set a new password.
            </h1>
            <p class="text-[#78716C] text-[14px] leading-relaxed max-w-[340px] mx-auto font-normal mt-2">
              Choose something strong that you haven't used before.
            </p>
          </div>

          <form @submit.prevent="onResetPassword" class="w-full space-y-4" novalidate>
            
            <!-- New Password -->
            <div class="flex flex-col gap-1.5 text-left">
              <label
                for="new-password"
                style="font-size:12px; font-weight:500; color:#57504A;"
              >New password</label>
              <div style="position:relative;">
                <input
                  id="new-password"
                  v-model="newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Create a new password"
                  autocomplete="new-password"
                  required
                  aria-describedby="strength-hint"
                  aria-required="true"
                  style="display:block; width:100%; height:44px; border-radius:10px; border:1.5px solid #E5DDD1; background:#fff; font-size:14px; color:#2B2622; padding:0 44px 0 14px; box-sizing:border-box; outline:none; transition:border-color 0.15s, box-shadow 0.15s;"
                  @focus="(e) => { (e.target as HTMLInputElement).style.borderColor='#E2673D'; (e.target as HTMLInputElement).style.boxShadow='0 0 0 3px #FBE4D9'; }"
                  @blur="(e) => { (e.target as HTMLInputElement).style.borderColor='#E5DDD1'; (e.target as HTMLInputElement).style.boxShadow='none'; }"
                />
                <button
                  type="button"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                  style="position:absolute; top:0; bottom:0; right:0; width:40px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; cursor:pointer; color:#B5A695;"
                >
                  <EyeOff v-if="!showPassword" style="width:16px; height:16px;" />
                  <Eye v-else style="width:16px; height:16px;" />
                </button>
              </div>
              <!-- Live Password Rule Checklist -->
              <div
                v-if="newPassword.length > 0"
                id="strength-hint"
                aria-live="polite"
                style="margin-top:10px; padding:12px 14px; background:transparent; border:1.5px solid #D9CFC5; border-radius:10px; display:flex; flex-direction:column; gap:7px;"
              >
                <!-- Strength label row -->
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:2px;">
                  <span style="font-size:11px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; color:#948573;">Password strength</span>
                  <span
                    style="font-size:11px; font-weight:700; padding:2px 8px; border-radius:9999px; transition:background 0.25s, color 0.25s;"
                    :style="{
                      backgroundColor: strengthHex + '22',
                      color: strengthHex
                    }"
                  >{{ passwordStrengthText }}</span>
                </div>

                <!-- Rule rows -->
                <div
                  v-for="rule in passwordRules"
                  :key="rule.key"
                  style="display:flex; align-items:center; gap:8px; transition:opacity 0.2s;"
                >
                  <!-- Icon circle -->
                  <span
                    style="width:18px; height:18px; border-radius:9999px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background-color 0.25s;"
                    :style="{ backgroundColor: rule.passed ? '#17B26A22' : '#E5DDD1' }"
                  >
                    <!-- Checkmark SVG -->
                    <svg v-if="rule.passed" viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#17B26A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 6.5l2.5 2.5 5.5-5.5" />
                    </svg>
                    <!-- Dot SVG -->
                    <svg v-else viewBox="0 0 12 12" width="6" height="6" fill="#B5A695">
                      <circle cx="6" cy="6" r="3" />
                    </svg>
                  </span>

                  <!-- Label -->
                  <span
                    style="font-size:12px; transition:color 0.25s; line-height:1.4;"
                    :style="{ color: rule.passed ? '#2B2622' : '#948573', fontWeight: rule.passed ? '500' : '400' }"
                  >{{ rule.label }}</span>
                </div>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="flex flex-col gap-1.5 text-left">
              <label
                for="confirm-password"
                style="font-size:12px; font-weight:500; color:#57504A;"
              >Confirm new password</label>
              <div style="position:relative;">
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
                  style="display:block; width:100%; height:44px; border-radius:10px; background:#fff; font-size:14px; color:#2B2622; padding:0 44px 0 14px; box-sizing:border-box; outline:none; transition:border-color 0.15s, box-shadow 0.15s;"
                  :style="{
                    border: confirmMismatch ? '1.5px solid #E2673D' : '1.5px solid #E5DDD1',
                    boxShadow: confirmMismatch ? '0 0 0 3px #FBE4D9' : 'none'
                  }"
                />
                <button
                  type="button"
                  :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                  @click="showConfirmPassword = !showConfirmPassword"
                  style="position:absolute; top:0; bottom:0; right:0; width:40px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; cursor:pointer; color:#B5A695;"
                >
                  <EyeOff v-if="!showConfirmPassword" style="width:16px; height:16px;" />
                  <Eye v-else style="width:16px; height:16px;" />
                </button>
              </div>
              <!-- Live mismatch error -->
              <div
                id="confirm-error"
                role="alert"
                aria-live="polite"
                style="min-height:20px; margin-top:2px;"
              >
                <p v-if="confirmMismatch" style="font-size:12px; color:#E2673D; display:flex; align-items:center; gap:4px; margin:0;">
                  <AlertCircle style="width:13px; height:13px; flex-shrink:0;" />
                  Passwords do not match
                </p>
              </div>
            </div>

            <div style="padding-top:8px;">
              <Button
                type="submit"
                :disabled="confirmMismatch"
                class="w-full h-[46px] bg-[#E2673D] hover:bg-[#C9552F] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] shadow-sm transition-all duration-150 flex items-center justify-center tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset password
              </Button>
            </div>
            
          </form>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full py-5 text-center text-[12px] text-[#B5A695]">
      <p>© 2025 CraftCV. Thoughtfully crafted for professional careers.</p>
    </footer>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, KeyRound, Eye, EyeOff, AlertCircle, Check } from '@lucide/vue'

const router = useRouter()

const step = ref(1)
const otp = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])

// Step 3 state
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordError = ref('')

// Live check: are the two passwords mismatched (only show after confirm has content)
const confirmMismatch = computed(() =>
  confirmPassword.value.length > 0 && newPassword.value !== confirmPassword.value
)

// Individual password rule definitions with live pass/fail state
const passwordRules = computed(() => {
  const pw = newPassword.value
  const commonPatterns = /(123|abc|qwerty|password|letmein|admin|iloveyou|welcome)/i
  return [
    {
      key: 'length',
      label: 'At least 8 characters (16+ is best)',
      passed: pw.length >= 8
    },
    {
      key: 'uppercase',
      label: 'Contains an uppercase letter (A–Z)',
      passed: /[A-Z]/.test(pw)
    },
    {
      key: 'lowercase',
      label: 'Contains a lowercase letter (a–z)',
      passed: /[a-z]/.test(pw)
    },
    {
      key: 'number',
      label: 'Contains a number (0–9)',
      passed: /[0-9]/.test(pw)
    },
    {
      key: 'special',
      label: 'Contains a special character (!@#$%…)',
      passed: /[^A-Za-z0-9]/.test(pw)
    },
    {
      key: 'unpredictable',
      label: 'No common words or sequences',
      passed: pw.length > 0 && !commonPatterns.test(pw) && !/^(.+)\1+$/.test(pw)
    }
  ]
})

const passwordStrength = computed(() => {
  if (!newPassword.value) return 0
  return passwordRules.value.filter(r => r.passed).length // max 6
})

const passwordStrengthText = computed(() => {
  const s = passwordStrength.value
  if (s === 0) return ''
  if (s <= 2) return 'Weak'
  if (s <= 4) return 'Fair'
  if (s === 5) return 'Good'
  if (s === 6) return 'Strong'
  return ''
})

const strengthHex = computed(() => {
  const s = passwordStrength.value
  if (s <= 2) return '#E2673D' // Red/Orange — Weak
  if (s <= 4) return '#F5B056' // Amber — Fair
  return '#17B26A'             // Green — Good/Strong
})

// Handle single character typing and moving focus forward
function handleOtpInput(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  if (value) {
    // only keep the last typed character
    otp.value[index] = value.substring(value.length - 1)
    
    // move focus to next input if we're not at the end
    if (index < 5) {
      otpInputs.value[index + 1]?.focus()
    }
  }
}

// Handle backspace moving focus backward
function handleOtpKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace' && !otp.value[index] && index > 0) {
    // If the box is empty and backspace is pressed, go back one and clear it
    otp.value[index - 1] = ''
    otpInputs.value[index - 1]?.focus()
  }
}

// Handle pasting a full 6-digit code
function handleOtpPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pastedData = event.clipboardData?.getData('text')
  if (!pastedData) return
  
  const numbers = pastedData.replace(/\D/g, '').substring(0, 6).split('')
  for (let i = 0; i < numbers.length; i++) {
    otp.value[i] = numbers[i]
  }
  
  // Focus the next empty box, or the last box
  const nextFocusIndex = Math.min(numbers.length, 5)
  otpInputs.value[nextFocusIndex]?.focus()
}

function onSendCode() {
  console.log("Send code clicked! Progressing to Step 2...")
  step.value = 2
}

function onVerifyCode() {
  const fullCode = otp.value.join('')
  console.log("Verify code clicked with code:", fullCode)
  step.value = 3
}

function onResendCode() {
  console.log("Resend code clicked!")
}

function onResetPassword() {
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Passwords do not match.'
    return
  }
  passwordError.value = ''
  console.log('Reset password clicked!')
  // router.push('/auth/login')
}
</script>
