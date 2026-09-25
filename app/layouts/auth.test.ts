// @vitest-environment happy-dom

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthLayout from './auth.vue'

vi.mock('#imports', () => ({
  useRoute: () => ({ path: '/auth/register' }),
}))

vi.mock('#app/composables/router', () => ({
  useRoute: () => ({ path: '/auth/register' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

describe('auth.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('renders slot content cleanly', () => {
    const wrapper = mount(AuthLayout, {
      slots: {
        default: '<div id="slot-content">Test Slot Content</div>',
      },
      global: {
        stubs: {
          NuxtImg: true,
          NuxtLink: true,
        },
      },
    })

    expect(wrapper.find('#slot-content').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Slot Content')
  })

  it('rotates testimonials when the next button is clicked', async () => {
    const wrapper = mount(AuthLayout, {
      global: {
        stubs: {
          NuxtImg: true,
          NuxtLink: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Mark Williams')

    const nextBtn = wrapper.find('button[aria-label="Next feature"]')
    await nextBtn.trigger('click')

    expect(wrapper.text()).toContain('Sarah Chen')
  })
})
