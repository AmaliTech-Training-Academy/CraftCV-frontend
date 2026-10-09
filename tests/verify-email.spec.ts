// @vitest-environment nuxt

import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import VerifyEmailPage from '../app/pages/(auth)/verify-email.vue'

const { mockApi, mockNavigateTo } = vi.hoisted(() => ({
  mockApi: vi.fn(),
  mockNavigateTo: vi.fn(),
}))

mockNuxtImport('navigateTo', () => mockNavigateTo)

vi.mock('../app/utils/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../app/utils/api')>()
  return {
    ...actual,
    $api: mockApi,
  }
})

function mountVerifyEmailPage(query: Record<string, string> = { email: 'test@example.com' }) {
  return mountSuspended(VerifyEmailPage, {
    route: {
      path: '/verify-email',
      query,
    },
    global: {
      stubs: {
        NuxtLink: {
          template: '<a :href="to?.path || to"><slot /></a>',
          props: ['to'],
        },
      },
    },
  })
}

describe('verify-email.vue', () => {
  beforeEach(() => {
    mockApi.mockReset()
    mockNavigateTo.mockReset()
    const token = useCookie('accessToken')
    token.value = null
    const user = useCookie('authUser')
    user.value = null
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Route Guard & Initial State', () => {
    it('redirects to /register if email query parameter is missing', async () => {
      await mountVerifyEmailPage({})
      expect(mockNavigateTo).toHaveBeenCalledWith('/register', { replace: true })
    })

    it('redirects to /register if email query parameter is empty string', async () => {
      await mountVerifyEmailPage({ email: '' })
      expect(mockNavigateTo).toHaveBeenCalledWith('/register', { replace: true })
    })

    it('renders heading, email pill, and 6 OTP inputs when email is provided', async () => {
      const wrapper = await mountVerifyEmailPage({ email: 'hello@domain.com' })

      expect(wrapper.text()).toContain('Check your email')
      expect(wrapper.find('#email-pill').text()).toContain('hello@domain.com')

      const inputs = wrapper.findAll('input[type="text"]')
      expect(inputs.length).toBe(6)

      const submitBtn = wrapper.find('button[type="submit"]')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('renders unverified notice banner when unverified=true query param is present', async () => {
      const wrapper = await mountVerifyEmailPage({ email: 'unverified@domain.com', unverified: 'true' })

      const notice = wrapper.find('#unverified-notice')
      expect(notice.exists()).toBe(true)
      expect(notice.text()).toContain('Your account is not verified yet.')
    })

    it('renders "Use a different email" link linking to /register with query email', async () => {
      const wrapper = await mountVerifyEmailPage({ email: 'hello@domain.com' })
      const link = wrapper.find('#change-email-link')
      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Use a different email')
    })
  })

  describe('OTP Inputs & Interaction', () => {
    it('updates digits as user types and keeps submit disabled until all 6 are filled', async () => {
      const wrapper = await mountVerifyEmailPage()
      const inputs = wrapper.findAll('input[type="text"]')
      const submitBtn = wrapper.find('button[type="submit"]')

      await inputs[0]!.setValue('1')
      await inputs[1]!.setValue('2')
      await inputs[2]!.setValue('3')

      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      await inputs[3]!.setValue('4')
      await inputs[4]!.setValue('5')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      mockApi.mockReturnValue(new Promise(() => {}))
      await inputs[5]!.setValue('6')
      await nextTick()
      expect(wrapper.text()).toContain('Verifying code...')
    })

    it('handles pasting 6-digit code correctly', async () => {
      const wrapper = await mountVerifyEmailPage()
      const inputs = wrapper.findAll('input[type="text"]')

      const pasteEvent = {
        preventDefault: vi.fn(),
        clipboardData: {
          getData: () => '123456',
        },
      }

      await inputs[0]!.trigger('paste', pasteEvent)
      await nextTick()

      inputs.forEach((input, index) => {
        expect((input.element as HTMLInputElement).value).toBe(String(index + 1))
      })
    })

    it('handles backspace navigation correctly when current box is empty', async () => {
      const wrapper = await mountVerifyEmailPage()
      const inputs = wrapper.findAll('input[type="text"]')

      await inputs[0]!.setValue('9')
      await inputs[1]!.setValue('')

      await inputs[1]!.trigger('keydown', { key: 'Backspace' })
      await nextTick()

      expect((inputs[0]!.element as HTMLInputElement).value).toBe('')
    })

    it('blocks non-numeric keys from keydown events', async () => {
      const wrapper = await mountVerifyEmailPage()
      const input = wrapper.findAll('input[type="text"]')[0]!

      const preventDefaultLetter = vi.fn()
      await input.trigger('keydown', { key: 'a', preventDefault: preventDefaultLetter })
      expect(preventDefaultLetter).toHaveBeenCalled()

      const preventDefaultSpace = vi.fn()
      await input.trigger('keydown', { key: ' ', preventDefault: preventDefaultSpace })
      expect(preventDefaultSpace).toHaveBeenCalled()

      const preventDefaultSymbol = vi.fn()
      await input.trigger('keydown', { key: '!', preventDefault: preventDefaultSymbol })
      expect(preventDefaultSymbol).toHaveBeenCalled()

      const preventDefaultDigit = vi.fn()
      await input.trigger('keydown', { key: '7', preventDefault: preventDefaultDigit })
      expect(preventDefaultDigit).not.toHaveBeenCalled()
    })

    it('discards non-numeric characters on input event', async () => {
      const wrapper = await mountVerifyEmailPage()
      const input = wrapper.findAll('input[type="text"]')[0]!

      // Simulate entering a letter
      await input.setValue('x')
      await nextTick()

      expect((input.element as HTMLInputElement).value).toBe('')

      const submitBtn = wrapper.find('button[type="submit"]')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('ignores paste when content contains no numeric digits', async () => {
      const wrapper = await mountVerifyEmailPage()
      const inputs = wrapper.findAll('input[type="text"]')

      const pasteEvent = {
        preventDefault: vi.fn(),
        clipboardData: {
          getData: () => 'abcdef',
        },
      }

      await inputs[0]!.trigger('paste', pasteEvent)
      await nextTick()

      inputs.forEach((input) => {
        expect((input.element as HTMLInputElement).value).toBe('')
      })
    })
  })

  describe('Verification & Submission', () => {
    it('dispatches POST /api/auth/verify-email/, saves session cookies, and redirects to /dashboard upon success', async () => {
      mockApi.mockResolvedValueOnce({
        accessToken: 'valid-access-token-123',
        user: { id: 'u1', email: 'test@example.com' },
        message: 'Email verified successfully.',
      })

      const wrapper = await mountVerifyEmailPage({ email: 'test@example.com' })
      const inputs = wrapper.findAll('input[type="text"]')

      for (let i = 0; i < 6; i++) {
        await inputs[i]!.setValue(String(i + 1))
      }
      await nextTick()
      await flushPromises()

      expect(mockApi).toHaveBeenCalledWith('/auth/verify-email/', {
        method: 'POST',
        body: {
          email: 'test@example.com',
          code: '123456',
        },
        unauthenticated: true,
      })

      const tokenCookie = useCookie('accessToken')
      const userCookie = useCookie<{ id: string, email: string } | null>('authUser')
      expect(tokenCookie.value).toBe('valid-access-token-123')
      expect(userCookie.value?.email).toBe('test@example.com')

      expect(wrapper.find('#verify-success').text()).toContain('Email verified successfully! Redirecting...')
      expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard')
    })

    it('handles verification failure: displays backend error message and prevents redirect to /dashboard', async () => {
      mockApi.mockRejectedValueOnce({
        data: { message: 'Invalid or expired verification code' },
      })

      const wrapper = await mountVerifyEmailPage({ email: 'test@example.com' })
      const inputs = wrapper.findAll('input[type="text"]')

      for (let i = 0; i < 6; i++) {
        await inputs[i]!.setValue('9')
      }
      await nextTick()
      await flushPromises()

      expect(mockNavigateTo).not.toHaveBeenCalledWith('/dashboard')
      expect(wrapper.find('#verify-error').text()).toContain('Invalid or expired verification code')

      const submitBtn = wrapper.find('button[type="submit"]')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)
    })
  })

  describe('Resend Cooldown', () => {
    it('initializes with a cooldown countdown and counts down every second', async () => {
      vi.useFakeTimers()
      const wrapper = await mountVerifyEmailPage()

      expect(wrapper.find('#resend-cooldown').exists()).toBe(true)
      expect(wrapper.find('#resend-cooldown').text()).toContain('Resend in 60s')

      await vi.advanceTimersByTimeAsync(1000)
      expect(wrapper.find('#resend-cooldown').text()).toContain('Resend in 59s')

      await vi.advanceTimersByTimeAsync(59000)
      expect(wrapper.find('#resend-cooldown').exists()).toBe(false)
      expect(wrapper.find('#resend-btn').exists()).toBe(true)
    })

    it('triggers resend when button is clicked after cooldown expires', async () => {
      vi.useFakeTimers()
      const wrapper = await mountVerifyEmailPage()

      // Advance past 60s cooldown
      await vi.advanceTimersByTimeAsync(60000)
      expect(wrapper.find('#resend-btn').exists()).toBe(true)

      const resendBtn = wrapper.find('#resend-btn')
      const resendPromise = resendBtn.trigger('click')

      await vi.advanceTimersByTimeAsync(500)
      await resendPromise
      await flushPromises()

      // Cooldown restarts
      expect(wrapper.text()).toContain('Code sent! Check your inbox.')
    })
  })
})
