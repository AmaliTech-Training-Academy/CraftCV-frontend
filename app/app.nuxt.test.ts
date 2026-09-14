// @vitest-environment nuxt

// Smoke test for the root component. It renders inside the real Nuxt runtime,
// so it also proves the app boots with the configured modules.

import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import App from './app.vue'

describe('app.vue', () => {
  it('renders', async () => {
    const wrapper = await mountSuspended(App)

    expect(wrapper.html()).toBeTruthy()
  })
})
