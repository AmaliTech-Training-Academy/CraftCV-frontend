// @vitest-environment happy-dom

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IndexPage from './index.vue'

describe('index.vue', () => {
  it('renders placeholder heading', () => {
    const wrapper = mount(IndexPage)
    expect(wrapper.text()).toContain('Hello World')
  })
})
