// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Register from '../app/pages/(auth)/register.vue'

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
    runWithContext: (_fn: () => unknown) => undefined,
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
  useCookie: vi.fn(() => ({ value: null })),
  navigateTo: vi.fn(),
  definePageMeta: vi.fn(),
}))

describe('Register Page Stub', () => {
  it('renders the placeholder text', () => {
    const wrapper = mount(Register, {
      global: {
        stubs: { NuxtLink: true },
      },
    })
    expect(wrapper.text()).toContain('Hi')
  })
})
