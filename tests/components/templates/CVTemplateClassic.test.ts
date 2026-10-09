// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CVTemplateClassic from '../../../app/components/templates/CVTemplateClassic.vue'
import type { ResolvedCvData } from '../../../app/types/cv'

describe('CVTemplateClassic.vue', () => {
  const mockData: ResolvedCvData = {
    title: 'Senior Software Engineer',
    professional_summary: 'Passionate engineer with track record of success.',
    personal_details: {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane@example.com',
      phone: '+1 555 123 4567',
      location: 'New York, USA',
    },
    educations: [
      {
        id: 'edu1',
        institution: 'Columbia University',
        degree: 'BSc',
        field_of_study: 'Computer Science',
        start_date: '2014-09-01',
        end_date: '2018-05-01',
        description: 'Graduated magna cum laude.',
        display_order: 0,
      },
    ],
    experiences: [
      {
        id: 'exp1',
        company: 'Tech Corp',
        role: 'Staff Engineer',
        location: 'New York, USA',
        start_date: '2020-01-01',
        end_date: null,
        description: 'Led architecture across distributed teams.',
        display_order: 0,
      },
    ],
    skills: [
      { id: 'sk1', name: 'TypeScript', level: 'Advanced', display_order: 0 },
    ],
    certifications: [
      {
        id: 'cert1',
        name: 'AWS Solutions Architect',
        issuer: 'Amazon Web Services',
        issue_date: 'May 2024',
        description: '• Cloud architecture\n• High availability design',
        display_order: 0,
      },
    ],
    languages: [],
    awards: [],
    additional_information: [],
  }

  it('renders certifications with issuer and parsed description', () => {
    const wrapper = mount(CVTemplateClassic, {
      props: { data: mockData },
    })

    expect(wrapper.text()).toContain('Certifications')
    expect(wrapper.text()).toContain('AWS Solutions Architect')
    expect(wrapper.text()).toContain('Amazon Web Services')
    expect(wrapper.text()).toContain('May 2024')
    expect(wrapper.text()).toContain('Cloud architecture')
    expect(wrapper.text()).toContain('High availability design')
  })

  it('hides certifications section when array is empty', () => {
    const wrapper = mount(CVTemplateClassic, {
      props: {
        data: {
          ...mockData,
          certifications: [],
        },
      },
    })

    expect(wrapper.text()).not.toContain('Certifications')
  })
})
