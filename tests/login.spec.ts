// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Login from '../app/pages/(auth)/login.vue'

const { mockServerError } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ref } = require('vue') as typeof import('vue')
  return {
    mockServerError: ref<string | null>(null),
  }
})

vi.mock('@unhead/vue', () => ({
  useHead: vi.fn(),
  useHeadSafe: vi.fn(),
  useSeoMeta: vi.fn(),
  useServerHead: vi.fn(),
  useServerHeadSafe: vi.fn(),
  useServerSeoMeta: vi.fn(),
  headSymbol: Symbol('head'),
  createHead: vi.fn(() => ({})),
}))

vi.mock('#app/nuxt', () => ({
  useNuxtApp: vi.fn(() => ({
    runWithContext: (_fn: () => unknown) => undefined, // don't invoke — avoids NUXT_E6001
    ssrContext: null,
  })),
  tryUseNuxtApp: vi.fn(() => null),
  defineNuxtPlugin: vi.fn(),
  callWithNuxt: (_nuxt: unknown, fn: () => unknown) => fn(),
}))

vi.mock('#app', () => ({
  definePageMeta: vi.fn(),
  useNuxtApp: vi.fn(() => ({})),
  navigateTo: vi.fn(),
  useCookie: vi.fn(() => ({ value: null })),
}))

vi.mock('#imports', () => ({
  useHead: vi.fn(),
  useAuth: () => ({
    login: vi.fn(),
    loading: { value: false },
    error: mockServerError,
  }),
  useCookie: vi.fn(() => ({ value: null })),
  navigateTo: vi.fn(),
  definePageMeta: vi.fn(),
}))

vi.mock('../app/composables/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    loading: { value: false },
    error: mockServerError,
  }),
}))

describe('Login Page (UI Validation)', () => {
  beforeEach(() => {
    mockServerError.value = null
  })

  it('shows required field validation when submitting empty form', async () => {
    const wrapper = mount(Login, {
      global: {
        stubs: { NuxtLink: true, Button: true },
      },
    })

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Email is required.')
    expect(wrapper.text()).toContain('Password is required.')
  })

  it('shows error for invalid email format', async () => {
    const wrapper = mount(Login, {
      global: {
        stubs: { NuxtLink: true, Button: true },
      },
    })

    const emailInput = wrapper.find('input[type="email"]')
    await emailInput.setValue('not-an-email')
    await emailInput.trigger('blur')

    expect(wrapper.text()).toContain('Please enter a valid email address.')
  })

  it('does not show validation errors for valid inputs', async () => {
    const wrapper = mount(Login, {
      global: {
        stubs: { NuxtLink: true, Button: true },
      },
    })

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
    const wrapper = mount(Login, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to?.path || to"><slot /></a>',
            props: ['to'],
          },
          Button: true,
        },
      },
    })

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('bg-rose-50')
    expect(alert.text()).toContain('Invalid email or password.')
    expect(wrapper.find('a[href*="verify-email"]').exists()).toBe(false)
  })

  it('renders unverified server error in amber alert style with link to verify-email', async () => {
    mockServerError.value = 'Your email address is not verified yet.'
    const wrapper = mount(Login, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to?.path || to"><slot /></a>',
            props: ['to'],
          },
          Button: true,
        },
      },
    })

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.classes()).toContain('bg-amber-50')
    expect(alert.text()).toContain('Your email address is not verified yet.')
    const link = wrapper.find('a[href*="verify-email"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Verify your email now')
  })
})
