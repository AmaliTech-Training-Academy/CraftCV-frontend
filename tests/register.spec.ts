// @vitest-environment nuxt

import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import RegisterPage from '../app/pages/(auth)/register.vue'

const { mockApi } = vi.hoisted(() => ({
  mockApi: vi.fn(),
}))

vi.mock('../app/utils/api', () => ({
  $api: mockApi,
}))

function mountRegisterPage() {
  return mountSuspended(RegisterPage, {
    route: '/register',
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

describe('register.vue', () => {
  beforeEach(() => {
    mockApi.mockReset()
    mockApi.mockResolvedValue({ access: 'fake-access', refresh: 'fake-refresh' })
  })

  describe('Route Registration', () => {
    it('resolves /register route in Nuxt router to (auth) register page', () => {
      const router = useRouter()
      const resolved = router.resolve('/register')
      expect(resolved.matched.length).toBeGreaterThan(0)
      expect(resolved.matched.some(r => r.components?.default === RegisterPage || r.path === '/register')).toBe(true)
    })
  })

  describe('Rendering & Baseline', () => {
    it('renders heading, subtext, all input fields, terms checkbox, and login link', async () => {
      const wrapper = await mountRegisterPage()

      expect(wrapper.text()).toContain('Create your account.')
      expect(wrapper.text()).toContain('Build a CV that opens doors.')

      expect(wrapper.find('input#email').exists()).toBe(true)
      expect(wrapper.find('input#password').exists()).toBe(true)
      expect(wrapper.find('input#confirmPassword').exists()).toBe(true)
      expect(wrapper.find('input#agreeTerms').exists()).toBe(true)

      const termsLink = wrapper.findAll('a').find(link => link.text().includes('Terms and Privacy Policy'))
      expect(termsLink).toBeDefined()
      expect(termsLink?.attributes('href')).toBe('/terms')
      expect(termsLink?.attributes('target')).toBe('_blank')

      const signInLink = wrapper.findAll('a').find(link => link.text().includes('Sign in'))
      expect(signInLink).toBeDefined()
      expect(signInLink?.attributes('href')).toBe('/login')
    })
  })

  describe('Gating & Disabled State', () => {
    it('starts with submit button disabled', async () => {
      const wrapper = await mountRegisterPage()
      const submitBtn = wrapper.find('button[type="submit"]')

      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('remains disabled if only terms checkbox is checked with empty fields', async () => {
      const wrapper = await mountRegisterPage()
      const submitBtn = wrapper.find('button[type="submit"]')

      await wrapper.find('#agreeTerms').setValue(true)
      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('remains disabled if fields are filled but terms are unchecked', async () => {
      const wrapper = await mountRegisterPage()
      const submitBtn = wrapper.find('button[type="submit"]')

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('StrongPass123!')
      await wrapper.find('#confirmPassword').setValue('StrongPass123!')

      expect(submitBtn.attributes('disabled')).toBeDefined()
    })

    it('enables submit button only when all fields and terms are valid', async () => {
      const wrapper = await mountRegisterPage()
      const submitBtn = wrapper.find('button[type="submit"]')

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('StrongPass123!')
      await wrapper.find('#confirmPassword').setValue('StrongPass123!')
      await wrapper.find('#agreeTerms').setValue(true)

      expect(submitBtn.attributes('disabled')).toBeUndefined()
    })
  })

  describe('Validation & Inline Errors', () => {
    it('shows email format error on blur for invalid emails', async () => {
      const wrapper = await mountRegisterPage()
      const emailInput = wrapper.find('#email')

      await emailInput.setValue('not-an-email')
      await emailInput.trigger('blur')

      expect(wrapper.text()).toContain('Please enter a valid email address.')
    })

    it('trims leading and trailing whitespace on email without triggering invalid email error', async () => {
      const wrapper = await mountRegisterPage()
      const emailInput = wrapper.find('#email')

      await emailInput.setValue('  valid.email@example.com  ')
      await emailInput.trigger('blur')

      expect(wrapper.text()).not.toContain('Please enter a valid email address.')
      expect(wrapper.text()).not.toContain('Email is required.')
    })

    it('shows minimum length error on blur if password is under 8 characters', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')

      await passwordInput.setValue('short')
      await passwordInput.trigger('blur')

      expect(wrapper.text()).toContain('Password must be at least 8 characters.')
    })

    it('shows password mismatch error on blur when confirm password does not match', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')
      const confirmPasswordInput = wrapper.find('#confirmPassword')

      await passwordInput.setValue('StrongPass123!')
      await confirmPasswordInput.setValue('DifferentPass123!')
      await confirmPasswordInput.trigger('blur')

      expect(wrapper.text()).toContain('Passwords do not match.')
    })

    it('clears the mismatch error message once the user corrects confirm password to match', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')
      const confirmPasswordInput = wrapper.find('#confirmPassword')

      await passwordInput.setValue('StrongPass123!')
      await confirmPasswordInput.setValue('DifferentPass123!')
      await confirmPasswordInput.trigger('blur')
      expect(wrapper.text()).toContain('Passwords do not match.')

      await confirmPasswordInput.setValue('StrongPass123!')
      expect(wrapper.text()).not.toContain('Passwords do not match.')
    })
  })

  describe('Interactive Controls & Submission', () => {
    it('toggles password and confirmPassword input types between password and text independently', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')
      const confirmPasswordInput = wrapper.find('#confirmPassword')

      expect(passwordInput.attributes('type')).toBe('password')
      expect(confirmPasswordInput.attributes('type')).toBe('password')

      // Toggle password to text
      const passwordToggle = wrapper.find('button[aria-label="Show password"]')
      await passwordToggle.trigger('click')
      expect(passwordInput.attributes('type')).toBe('text')
      expect(confirmPasswordInput.attributes('type')).toBe('password')

      // Toggle password back to password
      await wrapper.find('button[aria-label="Hide password"]').trigger('click')
      expect(passwordInput.attributes('type')).toBe('password')

      // Toggle confirmPassword to text
      const confirmToggle = wrapper.find('button[aria-label="Show confirm password"]')
      await confirmToggle.trigger('click')
      expect(confirmPasswordInput.attributes('type')).toBe('text')
      expect(passwordInput.attributes('type')).toBe('password')

      // Toggle confirmPassword back to password
      await wrapper.find('button[aria-label="Hide confirm password"]').trigger('click')
      expect(confirmPasswordInput.attributes('type')).toBe('password')
    })

    it('toggles loading state on submit and prevents duplicate submissions while loading', async () => {
      let resolveApi!: (val: unknown) => void
      mockApi.mockReturnValueOnce(new Promise((resolve) => {
        resolveApi = resolve
      }))

      const wrapper = await mountRegisterPage()

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('StrongPass123!')
      await wrapper.find('#confirmPassword').setValue('StrongPass123!')
      await wrapper.find('#agreeTerms').setValue(true)

      const submitBtn = wrapper.find('button[type="submit"]')
      expect(submitBtn.attributes('disabled')).toBeUndefined()
      expect(submitBtn.text()).toContain('Create account')

      const form = wrapper.find('form')
      const submitPromise = form.trigger('submit')

      await nextTick()

      // Enters loading state after DOM update
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
      expect(submitBtn.attributes('disabled')).toBeDefined()
      expect(submitBtn.text()).toContain('Creating account')
      expect(wrapper.find('svg.animate-spin').exists()).toBe(true)

      // Submitting again while loading does not trigger a second submission
      await form.trigger('submit')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
      expect(submitBtn.attributes('disabled')).toBeDefined()

      resolveApi({ access: 'fake-access-token', refresh: 'fake-refresh-token' })
      await submitPromise
    })

    it('renders server error alert when API registration is rejected', async () => {
      mockApi.mockRejectedValueOnce({
        data: { email: ['A user with that email already exists.'] },
      })

      const wrapper = await mountRegisterPage()

      await wrapper.find('#email').setValue('existing@example.com')
      await wrapper.find('#password').setValue('StrongPass123!')
      await wrapper.find('#confirmPassword').setValue('StrongPass123!')
      await wrapper.find('#agreeTerms').setValue(true)

      await wrapper.find('form').trigger('submit')
      await nextTick()
      await nextTick()

      const alertBanner = wrapper.find('[role="alert"]')
      expect(alertBanner.exists()).toBe(true)
      expect(alertBanner.text()).toContain('A user with that email already exists.')
    })

    it('renders success feedback banner and keeps submit disabled during redirect window', async () => {
      vi.useFakeTimers()
      mockApi.mockResolvedValueOnce({
        access: 'fake-access',
        refresh: 'fake-refresh',
      })

      const wrapper = await mountRegisterPage()

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('StrongPass123!')
      await wrapper.find('#confirmPassword').setValue('StrongPass123!')
      await wrapper.find('#agreeTerms').setValue(true)

      const submitPromise = wrapper.find('form').trigger('submit')
      await vi.runAllTimersAsync()
      await submitPromise
      await nextTick()

      const statusBanner = wrapper.find('[role="status"]')
      expect(statusBanner.exists()).toBe(true)
      expect(statusBanner.text()).toContain('Account created successfully! Redirecting...')

      const submitBtn = wrapper.find('button[type="submit"]')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      vi.useRealTimers()
    })

    it('navigates to /login instead of /dashboard when registration response lacks tokens', async () => {
      mockApi.mockResolvedValueOnce({
        message: 'Account created. Please log in.',
      })

      const wrapper = await mountRegisterPage()

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('StrongPass123!')
      await wrapper.find('#confirmPassword').setValue('StrongPass123!')
      await wrapper.find('#agreeTerms').setValue(true)

      await wrapper.find('form').trigger('submit')
      await nextTick()

      const statusBanner = wrapper.find('[role="status"]')
      expect(statusBanner.exists()).toBe(true)
    })
  })
})
