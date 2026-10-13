// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import ForgotPasswordPage from '../app/pages/(auth)/forgot-password.vue'

const { mockRequestReset, mockVerifyCode, mockResetPassword } = vi.hoisted(() => ({
  mockRequestReset: vi.fn(),
  mockVerifyCode: vi.fn(),
  mockResetPassword: vi.fn(),
}))

vi.mock('~/composables/usePasswordReset', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../app/composables/usePasswordReset')>()
  return {
    ...actual,
    usePasswordReset: () => ({
      requestReset: mockRequestReset,
      verifyCode: mockVerifyCode,
      resetPassword: mockResetPassword,
    }),
  }
})

const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }))
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
    }),
  }
})

function mountPage() {
  return mountSuspended(ForgotPasswordPage, {
    route: '/forgot-password',
    global: {
      stubs: {
        NuxtLink: {
          template: '<a :href="to"><slot /></a>',
          props: ['to'],
        },
      },
    },
  })
}

describe('forgot-password.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Step 1: Validation', () => {
    it('shows email format error on blur for invalid emails', async () => {
      const wrapper = await mountPage()
      const emailInput = wrapper.find('#email')

      await emailInput.setValue('not-an-email')
      await emailInput.trigger('blur')

      expect(wrapper.text()).toContain('Email address must include an @ symbol')
    })

    it('shows spaces error when email contains spaces', async () => {
      const wrapper = await mountPage()
      const emailInput = wrapper.find('#email')

      await emailInput.setValue('test @example.com')
      await emailInput.trigger('blur')

      expect(wrapper.text()).toContain('Email address must not contain spaces')
    })
  })

  describe('Step 2: OTP & Resend', () => {
    it('progresses to step 2 after successful email submission', async () => {
      const wrapper = await mountPage()

      await wrapper.find('#email').setValue('test@example.com')
      mockRequestReset.mockResolvedValueOnce(undefined)

      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises() // Wait for promises to resolve

      expect(mockRequestReset).toHaveBeenCalledWith('test@example.com')
      expect(wrapper.text()).toContain('Check your email')
    })

    it('blocks non-numeric keys and discards non-numeric inputs in OTP fields', async () => {
      const wrapper = await mountPage()

      await wrapper.find('#email').setValue('test@example.com')
      mockRequestReset.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const otpInputs = wrapper.findAll('input[inputmode="numeric"]')
      const firstInput = otpInputs[0]!

      const preventDefaultLetter = vi.fn()
      await firstInput.trigger('keydown', { key: 'b', preventDefault: preventDefaultLetter })
      expect(preventDefaultLetter).toHaveBeenCalled()

      const preventDefaultDigit = vi.fn()
      await firstInput.trigger('keydown', { key: '3', preventDefault: preventDefaultDigit })
      expect(preventDefaultDigit).not.toHaveBeenCalled()

      // Entering letter directly discards it
      await firstInput.setValue('z')
      await nextTick()
      expect((firstInput.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('Step 3: Password Guards', () => {
    it('progresses to step 3 and validates passwords', async () => {
      const wrapper = await mountPage()

      // Step 1 -> 2
      await wrapper.find('#email').setValue('test@example.com')
      mockRequestReset.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      // Step 2 -> 3
      // We can't easily trigger the 6 separate OTP inputs, so we simulate form submission
      // Wait, let's just find the OTP inputs and set them
      const otpInputs = wrapper.findAll('input[inputmode="numeric"]')
      // Fill out 6 inputs
      for (let i = 0; i < 6; i++) {
        const input = otpInputs[i]
        if (input) {
          await input.setValue('1')
        }
      }

      mockVerifyCode.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')

      await nextTick()
      await flushPromises()

      expect(mockVerifyCode).toHaveBeenCalledWith('test@example.com', '111111')
      expect(wrapper.text()).toContain('Set a new password')

      // Step 3 Validation
      const submitBtn = wrapper.find('button[type="submit"]')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      // Short input (<8 chars) triggers minimum length error on blur
      await wrapper.find('#new-password').setValue('Short1')
      await wrapper.find('#new-password').trigger('blur')
      expect(wrapper.text()).toContain('Password must be at least 8 characters.')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      // Mismatch
      await wrapper.find('#new-password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirm-password').setValue('Mismatch123!')
      await wrapper.find('#confirm-password').trigger('blur')
      expect(wrapper.text()).toContain('Passwords do not match')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      // Valid matching password (>= 8 chars) enables submit button
      await wrapper.find('#confirm-password').setValue('P@ssw0rd2026!')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)
    })

    it('displays backend validation error under password field', async () => {
      const wrapper = await mountPage()

      // Setup to be on step 3
      await wrapper.find('#email').setValue('test@example.com')
      mockRequestReset.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const otpInputs = wrapper.findAll('input[inputmode="numeric"]')
      for (let i = 0; i < 6; i++) {
        const input = otpInputs[i]
        if (input) await input.setValue('1')
      }
      mockVerifyCode.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      // Enter valid password that backend rejects as too common
      await wrapper.find('#new-password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirm-password').setValue('P@ssw0rd2026!')

      mockResetPassword.mockRejectedValueOnce({
        data: {
          newPassword: ['This password is too common.'],
        },
      })

      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const inlineError = wrapper.find('#password-error')
      expect(inlineError.exists()).toBe(true)
      expect(inlineError.text()).toContain('This password is too common.')

      const alertBanner = wrapper.find('[role="alert"].bg-red-50')
      expect(alertBanner.exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Reset failed')
      expect(document.body.innerHTML).not.toContain('Your password has been successfully reset.')
    })

    it('displays dynamic password strength feedback with corresponding colors for weak, medium, and strong inputs', async () => {
      const wrapper = await mountPage()

      // Setup to be on step 3
      await wrapper.find('#email').setValue('test@example.com')
      mockRequestReset.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const otpInputs = wrapper.findAll('input[inputmode="numeric"]')
      for (let i = 0; i < 6; i++) {
        const input = otpInputs[i]
        if (input) await input.setValue('1')
      }
      mockVerifyCode.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const passwordInput = wrapper.find('#new-password')

      // 1. Weak input (< 8 chars)
      await passwordInput.setValue('weak')
      await nextTick()
      const weakGuidance = wrapper.find('#password-guidance')
      expect(weakGuidance.exists()).toBe(true)
      expect(weakGuidance.attributes('role')).toBe('status')
      expect(weakGuidance.attributes('aria-live')).toBe('polite')
      expect(weakGuidance.classes()).toContain('text-red-700')
      expect(weakGuidance.text()).toContain('[Weak]')
      expect(weakGuidance.text()).toContain('To make it stronger, add:')

      // 2. Medium input (meets length, lowercase, number, but missing special and uppercase)
      await passwordInput.setValue('password123')
      await nextTick()
      const medGuidance = wrapper.find('#password-guidance')
      expect(medGuidance.exists()).toBe(true)
      expect(medGuidance.classes()).toContain('text-amber-800')
      expect(medGuidance.text()).toContain('[Fair]')
      expect(medGuidance.text()).toContain('To make it stronger, add:')

      // 3. Strong input (meets all criteria)
      await passwordInput.setValue('P@ssw0rd2026!')
      await nextTick()
      const strongGuidance = wrapper.find('#password-guidance')
      expect(strongGuidance.exists()).toBe(true)
      expect(strongGuidance.classes()).toContain('text-emerald-800')
      expect(strongGuidance.text()).toContain('[Strong]')
      expect(strongGuidance.text()).toContain('Password is strong.')
    })

    it('shows inline error when confirm password field is blurred while empty', async () => {
      const wrapper = await mountPage()

      // Setup to be on step 3
      await wrapper.find('#email').setValue('test@example.com')
      mockRequestReset.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const otpInputs = wrapper.findAll('input[inputmode="numeric"]')
      for (let i = 0; i < 6; i++) {
        const input = otpInputs[i]
        if (input) await input.setValue('1')
      }
      mockVerifyCode.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const confirmInput = wrapper.find('#confirm-password')
      await confirmInput.trigger('blur')
      expect(wrapper.find('#confirm-error').text()).toContain('Please confirm your password.')

      // Typing in confirm password clears that empty error
      await confirmInput.setValue('P@ssw0rd2026!')
      await nextTick()
      expect(wrapper.find('#confirm-error').text()).not.toContain('Please confirm your password.')
    })

    it('surfaces top-level error banner when session or code has expired', async () => {
      const wrapper = await mountPage()

      // Setup to be on step 3
      await wrapper.find('#email').setValue('test@example.com')
      mockRequestReset.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const otpInputs = wrapper.findAll('input[inputmode="numeric"]')
      for (let i = 0; i < 6; i++) {
        const input = otpInputs[i]
        if (input) await input.setValue('1')
      }
      mockVerifyCode.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      await wrapper.find('#new-password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirm-password').setValue('P@ssw0rd2026!')

      mockResetPassword.mockRejectedValueOnce({
        data: {
          detail: 'Reset token has expired',
        },
      })

      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const alertBanner = wrapper.find('[role="alert"]')
      expect(alertBanner.exists()).toBe(true)
      expect(alertBanner.text()).toContain('Reset token has expired')
      expect(wrapper.find('#password-error').exists()).toBe(false)
    })
  })

  describe('Step 4: Redirect Behavior', () => {
    it('redirects to login automatically after success', async () => {
      const wrapper = await mountPage()

      // Setup to be on step 3
      await wrapper.find('#email').setValue('test@example.com')
      mockRequestReset.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      const otpInputs = wrapper.findAll('input[inputmode="numeric"]')
      for (let i = 0; i < 6; i++) {
        const input = otpInputs[i]
        if (input) await input.setValue('1')
      }
      mockVerifyCode.mockResolvedValueOnce(undefined)
      await wrapper.find('form').trigger('submit.prevent')
      await nextTick()
      await flushPromises()

      // Submit new password with all 6 rules passing
      await wrapper.find('#new-password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirm-password').setValue('P@ssw0rd2026!')

      mockResetPassword.mockResolvedValueOnce(undefined)

      vi.useFakeTimers()
      await wrapper.find('form').trigger('submit.prevent')

      await nextTick()
      await flushPromises()

      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com', '111111', 'P@ssw0rd2026!')
      expect(document.body.innerHTML).toContain('Your password has been successfully reset.')

      // Verify countdown starts and redirects after 5 seconds
      expect(mockPush).not.toHaveBeenCalled()

      // Advance time by 5 seconds
      await vi.advanceTimersByTimeAsync(5000)

      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
