// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import IndexPage from '../app/pages/index.vue'

// Import all home components so they render in the integration test
import HomeHeader from '../app/components/home/HomeHeader.vue'
import HomeInteractivePreview from '../app/components/home/HomeInteractivePreview.vue'
import HomeFaq from '../app/components/home/HomeFaq.vue'
import HomeTestimonials from '../app/components/home/HomeTestimonials.vue'
import HomeFooter from '../app/components/home/HomeFooter.vue'

const globalMountOptions = {
  components: {
    HomeHeader,
    HomeInteractivePreview,
    HomeFaq,
    HomeTestimonials,
    HomeFooter,
  },
  stubs: {
    NuxtLink: {
      template: '<a><slot /></a>',
    },
  },
}

describe('index.vue (Integration)', () => {
  it('renders landing page hero and branding', () => {
    const wrapper = mount(IndexPage, { global: globalMountOptions })

    expect(wrapper.text()).toContain('Create a standout CV')
    expect(wrapper.text()).toContain('Build Your Resume Free')
  })

  it('renders Ghanaian testimonial names', () => {
    const wrapper = mount(IndexPage, { global: globalMountOptions })

    expect(wrapper.text()).toContain('Loved by professionals across Ghana')
    expect(wrapper.text()).toContain('Kwame Asante')
    expect(wrapper.text()).toContain('Abena Mensah')
    expect(wrapper.text()).toContain('James Osei')
  })

  it('toggles FAQ item on click', async () => {
    const wrapper = mount(IndexPage, { global: globalMountOptions })

    // Find the first FAQ button
    const faqButton = wrapper.findAll('#faq button')[0]
    expect(faqButton).toBeDefined()
    if (!faqButton) return

    expect(wrapper.text()).toContain('Is CraftCV free to use?')

    // First item is open by default
    expect(faqButton.attributes('aria-expanded')).toBe('true')

    // Click to close
    await faqButton.trigger('click')
    expect(faqButton.attributes('aria-expanded')).toBe('false')
  })

  it('switches role demo preview', async () => {
    const wrapper = mount(IndexPage, { global: globalMountOptions })

    expect(wrapper.text()).toContain('Senior Software Engineer')
    expect(wrapper.text()).toContain('Kwame Mensah')

    const buttons = wrapper.findAll('#preview button[role="tab"]')
    const pmButton = buttons.find(b => b.text().includes('Lead Product Manager'))
    expect(pmButton).toBeDefined()

    if (pmButton) {
      await pmButton.trigger('click')
      expect(wrapper.text()).toContain('Abena Osei')
      expect(pmButton.attributes('aria-selected')).toBe('true')
    }
  })
})
