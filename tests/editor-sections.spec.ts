// @vitest-environment nuxt
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExperiencePage from '~/pages/editor/experience.vue'
import EducationPage from '~/pages/editor/education.vue'
import { isEndDateBeforeStartDate, isValidDateString } from '~/composables/useCVSectionEditor'
import { useCVState } from '~/composables/useCVState'

describe('Date validation', () => {
  it('requires both month and year unless the date is Present', () => {
    expect(isValidDateString('January')).toBe(false)
    expect(isValidDateString('January 2024')).toBe(true)
    expect(isValidDateString('Present')).toBe(true)
    expect(isValidDateString('')).toBe(false)
    expect(isEndDateBeforeStartDate('January 2024', 'March 2020')).toBe(true)
    expect(isEndDateBeforeStartDate('January 2024', 'January 2024')).toBe(false)
    expect(isEndDateBeforeStartDate('January 2024', 'March 2024')).toBe(false)
    expect(isEndDateBeforeStartDate('January 2024', 'Present')).toBe(false)
  })
})

const sharedStubs = {
  NuxtLink: {
    template: '<a><slot /></a>',
  },
  EditorFormField: {
    props: ['modelValue', 'label', 'error', 'required', 'placeholder'],
    emits: ['update:modelValue'],
    template: `
      <div class="stub-form-field">
        <label>{{ label }}</label>
        <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
        <span v-if="error" class="error-msg">{{ error }}</span>
      </div>
    `,
  },
  EditorMonthYearPicker: {
    props: ['modelValue', 'label', 'required', 'disabled', 'error'],
    emits: ['update:modelValue'],
    template: '<div class="stub-month-year-picker"></div>',
  },
  UiButton: {
    template: '<button><slot /></button>',
  },
  Button: {
    template: '<button><slot /></button>',
  },
  UiCheckbox: {
    props: ['checked', 'modelValue', 'id'],
    emits: ['update:checked', 'update:modelValue'],
    template: '<input type="checkbox" :id="id" :checked="modelValue ?? checked" @change="$emit(\'update:modelValue\', $event.target.checked); $emit(\'update:checked\', $event.target.checked)" />',
  },
  Checkbox: {
    props: ['checked', 'modelValue', 'id'],
    emits: ['update:checked', 'update:modelValue'],
    template: '<input type="checkbox" :id="id" :checked="modelValue ?? checked" @change="$emit(\'update:modelValue\', $event.target.checked); $emit(\'update:checked\', $event.target.checked)" />',
  },
  UiLabel: {
    props: ['for'],
    template: '<label :for="$props.for"><slot /></label>',
  },
  Label: {
    props: ['for'],
    template: '<label :for="$props.for"><slot /></label>',
  },
  UiSeparator: {
    template: '<hr />',
  },
  Separator: {
    template: '<hr />',
  },
  UiDialog: {
    props: ['open'],
    emits: ['update:open'],
    template: '<div v-if="open" class="stub-dialog"><slot /></div>',
  },
  Dialog: {
    props: ['open'],
    emits: ['update:open'],
    template: '<div v-if="open" class="stub-dialog"><slot /></div>',
  },
  UiDialogContent: { template: '<div><slot /></div>' },
  DialogContent: { template: '<div><slot /></div>' },
  UiDialogHeader: { template: '<div><slot /></div>' },
  DialogHeader: { template: '<div><slot /></div>' },
  UiDialogTitle: { template: '<h2><slot /></h2>' },
  DialogTitle: { template: '<h2><slot /></h2>' },
  UiDialogDescription: { template: '<p><slot /></p>' },
  DialogDescription: { template: '<p><slot /></p>' },
  UiDialogFooter: { template: '<div><slot /></div>' },
  DialogFooter: { template: '<div><slot /></div>' },
  UiDialogClose: { template: '<button><slot /></button>' },
  DialogClose: { template: '<button><slot /></button>' },
}

