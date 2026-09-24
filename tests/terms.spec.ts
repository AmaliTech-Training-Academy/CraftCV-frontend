// @vitest-environment nuxt

import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import TermsPage from '../app/pages/terms.vue'

describe('terms.vue', () => {
  it('renders heading, logo image, and legal markers in text content', async () => {
    const wrapper = await mountSuspended(TermsPage, {
      route: '/terms',
    })

    expect(wrapper.text()).toContain('TERMS AND PRIVACY POLICY')

    const logoImg = wrapper.find('img[alt="CraftCV Logo"]')
    expect(logoImg.exists()).toBe(true)
    expect(logoImg.attributes('src')).toBe('/craftcv-logo.png')

    expect(wrapper.text()).toContain('Act 843')
    expect(wrapper.text()).toContain('support@craftcv.app')
  })
})
