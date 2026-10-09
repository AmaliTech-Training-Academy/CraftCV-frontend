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

  describe('Lightweight Inline Password Guidance (CRF-74)', () => {
    it('reveals inline guidance tip when password is typed and hides it when empty', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')

      expect(wrapper.find('#password-guidance').exists()).toBe(false)

      await passwordInput.setValue('A')
      expect(wrapper.find('#password-guidance').exists()).toBe(true)
      expect(wrapper.find('#password-guidance').text()).toBe(
        'Tip: A strong password includes 8+ characters, uppercase, lowercase, numbers, and symbols.',
      )

      await passwordInput.setValue('')
      expect(wrapper.find('#password-guidance').exists()).toBe(false)
    })

    it('shows specific suggestions to make weak password stronger while typing, and shows error only on blur', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')

      await passwordInput.setValue('AAAAAAAA')
      // While typing (focused), dynamic guidance shows and error does not
      expect(wrapper.find('#password-guidance').exists()).toBe(true)
      expect(wrapper.find('#password-error').exists()).toBe(false)
      expect(wrapper.find('#password-guidance').text()).toBe(
        'To make it stronger, add: a lowercase letter, a number, a special symbol, avoid common sequences.',
      )

      // When blurred (engaging another field), guidance hides and error only shows what to add
      await passwordInput.trigger('blur')
      expect(wrapper.find('#password-guidance').exists()).toBe(false)
      expect(wrapper.find('#password-error').exists()).toBe(true)
      expect(wrapper.find('#password-error').text()).toBe(
        'To make it stronger, add: a lowercase letter, a number, a special symbol, avoid common sequences.',
      )

      // When user starts typing / focuses again, guidance returns and error hides
      await passwordInput.trigger('focus')
      expect(wrapper.find('#password-guidance').exists()).toBe(true)
      expect(wrapper.find('#password-error').exists()).toBe(false)

      // Submit button must remain disabled
      const submitBtn = wrapper.find('button[type="submit"]')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('shows minimum length error only on blur when under 8 characters, and hides guidance', async () => {
      const wrapper = await mountRegisterPage()
      const passwordInput = wrapper.find('#password')

      await passwordInput.setValue('short')
      expect(wrapper.find('#password-guidance').exists()).toBe(true)
      expect(wrapper.find('#password-error').exists()).toBe(false)

      await passwordInput.trigger('blur')
      expect(wrapper.find('#password-guidance').exists()).toBe(false)
      expect(wrapper.find('#password-error').exists()).toBe(true)
      expect(wrapper.find('#password-error').text()).toBe('Password must be at least 8 characters.')
    })

    it('blocks account creation with error if password fails 6 rules on submission', async () => {
      const wrapper = await mountRegisterPage()

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('AAAAAAAA')
      await wrapper.find('#confirmPassword').setValue('AAAAAAAA')
      await checkTerms(wrapper)

      await wrapper.find('form').trigger('submit')
      await nextTick()

      expect(wrapper.text()).toContain('Password must meet all 6 security requirements.')
      expect(mockApi).not.toHaveBeenCalled()
    })

    it('marks strong password P@ssw0rd2026! as strong and enables submit button when confirmed', async () => {
      const wrapper = await mountRegisterPage()
      const submitBtn = wrapper.find('button[type="submit"]')

      await wrapper.find('#email').setValue('user@example.com')
      await wrapper.find('#password').setValue('P@ssw0rd2026!')
      expect(wrapper.find('#password-guidance').text()).toBe('Password is strong.')

      // Still disabled without matching confirm password
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      await wrapper.find('#confirmPassword').setValue('P@ssw0rd2026!')
      // Still disabled without terms
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)

      await checkTerms(wrapper)
      // Now enabled
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)
      expect(submitBtn.classes()).not.toContain('opacity-50')
    })
  })
})
