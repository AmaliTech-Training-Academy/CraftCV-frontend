// @vitest-environment nuxt

import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import ExperiencePage from '../app/pages/editor/experience.vue'
import EducationPage from '../app/pages/editor/education.vue'
import { useCVState } from '../app/composables/useCVState'

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const NuxtLinkStub = {
  template: '<a :href="to"><slot /></a>',
  props: ['to'],
}

const EditorFormFieldStub = {
  name: 'EditorFormField',
  template: `
    <div>
      <label>{{ label }}<span v-if="required">*</span></label>
      <input
        :data-testid="label"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <span v-if="error" class="error">{{ error }}</span>
    </div>
  `,
  props: ['label', 'type', 'placeholder', 'modelValue', 'required', 'error'],
  emits: ['update:modelValue', 'remove'],
}

const globalStubs = {
  NuxtLink: NuxtLinkStub,
  EditorFormField: EditorFormFieldStub,
}

function mountExperiencePage() {
  return mountSuspended(ExperiencePage, {
    route: '/editor/experience',
    global: { stubs: globalStubs },
  })
}

function mountEducationPage() {
  return mountSuspended(EducationPage, {
    route: '/editor/education',
    global: { stubs: globalStubs },
  })
}

/** Reset shared Nuxt useState between tests */
function resetState() {
  const { experience, education, resetCV } = useCVState()
  resetCV()
  experience.value = []
  education.value = []
}

// ---------------------------------------------------------------------------
// Work Experience Tests
// ---------------------------------------------------------------------------

