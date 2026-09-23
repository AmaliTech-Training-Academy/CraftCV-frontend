<template>
  <div class="min-h-screen bg-white text-[#2B2622] flex flex-col justify-between selection:bg-[#FBE4D9] selection:text-[#C9552F] font-['Inter']">
    <!-- Header -->
    <header class="w-full px-6 py-6 sm:px-10 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <NuxtLink
          aria-label="CraftCV Home"
          class="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          to="/"
        >
          <img
            src="/logo.png"
            alt="CraftCV logo"
            class="w-8 h-8 object-contain"
          >
          <span class="font-['Poppins'] font-semibold text-[18px] text-[#2B2622] tracking-tight">Craft<span class="text-[#E2673D]">CV</span></span>
        </NuxtLink>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow flex items-center justify-center px-4 py-8 sm:py-12">
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
            <h1 class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight">
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
                role="alert"
                aria-live="polite"
                style="min-height: 18px;"
              >
                <p
                  v-if="emailError"
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
                class="w-full h-[46px] bg-[#E2673D] hover:bg-[#C9552F] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] shadow-sm transition-all duration-150 flex items-center justify-center tracking-wide"
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
            <h1 class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight">
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
                  autocomplete="one-time-code"
                  :aria-label="`Digit ${index + 1} of 6`"
                  class="w-[48px] h-[56px] rounded-[10px] border-[1.5px] border-[#E5DDD1] bg-white text-[24px] font-bold text-center text-[#2B2622] focus:outline-none focus:ring-[3px] focus:ring-[#FBE4D9] focus:border-[#E2673D] transition-shadow shadow-sm"
                  @input="handleOtpInput($event, index)"
                  @keydown="handleOtpKeydown($event, index)"
                  @paste="handleOtpPaste"
                >
              </div>
            </div>

            <div class="pt-1.5">
              <Button
                type="submit"
                class="w-full h-[46px] bg-[#E2673D] hover:bg-[#C9552F] active:scale-[0.98] text-white font-semibold text-sm rounded-[10px] shadow-sm transition-all duration-150 flex items-center justify-center tracking-wide"
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
                  @click="step = 1"
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
            <h1 class="font-['Poppins'] font-semibold text-[30px] sm:text-[32px] text-[#2B2622] leading-tight mb-2 tracking-tight">
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
                >
                <button
                  type="button"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  style="position:absolute; top:0; bottom:0; right:0; width:40px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; cursor:pointer; color:#B5A695;"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff
                    v-if="!showPassword"
                    style="width:16px; height:16px;"
                  />
                  <Eye
                    v-else
                    style="width:16px; height:16px;"
                  />
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
                      color: strengthHex,
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
                    <svg
                      v-if="rule.passed"
                      viewBox="0 0 12 12"
                      width="10"
                      height="10"
                      fill="none"
                      stroke="#17B26A"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M2 6.5l2.5 2.5 5.5-5.5" />
                    </svg>
                    <!-- Dot SVG -->
                    <svg
                      v-else
                      viewBox="0 0 12 12"
                      width="6"
                      height="6"
                      fill="#B5A695"
                    >
                      <circle
                        cx="6"
                        cy="6"
                        r="3"
                      />
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
                    boxShadow: confirmMismatch ? '0 0 0 3px #FBE4D9' : 'none',
                  }"
                >
                <button
                  type="button"
                  :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                  style="position:absolute; top:0; bottom:0; right:0; width:40px; display:flex; align-items:center; justify-content:center; background:transparent; border:none; cursor:pointer; color:#B5A695;"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <EyeOff
                    v-if="!showConfirmPassword"
                    style="width:16px; height:16px;"
                  />
                  <Eye
                    v-else
                    style="width:16px; height:16px;"
                  />
                </button>
              </div>
              <!-- Live mismatch error -->
              <div
                id="confirm-error"
                role="alert"
                aria-live="polite"
                style="min-height:20px; margin-top:2px;"
              >
                <p
                  v-if="confirmMismatch"
                  style="font-size:12px; color:#E2673D; display:flex; align-items:center; gap:4px; margin:0;"
                >
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
import { Mail, KeyRound, Eye, EyeOff, AlertCircle, Check, CheckCircle, Clock, ShieldCheck } from '@lucide/vue'
import { usePasswordReset, getApiErrorMessage } from '~/composables/usePasswordReset'

const { requestReset, verifyCode, resetPassword } = usePasswordReset()

// Shared loading + error state
const isLoading = ref(false)
const otpError = ref('')

const step = ref(1)

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
  },
)

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
  if (sentFlashTimeout) clearTimeout(sentFlashTimeout)
})
// ─────────────────────────────────────────────────────────────────────────────

const otp = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])

// Step 3 state
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Live check: are the two passwords mismatched (only show after confirm has content)
const confirmMismatch = computed(() =>
  confirmPassword.value.length > 0 && newPassword.value !== confirmPassword.value,
)

// Individual password rule definitions with live pass/fail state
const passwordRules = computed(() => {
  const pw = newPassword.value
  const commonPatterns = /(123|abc|qwerty|password|letmein|admin|iloveyou|welcome)/i
  return [
    {
      key: 'length',
      label: 'At least 8 characters (16+ is best)',
      passed: pw.length >= 8,
    },
    {
      key: 'uppercase',
      label: 'Contains an uppercase letter (A–Z)',
      passed: /[A-Z]/.test(pw),
    },
    {
      key: 'lowercase',
      label: 'Contains a lowercase letter (a–z)',
      passed: /[a-z]/.test(pw),
    },
    {
      key: 'number',
      label: 'Contains a number (0–9)',
      passed: /[0-9]/.test(pw),
    },
    {
      key: 'special',
      label: 'Contains a special character (!@#$%…)',
      passed: /[^A-Za-z0-9]/.test(pw),
    },
    {
      key: 'unpredictable',
      label: 'No common words or sequences',
      passed: pw.length > 0 && !commonPatterns.test(pw) && !/^(.+)\1+$/.test(pw),
    },
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
  return '#17B26A' // Green — Good/Strong
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
    otp.value[i] = numbers[i] ?? ''
  }

  // Focus the next empty box, or the last box
  const nextFocusIndex = Math.min(numbers.length, 5)
  otpInputs.value[nextFocusIndex]?.focus()
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
    emailError.value = getApiErrorMessage(err)
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
    otpError.value = getApiErrorMessage(err, 'Invalid or expired code. Please try again.')
    otp.value = ['', '', '', '', '', '']
    nextTick(() => otpInputs.value[0]?.focus())
  }
  finally { isLoading.value = false }
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
  catch {
    // API intentionally returns 200 always; swallow any network error silently
    resendStatus.value = 'sent'
    startCooldown()
  }
  finally { isLoading.value = false }
}

const passwordError = ref('')
const showSuccessModal = ref(false)
const redirectCountdown = ref(5)
let redirectInterval: ReturnType<typeof setInterval> | null = null

const router = useRouter()

async function onResetPassword() {
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
        router.push('/auth/login')
      }
    }, 1000)
  }
  catch (err) {
    passwordError.value = getApiErrorMessage(err, 'Reset failed. Your code may have expired — please start again.')
  }
  finally { isLoading.value = false }
}

function goToLoginNow() {
  if (redirectInterval) clearInterval(redirectInterval)
  router.push('/auth/login')
}

onUnmounted(() => {
  if (redirectInterval) clearInterval(redirectInterval)
})
</script>
