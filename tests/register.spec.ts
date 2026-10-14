// @vitest-environment nuxt

import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import RegisterPage from '../app/pages/(auth)/register.vue'
import { Checkbox } from '../app/components/ui/checkbox'

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

async function checkTerms(wrapper: Awaited<ReturnType<typeof mountRegisterPage>>) {
  const checkboxComponent = wrapper.findComponent(Checkbox)
  if (checkboxComponent.exists()) {
    await checkboxComponent.setValue(true)
  }
  else {
    await wrapper.find('#agreeTerms').trigger('click')
  }
  await nextTick()
}

describe('register.vue', () => {
  beforeEach(() => {
    mockApi.mockReset()
    mockNavigateTo.mockReset()
    mockApi.mockResolvedValue({ accessToken: 'fake-access-token' })
    const token = useCookie('accessToken')
    token.value = null
    const user = useCookie('authUser')
    user.value = null
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
      expect(wrapper.find('#agreeTerms').exists()).toBe(true)
      expect(wrapper.find('#agreeTerms').attributes('aria-label')).toBe('I agree to the Terms and Privacy Policy')

      const termsLink = wrapper.findAll('a').find(link => link.text().includes('Terms and Privacy Policy'))
      expect(termsLink).toBeDefined()
      expect(termsLink?.attributes('href')).toBe('/terms')
      expect(termsLink?.attributes('target')).toBe('_blank')

      const signInLink = wrapper.findAll('a').find(link => link.text().includes('Sign in'))
      expect(signInLink).toBeDefined()
      expect(signInLink?.attributes('href')).toBe('/login')
    })
  })

  describe('Gating, Dimmed State & Click Validation', () => {
    it('starts with submit button visually dimmed (opacity-50) and disabled', async () => {
      const wrapper = await mountRegisterPage()
      const submitBtn = wrapper.find('button[type="submit"]')

      expect(submitBtn.classes()).toContain('opacity-50')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('shows validation error messages when form is submitted while fields are empty', async () => {
      const wrapper = await mountRegisterPage()

      await wrapper.find('form').trigger('submit')
      await nextTick()

      expect(wrapper.text()).toContain('Email is required.')
      expect(wrapper.text()).toContain('Password is required.')
      expect(wrapper.text()).toContain('Please confirm your password.')
      expect(wrapper.text()).toContain('You must agree to the terms to continue.')
    })

    it('remains visually dimmed if fields are filled but terms checkbox is unchecked', async () => {
      const wrapper = await mountRegisterPage()
      const submitBtn = wrapper.find('button[type="submit"]')

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirmPassword').setValue('P@ssw0rd2026!')

      expect(submitBtn.classes()).toContain('opacity-50')

      await wrapper.find('form').trigger('submit')
      await nextTick()

      expect(wrapper.text()).toContain('You must agree to the terms to continue.')
    })

    it('removes dimmed state (opacity-50) and enables submit button when all fields and terms checkbox are valid', async () => {
      const wrapper = await mountRegisterPage()
      const submitBtn = wrapper.find('button[type="submit"]')

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirmPassword').setValue('P@ssw0rd2026!')
      await checkTerms(wrapper)

      expect(submitBtn.classes()).not.toContain('opacity-50')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)
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

      await passwordInput.setValue('P@ssw0rd2026!')
      await confirmPasswordInput.setValue('DifferentPass123!')
      await confirmPasswordInput.trigger('blur')

      expect(wrapper.text()).toContain('Passwords do not match.')
    })

    it('clears the mismatch error message once the user corrects confirm password to match', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')
      const confirmPasswordInput = wrapper.find('#confirmPassword')

      await passwordInput.setValue('P@ssw0rd2026!')
      await confirmPasswordInput.setValue('DifferentPass123!')
      await confirmPasswordInput.trigger('blur')
      expect(wrapper.text()).toContain('Passwords do not match.')

      await confirmPasswordInput.setValue('P@ssw0rd2026!')
      expect(wrapper.text()).not.toContain('Passwords do not match.')
    })

    it('surfaces mismatch error inline under confirmPassword on submit and does not display top server alert', async () => {
      const wrapper = await mountRegisterPage()
      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirmPassword').setValue('DifferentPass123!')
      await checkTerms(wrapper)

      await wrapper.find('form').trigger('submit')
      await nextTick()

      expect(wrapper.find('#confirm-password-error').text()).toBe('Passwords do not match.')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
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
      await wrapper.find('#password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirmPassword').setValue('P@ssw0rd2026!')
      await checkTerms(wrapper)

      const submitBtn = wrapper.find('button[type="submit"]')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)
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
      await wrapper.find('#password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirmPassword').setValue('P@ssw0rd2026!')
      await checkTerms(wrapper)

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
        accessToken: 'fake-access-token',
      })

      const wrapper = await mountRegisterPage()

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirmPassword').setValue('P@ssw0rd2026!')
      await checkTerms(wrapper)

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

    it('renders please sign in message when registration response lacks tokens', async () => {
      vi.useFakeTimers()
      mockApi.mockResolvedValueOnce({
        message: 'Account created. Please log in.',
      })

      const wrapper = await mountRegisterPage()

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('P@ssw0rd2026!')
      await wrapper.find('#confirmPassword').setValue('P@ssw0rd2026!')
      await checkTerms(wrapper)

      const submitPromise = wrapper.find('form').trigger('submit')
      await vi.runAllTimersAsync()
      await submitPromise
      await nextTick()

      const statusBanner = wrapper.find('[role="status"]')
      expect(statusBanner.exists()).toBe(true)
      expect(statusBanner.text()).toContain('Account created! Please verify your email to continue.')

      vi.useRealTimers()
    })
  })

  describe('Hybrid Password Validation', () => {
    it('shows minimum length error on blur when under 8 characters', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')

      await passwordInput.setValue('short')
      await passwordInput.trigger('blur')

      expect(wrapper.find('#password-error').exists()).toBe(true)
      expect(wrapper.find('#password-error').text()).toBe('Password must be at least 8 characters.')
    })

    it('enables submit button when password is at least 8 characters, confirmed, and terms accepted', async () => {
      const wrapper = await mountRegisterPage()
      const submitBtn = wrapper.find('button[type="submit"]')

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('password123')

      // Still disabled without matching confirm password
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      await wrapper.find('#confirmPassword').setValue('password123')
      // Still disabled without terms
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      await checkTerms(wrapper)
      // Now enabled
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)
      expect(submitBtn.classes()).not.toContain('opacity-50')
    })

    it('displays backend password rejection inline beneath password input instead of top alert', async () => {
      mockApi.mockRejectedValueOnce({
        data: { password: ['This password is too common and easily guessed.'] },
      })

      const wrapper = await mountRegisterPage()

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('password123')
      await wrapper.find('#confirmPassword').setValue('password123')
      await checkTerms(wrapper)

      await wrapper.find('form').trigger('submit')
      await nextTick()
      await nextTick()

      // Top level alert should not be shown
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)

      // Password error should be shown inline
      const pwError = wrapper.find('#password-error')
      expect(pwError.exists()).toBe(true)
      expect(pwError.text()).toBe('This password is too common and easily guessed.')
    })

    it('clears inline backend password error as soon as user edits password field', async () => {
      mockApi.mockRejectedValueOnce({
        data: { password: ['This password is too common and easily guessed.'] },
      })

      const wrapper = await mountRegisterPage()

      await wrapper.find('#email').setValue('user@example.com')
      const passwordInput = wrapper.find('#password')
      await passwordInput.setValue('password123')
      await wrapper.find('#confirmPassword').setValue('password123')
      await checkTerms(wrapper)

      await wrapper.find('form').trigger('submit')
      await nextTick()
      await nextTick()

      expect(wrapper.find('#password-error').text()).toBe('This password is too common and easily guessed.')

      // User starts editing password
      await passwordInput.setValue('password1234')
      await passwordInput.trigger('input')
      await nextTick()

      expect(wrapper.find('#password-error').exists()).toBe(false)
    })

    it('displays dynamic password strength feedback with corresponding colors for weak, medium, and strong inputs', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')

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

    it('keeps password field error visible on focus and clears it when input changes', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')

      await passwordInput.setValue('short')
      await passwordInput.trigger('blur')
      expect(wrapper.find('#password-error').exists()).toBe(true)
      expect(wrapper.find('#password-error').text()).toBe('Password must be at least 8 characters.')

      // User focuses input to fix it - error must NOT disappear
      await passwordInput.trigger('focus')
      await nextTick()
      expect(wrapper.find('#password-error').exists()).toBe(true)

      // User edits password - error clears
      await passwordInput.setValue('short2')
      await passwordInput.trigger('input')
      await nextTick()
      expect(wrapper.find('#password-error').exists()).toBe(false)
      expect(wrapper.find('#password-guidance').exists()).toBe(true)
    })
  })
})