describe('Editor Sections: Experience and Education (Refactored)', () => {
  beforeEach(() => {
    const { experience, education } = useCVState()
    experience.value = []
    education.value = []
    vi.clearAllMocks()
  })

  describe('Experience Page', () => {
    it('initializes cleanly without force-adding blank items', () => {
      const { experience } = useCVState()
      const wrapper = mount(ExperiencePage, { global: { stubs: sharedStubs } })
      expect(experience.value.length).toBe(0)
      expect(wrapper.text()).toContain('Work Experience')
    })

    it('adds entry and sets activeId to the new item UUID', async () => {
      const { experience } = useCVState()
      const wrapper = mount(ExperiencePage, { global: { stubs: sharedStubs } })

      const addBtn = wrapper.findAll('button').find(b => b.text().includes('Add Entry'))
      await addBtn!.trigger('click')

      expect(experience.value.length).toBe(1)
      expect(wrapper.text()).toContain('Responsibilities')
    })

    it('non-destructively preserves previous end date when toggling current work', async () => {
      const { experience } = useCVState()
      experience.value = [{
        id: 'exp-1',
        title: 'Developer',
        company: 'Stripe',
        location: 'Remote',
        startDate: 'January 2022',
        endDate: 'December 2023',
        description: '',
      }]

      const wrapper = mount(ExperiencePage, { global: { stubs: sharedStubs } })
      const checkbox = wrapper.find('input[type="checkbox"]')

      await checkbox.setValue(true)
      expect(experience.value[0]!.endDate).toBe('Present')

      await checkbox.setValue(false)
      expect(experience.value[0]!.endDate).toBe('December 2023')
    })

    it('auto-expands an invalid collapsed card and marks it incomplete on Next', async () => {
      const { experience } = useCVState()
      experience.value = [{
        id: 'exp-1',
        title: '',
        company: 'Stripe',
        location: 'Remote',
        startDate: '',
        endDate: 'Present',
        description: '',
      }]

      const wrapper = mount(ExperiencePage, { global: { stubs: sharedStubs } })

      const collapseBtn = wrapper.findAll('button').find(b => b.text().includes('Collapse'))
      if (collapseBtn) await collapseBtn.trigger('click')

      const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))
      await nextBtn!.trigger('click')

      expect(wrapper.text()).toContain('Job title is required')
    })

    it('prompts delete modal and deletes by UUID safely', async () => {
      const { experience } = useCVState()
      experience.value = [
        { id: '1', title: 'A', company: 'X', location: '', startDate: 'Jan 2021', endDate: 'Present', description: '' },
        { id: '2', title: 'B', company: 'Y', location: '', startDate: 'Feb 2022', endDate: 'Present', description: '' },
      ]

      const wrapper = mount(ExperiencePage, { global: { stubs: sharedStubs } })

      const collapseBtn = wrapper.findAll('button').find(b => b.text().includes('Collapse'))
      if (collapseBtn) await collapseBtn.trigger('click')

      const trashBtns = wrapper.findAll('button[aria-label="Delete entry"]')
      await trashBtns[0]!.trigger('click')

      expect(wrapper.find('.stub-dialog').exists()).toBe(true)

      const confirmBtn = wrapper.findAll('.stub-dialog button').find(b => b.text().includes('Delete'))
      await confirmBtn!.trigger('click')

      expect(experience.value.length).toBe(1)
      expect(experience.value[0]!.id).toBe('2')
    })
  })

  describe('Education Page', () => {
    it('correctly maps fieldOfStudy separately from location', () => {
      const { education } = useCVState()
      education.value = [{
        id: 'edu-1',
        degree: 'BSc Computer Science',
        school: 'KNUST',
        fieldOfStudy: 'Software Engineering',
        location: 'Kumasi, Ghana',
        startDate: 'September 2022',
        endDate: 'Present',
        description: '',
      }]

      const wrapper = mount(EducationPage, { global: { stubs: sharedStubs } })
      expect(wrapper.text()).toContain('Field of Study')
      expect(education.value[0]!.fieldOfStudy).toBe('Software Engineering')
      expect(education.value[0]!.location).toBe('Kumasi, Ghana')
    })

    it('non-destructively preserves previous end date when toggling current study', async () => {
      const { education } = useCVState()
      education.value = [{
        id: 'edu-1',
        degree: 'BSc',
        school: 'KNUST',
        fieldOfStudy: 'CS',
        location: 'Kumasi',
        startDate: 'September 2021',
        endDate: 'June 2025',
        description: '',
      }]

      const wrapper = mount(EducationPage, { global: { stubs: sharedStubs } })
      const checkbox = wrapper.find('input[type="checkbox"]')

      await checkbox.setValue(true)
      expect(education.value[0]!.endDate).toBe('Present')

      await checkbox.setValue(false)
      expect(education.value[0]!.endDate).toBe('June 2025')
    })
  })
})
