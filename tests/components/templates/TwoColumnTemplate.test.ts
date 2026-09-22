// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TwoColumnTemplate from '../../../app/components/templates/TwoColumnTemplate.vue'
import type { ResolvedCvData } from '../../../app/types/cv'

describe('TwoColumnTemplate.vue', () => {
  const mockData: ResolvedCvData = {
    title: 'Senior Product Designer',
    professional_summary: 'Experienced designer',
    personal_details: {
      first_name: 'Ethan',
      last_name: 'Walker',
      email: 'ethan@example.com',
      phone: '+1 415 555 0198',
      location: 'San Francisco, USA',
    },
    educations: [
      {
        id: 'edu1',
        institution: 'California College of the Arts',
        degree: 'Bachelor\'s',
        field_of_study: 'Industrial Design',
        start_date: '2011-08-01',
        end_date: '2015-05-01',
        description: 'Studied fundamentals of design.',
        display_order: 0,
      },
    ],
    experiences: [
      {
        id: 'exp1',
        company: 'Bright Pixel Studio',
        role: 'Lead Product Designer',
        location: 'San Francisco, USA',
        start_date: '2019-01-01',
        end_date: null, // "Present"
        description: 'Directed product design initiatives.',
        display_order: 0,
      },
    ],
    skills: [
      { id: 'sk1', name: 'Figma', display_order: 0 },
    ],
    certifications: [
      { id: 'cert1', name: 'UX Certificate', issuer: 'Google', display_order: 0 },
    ],
    languages: [
      { id: 'lang1', name: 'English', proficiency: 'Native', display_order: 0 },
    ],
    awards: [],
    additional_information: [],
  }

  it('renders both columns with appropriate data', () => {
    const wrapper = mount(TwoColumnTemplate, {
      props: { data: mockData },
    })

    // Sidebar items
    expect(wrapper.text()).toContain('Ethan Walker')
    expect(wrapper.text()).toContain('ethan@example.com')
    expect(wrapper.text()).toContain('Figma')
    expect(wrapper.text()).toContain('UX Certificate')
    expect(wrapper.text()).toContain('English')

    // Check specific sidebar headings
    expect(wrapper.text()).toContain('Contact')
    expect(wrapper.text()).toContain('Skills')
    expect(wrapper.text()).toContain('Languages')

    // Main column items
    expect(wrapper.text()).toContain('Profile') // The section heading for summary
    expect(wrapper.text()).toContain('Experienced designer')
    expect(wrapper.text()).toContain('Experience')
    expect(wrapper.text()).toContain('Bright Pixel Studio')
    expect(wrapper.text()).toContain('Education')
    expect(wrapper.text()).toContain('California College of the Arts')
  })

  it('hides empty optional sections from both columns', () => {
    const wrapper = mount(TwoColumnTemplate, {
      props: {
        data: {
          ...mockData,
          certifications: [],
          languages: [],
          awards: [],
          additional_information: [],
        },
      },
    })

    expect(wrapper.text()).not.toContain('Certifications')
    expect(wrapper.text()).not.toContain('Languages')
    expect(wrapper.text()).not.toContain('Awards')
    expect(wrapper.text()).not.toContain('Additional Information')
  })

  it('displays "Present" when end_date is null', () => {
    const wrapper = mount(TwoColumnTemplate, {
      props: { data: mockData },
    })

    expect(wrapper.text()).toContain('2019 - Present')
  })
})
