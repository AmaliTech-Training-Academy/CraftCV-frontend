// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import SingleColumnTemplate from '../../../app/components/templates/SingleColumnTemplate.vue'
import type { ResolvedCvData } from '../../../app/types/cv'

describe('SingleColumnTemplate.vue', () => {
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
    certifications: [],
    languages: [],
    awards: [],
    additional_information: [],
  }

  it('renders correctly with complete data', () => {
    const wrapper = mount(SingleColumnTemplate, {
      props: { data: mockData },
    })

    // Personal details
    expect(wrapper.text()).toContain('Ethan Walker')
    expect(wrapper.text()).toContain('Senior Product Designer')
    expect(wrapper.text()).toContain('ethan@example.com')
    expect(wrapper.text()).toContain('+1 415 555 0198')

    // Summary
    expect(wrapper.text()).toContain('Summary')
    expect(wrapper.text()).toContain('Experienced designer')

    // Experience
    expect(wrapper.text()).toContain('Lead Product Designer')
    expect(wrapper.text()).toContain('Bright Pixel Studio')
    expect(wrapper.text()).toContain('2019 - Present') // Verifying null end_date logic
    expect(wrapper.text()).toContain('Directed product design initiatives.')

    // Education
    expect(wrapper.text()).toContain('Bachelor\'s, Industrial Design')
    expect(wrapper.text()).toContain('California College of the Arts')
    expect(wrapper.text()).toContain('2011 - 2015')

    // Skills
    expect(wrapper.text()).toContain('Figma')
  })

  it('hides empty optional sections', () => {
    const wrapper = mount(SingleColumnTemplate, {
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

  it('renders multiple entries for education and experience', () => {
    const wrapper = mount(SingleColumnTemplate, {
      props: {
        data: {
          ...mockData,
          experiences: [
            ...mockData.experiences,
            {
              id: 'exp2',
              company: 'Past Corp',
              role: 'Junior Designer',
              start_date: '2015-01-01',
              end_date: '2018-12-31',
              display_order: 1,
            },
          ],
        },
      },
    })

    expect(wrapper.text()).toContain('Lead Product Designer')
    expect(wrapper.text()).toContain('Junior Designer')
    expect(wrapper.text()).toContain('Past Corp')
  })
})
