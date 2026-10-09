// @vitest-environment nuxt

import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Login from '../app/pages/(auth)/login.vue'

const { mockServerError } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ref } = require('vue') as typeof import('vue')
  return {
    mockServerError: ref<string | null>(null),
  }
})

mockNuxtImport('useAuth', () => () => ({
  login: vi.fn(),
  loading: { value: false },
  error: mockServerError,
}))

function mountLoginPage(query: Record<string, string> = {}) {
  return mountSuspended(Login, {
    route: {
      path: '/login',
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

describe('Login Page (UI Validation)', () => {
  beforeEach(() => {
    mockServerError.value = null
  })

  it('shows required field validation when submitting empty form', async () => {
    const wrapper = await mountLoginPage()

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Email is required.')
    expect(wrapper.text()).toContain('Password is required.')
  })

  it('shows error for invalid email format', async () => {
    const wrapper = await mountLoginPage()

    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('not-an-email')
    await emailInput.trigger('blur')

    expect(wrapper.text()).toContain('Please enter a valid email address.')
  })

  it('does not show validation errors for valid inputs', async () => {
    const wrapper = await mountLoginPage()

    await wrapper.find('input[type="email"]').setValue('test@example.com')
    await wrapper.find('input[type="email"]').trigger('blur')

    await wrapper.find('input[type="password"]').setValue('validpassword123')
    await wrapper.find('input[type="password"]').trigger('blur')

    expect(wrapper.text()).not.toContain('Please enter a valid email address.')
    expect(wrapper.text()).not.toContain('Email is required.')
    expect(wrapper.text()).not.toContain('Password is required.')
  })

  it('renders standard server error in rose alert style without verify link', async () => {
    mockServerError.value = 'Invalid email or password.'
    const wrapper = await mountLoginPage()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('bg-rose-50')
    expect(alert.text()).toContain('Invalid email or password.')
    expect(wrapper.find('a[href*="verify-email"]').exists()).toBe(false)
  })

  it('renders unverified server error in amber alert style with link to verify-email', async () => {
    mockServerError.value = 'Your email address is not verified yet.'
    const wrapper = await mountLoginPage()

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('bg-amber-50')
    expect(alert.text()).toContain('Your email address is not verified yet.')
    const link = wrapper.find('a[href*="verify-email"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Verify your email now')
  })

  it('renders verified success banner when verified=true query parameter is present', async () => {
    const wrapper = await mountLoginPage({ verified: 'true', email: 'verified@example.com' })

    const statusBanner = wrapper.find('[role="status"]')
    expect(statusBanner.exists()).toBe(true)
    expect(statusBanner.text()).toContain('Email verified, please sign in.')
  })
})
