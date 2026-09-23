// @vitest-environment nuxt

import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import RegisterPage from './register.vue'

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
  describe('Rendering & Baseline', () => {
    it('renders heading, subtext, all input fields, terms checkbox, and login link', async () => {
      const wrapper = await mountRegisterPage()

      expect(wrapper.text()).toContain('Create your account.')
      expect(wrapper.text()).toContain('Build a CV that opens doors.')

      expect(wrapper.find('input#email').exists()).toBe(true)
      expect(wrapper.find('input#password').exists()).toBe(true)
      expect(wrapper.find('input#confirmPassword').exists()).toBe(true)
      expect(wrapper.find('input#agreeTerms').exists()).toBe(true)

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
      await new Promise(r => setTimeout(r, 20))

      // Enters loading state after DOM update
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
      expect(submitBtn.attributes('disabled')).toBeDefined()
      expect(submitBtn.text()).toContain('Creating account')
      expect(wrapper.find('svg.animate-spin').exists()).toBe(true)

      // Submitting again while loading does not trigger a second submission
      await form.trigger('submit')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
      expect(submitBtn.attributes('disabled')).toBeDefined()

      await submitPromise
    })
  })
})