describe('experience.vue', () => {
  beforeEach(() => {
    resetState()
  })

  describe('Default form on mount', () => {
    it('renders a default blank entry card immediately without any empty-state illustration', async () => {
      const wrapper = await mountExperiencePage()

      expect(wrapper.text()).not.toContain('No experience added yet')
      expect(wrapper.find('[data-testid="add-first-experience"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="experience-card-0"]').exists()).toBe(true)

      const { experience, getExperienceStatus } = useCVState()
      expect(experience.value).toEqual([])
      expect(getExperienceStatus()).toBe('empty')
    })

    it('renders the page heading', async () => {
      const wrapper = await mountExperiencePage()
      expect(wrapper.text()).toContain('Employment History')
    })

    it('renders the "Add Another Position" button alongside the first card', async () => {
      const wrapper = await mountExperiencePage()
      expect(wrapper.find('[data-testid="add-another-experience"]').exists()).toBe(true)
    })
  })

  describe('Adding entries', () => {
    it('adds a second card without pushing blank entries into the global state', async () => {
      const wrapper = await mountExperiencePage()

      await wrapper.find('[data-testid="add-another-experience"]').trigger('click')
      await nextTick()

      expect(wrapper.find('[data-testid="experience-card-0"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="experience-card-1"]').exists()).toBe(true)

      const { experience } = useCVState()
      expect(experience.value).toEqual([])
    })

    it('syncs populated entries into the global state when the user types data', async () => {
      const wrapper = await mountExperiencePage()

      const titleInput = wrapper.find('[data-testid="Job Title"]')
      await titleInput.setValue('Senior Frontend Developer')
      await nextTick()

      const companyInput = wrapper.find('[data-testid="Company / Employer"]')
      await companyInput.setValue('Acme Corp')
      await nextTick()

      const { experience } = useCVState()
      expect(experience.value).toHaveLength(1)
      expect(experience.value[0]?.title).toBe('Senior Frontend Developer')
      expect(experience.value[0]?.company).toBe('Acme Corp')
    })

    it('keeps each added local entry unique while leaving the global state empty until content exists', async () => {
      const wrapper = await mountExperiencePage()

      await wrapper.find('[data-testid="add-another-experience"]').trigger('click')
      await nextTick()
      await wrapper.find('[data-testid="add-another-experience"]').trigger('click')
      await nextTick()

      const cardCount = wrapper.findAll('[data-testid^="experience-card-"]').length
      expect(cardCount).toBe(3)

      const { experience } = useCVState()
      expect(experience.value).toEqual([])
    })
  })

  describe('Removing entries', () => {
    it('removes a specific entry by id without affecting neighbouring entries once the array is populated', async () => {
      const wrapper = await mountExperiencePage()

      await wrapper.find('[data-testid="add-another-experience"]').trigger('click')
      await nextTick()
      await wrapper.find('[data-testid="add-another-experience"]').trigger('click')
      await nextTick()

      const firstTitle = wrapper.findAll('[data-testid="Job Title"]')[0]!
      const secondTitle = wrapper.findAll('[data-testid="Job Title"]')[1]!
      const thirdTitle = wrapper.findAll('[data-testid="Job Title"]')[2]!

      await firstTitle.setValue('Engineer')
      await secondTitle.setValue('Designer')
      await thirdTitle.setValue('Analyst')
      await nextTick()

      const { experience } = useCVState()
      const [first, second, third] = experience.value.map(e => e.id)

      await wrapper.find('[data-testid="remove-experience-1"]').trigger('click')
      await nextTick()

      expect(experience.value).toHaveLength(2)
      expect(experience.value[0]!.id).toBe(first)
      expect(experience.value[1]!.id).toBe(third)
      expect(experience.value.some(e => e.id === second)).toBe(false)
    })

    it('resets the single remaining entry to blank values and clears the global state when the last entry is cleared', async () => {
      const wrapper = await mountExperiencePage()
      await nextTick()

      const titleInput = wrapper.find('[data-testid="Job Title"]')
      await titleInput.setValue('Engineer')
      await nextTick()

      const companyInput = wrapper.find('[data-testid="Company / Employer"]')
      await companyInput.setValue('Acme')
      await nextTick()

      let { experience } = useCVState()
      expect(experience.value).toHaveLength(1)

      await wrapper.find('[data-testid="remove-experience-0"]').trigger('click')
      await nextTick()

      experience = useCVState().experience
      expect(experience.value).toEqual([])
      expect(wrapper.find('[data-testid="experience-card-0"]').exists()).toBe(true)
      expect(wrapper.text()).not.toContain('No experience added yet')

      const resetTitleInput = wrapper.find('[data-testid="Job Title"]')
      expect((resetTitleInput.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('Validation', () => {
    it('shows no errors before "Next" is clicked', async () => {
      const wrapper = await mountExperiencePage()
      expect(wrapper.findAll('.error')).toHaveLength(0)
    })

    it('shows required field errors when "Next" is clicked with blank fields', async () => {
      const wrapper = await mountExperiencePage()

      const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))
      await nextBtn!.trigger('click')
      await nextTick()

      const errors = wrapper.findAll('.error')
      expect(errors.length).toBeGreaterThanOrEqual(3)

      const errorTexts = errors.map(e => e.text())
      expect(errorTexts.some(t => t.toLowerCase().includes('job title'))).toBe(true)
      expect(errorTexts.some(t => t.toLowerCase().includes('company'))).toBe(true)
      expect(errorTexts.some(t => t.toLowerCase().includes('start date'))).toBe(true)
    })

    it('shows errors for all entries when multiple have missing required fields', async () => {
      const wrapper = await mountExperiencePage()

      await wrapper.find('[data-testid="add-another-experience"]').trigger('click')
      await nextTick()

      const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))
      await nextBtn!.trigger('click')
      await nextTick()

      // 2 entries × 3 required fields = 6 errors minimum
      const errors = wrapper.findAll('.error')
      expect(errors.length).toBeGreaterThanOrEqual(6)
    })
  })
})

// ---------------------------------------------------------------------------
// Education Tests
// ---------------------------------------------------------------------------

describe('education.vue', () => {
  beforeEach(() => {
    resetState()
  })

  describe('Default form on mount', () => {
    it('renders a default blank entry card immediately without any empty-state illustration', async () => {
      const wrapper = await mountEducationPage()

      expect(wrapper.text()).not.toContain('No education added yet')
      expect(wrapper.find('[data-testid="add-first-education"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="education-card-0"]').exists()).toBe(true)

      const { education, getEducationStatus } = useCVState()
      expect(education.value).toEqual([])
      expect(getEducationStatus()).toBe('empty')
    })

    it('renders the page heading', async () => {
      const wrapper = await mountEducationPage()
      expect(wrapper.text()).toContain('Education')
    })

    it('renders the "Add Another Education" button alongside the first card', async () => {
      const wrapper = await mountEducationPage()
      expect(wrapper.find('[data-testid="add-another-education"]').exists()).toBe(true)
    })
  })

  describe('Adding entries', () => {
    it('adds a second card without pushing blank entries into the global state', async () => {
      const wrapper = await mountEducationPage()

      await wrapper.find('[data-testid="add-another-education"]').trigger('click')
      await nextTick()

      expect(wrapper.find('[data-testid="education-card-0"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="education-card-1"]').exists()).toBe(true)

      const { education } = useCVState()
      expect(education.value).toEqual([])
    })

    it('syncs populated entries into the global state when the user types data', async () => {
      const wrapper = await mountEducationPage()

      const degreeInput = wrapper.find('[data-testid="Degree / Certificate"]')
      await degreeInput.setValue('BSc Computer Science')
      await nextTick()

      const schoolInput = wrapper.find('[data-testid="School / University"]')
      await schoolInput.setValue('KNUST')
      await nextTick()

      const { education } = useCVState()
      expect(education.value).toHaveLength(1)
      expect(education.value[0]?.degree).toBe('BSc Computer Science')
      expect(education.value[0]?.school).toBe('KNUST')
    })

    it('keeps each added local entry unique while leaving the global state empty until content exists', async () => {
      const wrapper = await mountEducationPage()

      await wrapper.find('[data-testid="add-another-education"]').trigger('click')
      await nextTick()
      await wrapper.find('[data-testid="add-another-education"]').trigger('click')
      await nextTick()

      const cardCount = wrapper.findAll('[data-testid^="education-card-"]').length
      expect(cardCount).toBe(3)

      const { education } = useCVState()
      expect(education.value).toEqual([])
    })
  })

  describe('Removing entries', () => {
    it('removes a specific entry by id without affecting neighbouring entries once the array is populated', async () => {
      const wrapper = await mountEducationPage()

      await wrapper.find('[data-testid="add-another-education"]').trigger('click')
      await nextTick()
      await wrapper.find('[data-testid="add-another-education"]').trigger('click')
      await nextTick()

      const firstDegree = wrapper.findAll('[data-testid="Degree / Certificate"]')[0]!
      const secondDegree = wrapper.findAll('[data-testid="Degree / Certificate"]')[1]!
      const thirdDegree = wrapper.findAll('[data-testid="Degree / Certificate"]')[2]!

      await firstDegree.setValue('BSc Computer Science')
      await secondDegree.setValue('MSc Data Science')
      await thirdDegree.setValue('Diploma')
      await nextTick()

      const { education } = useCVState()
      const [first, second, third] = education.value.map(e => e.id)

      await wrapper.find('[data-testid="remove-education-1"]').trigger('click')
      await nextTick()

      expect(education.value).toHaveLength(2)
      expect(education.value[0]!.id).toBe(first)
      expect(education.value[1]!.id).toBe(third)
      expect(education.value.some(e => e.id === second)).toBe(false)
    })

    it('resets the single remaining entry to blank values and clears the global state when the last entry is cleared', async () => {
      const wrapper = await mountEducationPage()
      await nextTick()

      const degreeInput = wrapper.find('[data-testid="Degree / Certificate"]')
      await degreeInput.setValue('BSc Computer Science')
      await nextTick()

      const schoolInput = wrapper.find('[data-testid="School / University"]')
      await schoolInput.setValue('KNUST')
      await nextTick()

      let { education } = useCVState()
      expect(education.value).toHaveLength(1)

      await wrapper.find('[data-testid="remove-education-0"]').trigger('click')
      await nextTick()

      education = useCVState().education
      expect(education.value).toEqual([])
      expect(wrapper.find('[data-testid="education-card-0"]').exists()).toBe(true)
      expect(wrapper.text()).not.toContain('No education added yet')

      const resetDegreeInput = wrapper.find('[data-testid="Degree / Certificate"]')
      expect((resetDegreeInput.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('Validation', () => {
    it('shows no errors before "Next" is clicked', async () => {
      const wrapper = await mountEducationPage()
      expect(wrapper.findAll('.error')).toHaveLength(0)
    })

    it('shows required field errors when "Next" is clicked with blank fields', async () => {
      const wrapper = await mountEducationPage()

      const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))
      await nextBtn!.trigger('click')
      await nextTick()

      const errors = wrapper.findAll('.error')
      expect(errors.length).toBeGreaterThanOrEqual(3)

      const errorTexts = errors.map(e => e.text())
      expect(errorTexts.some(t => t.toLowerCase().includes('degree'))).toBe(true)
      expect(errorTexts.some(t => t.toLowerCase().includes('school'))).toBe(true)
      expect(errorTexts.some(t => t.toLowerCase().includes('start date'))).toBe(true)
    })

    it('shows errors for both entries when two entries have missing required fields', async () => {
      const wrapper = await mountEducationPage()

      await wrapper.find('[data-testid="add-another-education"]').trigger('click')
      await nextTick()

      const nextBtn = wrapper.findAll('button').find(b => b.text().includes('Next'))
      await nextBtn!.trigger('click')
      await nextTick()

      // 2 entries × 3 required fields = 6 errors minimum
      const errors = wrapper.findAll('.error')
      expect(errors.length).toBeGreaterThanOrEqual(6)
    })
  })
})
