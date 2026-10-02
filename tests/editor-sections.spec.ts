// @vitest-environment nuxt
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExperiencePage from '~/pages/editor/experience.vue'
import EducationPage from '~/pages/editor/education.vue'
import SkillsPage from '~/pages/editor/skills.vue'
import CertificationsPage from '~/pages/editor/certifications.vue'
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

describe('Editor Sections: Experience, Education, Skills, and Certifications', () => {
  beforeEach(() => {
    const { experience, education, skills, certifications, resetCV } = useCVState()
    resetCV()
    experience.value = []
    education.value = []
    skills.value = []
    certifications.value = []
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
      expect(wrapper.text()).toContain('Description')
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

      // Expand the item to show the form
      const expandDiv = wrapper.find('[aria-label="Expand experience item"]')
      if (expandDiv.exists()) await expandDiv.trigger('click')

      const checkbox = wrapper.find('input[type="checkbox"]')

      await checkbox.setValue(true)
      expect(experience.value[0]!.endDate).toBeNull()

      await checkbox.setValue(false)
      expect(experience.value[0]!.endDate).toBe('December 2023')
    })

    it('silently discards incomplete items on Next', async () => {
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

      // It should discard the invalid item instead of expanding it
      expect(experience.value.length).toBe(0)
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
    it('correctly maps fieldOfStudy separately from location', async () => {
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
      const expandDiv = wrapper.find('[aria-label="Expand education item"]')
      if (expandDiv.exists()) await expandDiv.trigger('click')

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

      // Expand the item to show the form
      const expandDiv = wrapper.find('[aria-label="Expand education item"]')
      if (expandDiv.exists()) await expandDiv.trigger('click')

      const checkbox = wrapper.find('input[type="checkbox"]')

      await checkbox.setValue(true)
      expect(education.value[0]!.endDate).toBeNull()

      await checkbox.setValue(false)
      expect(education.value[0]!.endDate).toBe('June 2025')
    })
  })

  describe('Skills Page', () => {
    it('initializes cleanly without force-adding blank items', () => {
      const { skills } = useCVState()
      const wrapper = mount(SkillsPage, { global: { stubs: sharedStubs } })
      expect(skills.value.length).toBe(0)
      expect(wrapper.text()).toContain('Skills')
      expect(wrapper.text()).toContain('Add a skill or keyword')
    })

    it('adds entry when submitting skill name in the form', async () => {
      const { skills } = useCVState()
      const wrapper = mount(SkillsPage, { global: { stubs: sharedStubs } })

      const input = wrapper.find('input#skill-input')
      await input.setValue('Design Systems')

      const form = wrapper.find('form')
      await form.trigger('submit')

      expect(skills.value.length).toBe(1)
      expect(skills.value[0]!.name).toBe('Design Systems')
      expect(skills.value[0]!.level).toBe('Intermediate')
    })

    it('prevents adding duplicate skills', async () => {
      const { skills } = useCVState()
      skills.value = [{
        id: 's-1',
        name: 'Design Systems',
        level: 'Intermediate',
      }]

      const wrapper = mount(SkillsPage, { global: { stubs: sharedStubs } })

      const input = wrapper.find('input#skill-input')
      await input.setValue('design systems')

      const form = wrapper.find('form')
      await form.trigger('submit')

      expect(skills.value.length).toBe(1)
      expect(wrapper.text()).toContain('This skill is already in your list')
    })

    it('removes skill when clicking X button', async () => {
      const { skills } = useCVState()
      skills.value = [
        { id: '1', name: 'Design Systems', level: 'Advanced' },
        { id: '2', name: 'Token Pipelines', level: 'Intermediate' },
      ]

      const wrapper = mount(SkillsPage, { global: { stubs: sharedStubs } })

      const removeBtns = wrapper.findAll('button[aria-label="Remove skill"]')
      expect(removeBtns.length).toBe(2)
      await removeBtns[0]!.trigger('click')

      expect(skills.value.length).toBe(1)
      expect(skills.value[0]!.id).toBe('2')
    })

    it('clears all skills when clicking Clear all', async () => {
      const { skills } = useCVState()
      skills.value = [
        { id: '1', name: 'Skill 1', level: 'Beginner' },
        { id: '2', name: 'Skill 2', level: 'Advanced' },
      ]

      const wrapper = mount(SkillsPage, { global: { stubs: sharedStubs } })

      const clearBtn = wrapper.findAll('button').find(b => b.text().includes('Clear all'))
      expect(clearBtn).toBeDefined()
      await clearBtn!.trigger('click')

      expect(skills.value.length).toBe(0)
    })

    it('reorders skills when dragged and dropped', async () => {
      const { skills } = useCVState()
      skills.value = [
        { id: '1', name: 'Skill 1', level: 'Beginner' },
        { id: '2', name: 'Skill 2', level: 'Intermediate' },
        { id: '3', name: 'Skill 3', level: 'Advanced' },
      ]

      const wrapper = mount(SkillsPage, { global: { stubs: sharedStubs } })
      const listItems = wrapper.findAll('li[draggable="true"]')
      expect(listItems.length).toBe(3)

      // Simulate dragging item 0 over item 2 and dropping
      await listItems[0]!.trigger('dragstart', {
        dataTransfer: {
          effectAllowed: 'move',
          setData: vi.fn(),
        },
      })
      await listItems[2]!.trigger('dragover', {
        dataTransfer: {
          dropEffect: 'move',
        },
      })
      await listItems[2]!.trigger('drop')

      expect(skills.value.map(s => s.name)).toEqual(['Skill 2', 'Skill 3', 'Skill 1'])
    })
  })

  describe('Certifications Page', () => {
    it('initializes cleanly without blank entries', () => {
      const { certifications } = useCVState()
      const wrapper = mount(CertificationsPage, { global: { stubs: sharedStubs } })
      expect(certifications.value.length).toBe(0)
      expect(wrapper.text()).toContain('Certifications')
    })

    it('adds entry when Add Certification button is clicked', async () => {
      const { certifications } = useCVState()
      const wrapper = mount(CertificationsPage, { global: { stubs: sharedStubs } })

      const addBtn = wrapper.findAll('button').find(b => b.text().includes('Add Certification'))
      await addBtn!.trigger('click')

      expect(certifications.value.length).toBe(1)
      expect(wrapper.text()).toContain('Certification Name')
      expect(wrapper.text()).toContain('Issuing Organization')
    })

    it('prompts delete dialog and deletes certification by id', async () => {
      const { certifications } = useCVState()
      certifications.value = [
        { id: 'c1', name: 'Cert A', issuer: 'Org A', date: 'Jan 2023' },
        { id: 'c2', name: 'Cert B', issuer: 'Org B', date: 'Feb 2024' },
      ]

      const wrapper = mount(CertificationsPage, { global: { stubs: sharedStubs } })

      const collapseBtn = wrapper.findAll('button').find(b => b.text().includes('Collapse'))
      if (collapseBtn) await collapseBtn.trigger('click')

      const trashBtns = wrapper.findAll('button[aria-label="Delete entry"]')
      await trashBtns[0]!.trigger('click')

      expect(wrapper.find('.stub-dialog').exists()).toBe(true)

      const confirmBtn = wrapper.findAll('.stub-dialog button').find(b => b.text().includes('Delete certification'))
      await confirmBtn!.trigger('click')

      expect(certifications.value.length).toBe(1)
      expect(certifications.value[0]!.id).toBe('c2')
    })
  })
})
