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

vi.mock('~/composables/usePasswordReset', () => {
  return {
    usePasswordReset: () => ({
      requestReset: mockRequestReset,
      verifyCode: mockVerifyCode,
      resetPassword: mockResetPassword,
    }),
    getApiErrorMessage: (err: unknown, fallback = 'Error') => fallback,
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
      await wrapper.find('#new-password').setValue('Short1!')
      await wrapper.find('#new-password').trigger('blur')

      await wrapper.find('#new-password').setValue('StrongPass123!')
      await wrapper.find('#confirm-password').setValue('Mismatch123!')
      await wrapper.find('#confirm-password').trigger('blur')
      expect(wrapper.text()).toContain('Passwords do not match')
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

      // Submit new password
      await wrapper.find('#new-password').setValue('StrongPass123!')
      await wrapper.find('#confirm-password').setValue('StrongPass123!')

      mockResetPassword.mockResolvedValueOnce(undefined)

      vi.useFakeTimers()
      await wrapper.find('form').trigger('submit.prevent')

      await nextTick()
      await flushPromises()

      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com', '111111', 'StrongPass123!')
      expect(document.body.innerHTML).toContain('Your password has been successfully reset.')

      // Verify countdown starts and redirects after 5 seconds
      expect(mockPush).not.toHaveBeenCalled()

      // Advance time by 5 seconds
      await vi.advanceTimersByTimeAsync(5000)

      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })
})
