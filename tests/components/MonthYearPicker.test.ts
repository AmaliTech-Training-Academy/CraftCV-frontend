// @vitest-environment nuxt
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MonthYearPicker from '../../app/components/editor/MonthYearPicker.vue'

describe('MonthYearPicker.vue', () => {
  it('renders label and required indicator when required is true', () => {
    const wrapper = mount(MonthYearPicker, {
      props: {
        label: 'Start Date',
        required: true,
      },
    })

    expect(wrapper.text()).toContain('Start Date')
    expect(wrapper.find('span.text-\\[\\#C54A22\\]').exists()).toBe(true)
  })

  it('renders month and year dropdown selects with options', () => {
    const wrapper = mount(MonthYearPicker, {
      props: {
        label: 'Start Date',
      },
    })

    const selects = wrapper.findAll('select')
    expect(selects).toHaveLength(2)

    // Month select options
    const monthOptions = selects[0]!.findAll('option')
    expect(monthOptions.length).toBe(13) // placeholder + 12 months
    expect(monthOptions[1]!.text()).toBe('January')
    expect(monthOptions[12]!.text()).toBe('December')

    // Year select options
    const yearOptions = selects[1]!.findAll('option')
    const currentYear = new Date().getFullYear()
    expect(yearOptions.length).toBe(currentYear - 1970 + 2) // placeholder + years down to 1970
    expect(yearOptions[1]!.text()).toBe(String(currentYear))
  })

  it('gives month and year selects label-specific accessible names', () => {
    const wrapper = mount(MonthYearPicker, {
      props: {
        label: 'Start Date',
      },
    })

    const selects = wrapper.findAll('select')
    expect(selects[0]!.attributes('aria-label')).toBe('Start Date month')
    expect(selects[1]!.attributes('aria-label')).toBe('Start Date year')
  })

  it('parses incoming modelValue to pre-select month and year', () => {
    const wrapper = mount(MonthYearPicker, {
      props: {
        label: 'End Date',
        modelValue: 'March 2023',
      },
    })

    const selects = wrapper.findAll('select')
    expect((selects[0]!.element as HTMLSelectElement).value).toBe('March')
    expect((selects[1]!.element as HTMLSelectElement).value).toBe('2023')
  })

  it('does not select month or year if modelValue is "Present"', () => {
    const wrapper = mount(MonthYearPicker, {
      props: {
        label: 'End Date',
        modelValue: 'Present',
      },
    })

    const selects = wrapper.findAll('select')
    expect((selects[0]!.element as HTMLSelectElement).value).toBe('')
    expect((selects[1]!.element as HTMLSelectElement).value).toBe('')
  })

  it('emits update:modelValue when month or year changes', async () => {
    const wrapper = mount(MonthYearPicker, {
      props: {
        label: 'Start Date',
        modelValue: 'March 2023',
      },
    })

    const selects = wrapper.findAll('select')

    // Change month
    await selects[0]!.setValue('June')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['June 2023'])

    // Change year
    await selects[1]!.setValue('2021')
    expect(wrapper.emitted('update:modelValue')![1]).toEqual(['March 2021'])
  })

  it('disables dropdowns when disabled is true', () => {
    const wrapper = mount(MonthYearPicker, {
      props: {
        label: 'End Date',
        disabled: true,
      },
    })

    const selects = wrapper.findAll('select')
    expect((selects[0]!.element as HTMLSelectElement).disabled).toBe(true)
    expect((selects[1]!.element as HTMLSelectElement).disabled).toBe(true)
  })

  it('displays error message when error prop is provided', () => {
    const wrapper = mount(MonthYearPicker, {
      props: {
        label: 'Start Date',
        error: 'Start date is required',
      },
    })

    expect(wrapper.find('p.text-red-500').text()).toBe('Start date is required')
  })
})
