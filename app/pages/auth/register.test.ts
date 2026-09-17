// @vitest-environment nuxt

import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import RegisterPage from './register.vue'

describe('register.vue', () => {
  it('renders the registration page', async () => {
    const wrapper = await mountSuspended(RegisterPage)

    expect(wrapper.text()).toContain('Create your account.')
    expect(wrapper.text()).toContain('Step 1 of 3')
  })
})
