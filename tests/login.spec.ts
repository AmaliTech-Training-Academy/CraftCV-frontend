// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Login from '../app/pages/(auth)/login.vue'

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
    error: { value: null },
  }),
  useCookie: vi.fn(() => ({ value: null })),
  navigateTo: vi.fn(),
  definePageMeta: vi.fn(),
}))

describe('Login Page (UI Validation)', () => {
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
})
