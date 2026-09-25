// @vitest-environment nuxt
import { describe, expect, it, beforeEach } from 'vitest'
import { useCVState } from '../app/composables/useCVState'

describe('useCVState', () => {
  beforeEach(() => {
    const state = useCVState()
    state.resetCV()
  })

  describe('step statuses and required fields', () => {
    it('returns empty for initial personal status', () => {
      const { getPersonalStatus } = useCVState()
      expect(getPersonalStatus()).toBe('empty')
    })

    it('returns incomplete for personal status when only required fields are filled', () => {
      const { personal, getPersonalStatus } = useCVState()
      personal.value.firstName = 'John'
      personal.value.lastName = 'Doe'
      personal.value.email = 'john@example.com'

      expect(getPersonalStatus()).toBe('incomplete')
    })

    it('returns complete for personal status when required and standard optional fields are filled', () => {
      const { personal, getPersonalStatus } = useCVState()
      personal.value.firstName = 'John'
      personal.value.lastName = 'Doe'
      personal.value.email = 'john@example.com'
      personal.value.title = 'Developer'
      personal.value.phone = '1234567890'
      personal.value.location = 'Accra'

      expect(getPersonalStatus()).toBe('complete')
    })

    it('returns empty for summary status when empty', () => {
      const { getSummaryStatus } = useCVState()
      expect(getSummaryStatus()).toBe('empty')
    })

    it('returns complete for summary status when filled', () => {
      const { summary, getSummaryStatus } = useCVState()
      summary.value = 'Experienced developer.'
      expect(getSummaryStatus()).toBe('complete')
    })

    it('evaluates experience status correctly', () => {
      const { experience, getExperienceStatus } = useCVState()
      expect(getExperienceStatus()).toBe('empty')

      experience.value.push({ id: '1', title: 'Dev', company: '', location: '', startDate: '', endDate: '', description: '' })
      expect(getExperienceStatus()).toBe('incomplete')

      experience.value[0]!.company = 'Tech'
      experience.value[0]!.startDate = '2020'
      expect(getExperienceStatus()).toBe('complete')
    })

    it('evaluates education status correctly', () => {
      const { education, getEducationStatus } = useCVState()
      expect(getEducationStatus()).toBe('empty')

      education.value.push({ id: '1', degree: 'BSc', school: '', location: '', startDate: '', endDate: '', description: '' })
      expect(getEducationStatus()).toBe('incomplete')

      education.value[0]!.school = 'UG'
      education.value[0]!.startDate = '2015'
      expect(getEducationStatus()).toBe('complete')
    })

    it('evaluates skills status correctly', () => {
      const { skills, getSkillsStatus } = useCVState()
      expect(getSkillsStatus()).toBe('empty')

      skills.value.push({ id: '1', name: '', level: '' })
      expect(getSkillsStatus()).toBe('incomplete')

      skills.value[0]!.name = 'Vue'
      expect(getSkillsStatus()).toBe('complete')
    })

    it('evaluates certifications status correctly', () => {
      const { certifications, getCertificationsStatus } = useCVState()
      expect(getCertificationsStatus()).toBe('empty')

      certifications.value.push({ id: '1', name: 'AWS', issuer: '', date: '' })
      expect(getCertificationsStatus()).toBe('incomplete')

      certifications.value[0]!.issuer = 'Amazon'
      expect(getCertificationsStatus()).toBe('complete')
    })
  })

  describe('previewData vs rawCVData', () => {
    it('returns placeholders for empty personal fields in previewData but empty strings in rawCVData', () => {
      const { previewData, rawCVData } = useCVState()

      expect(previewData.value.personal.firstName).toBe('Your')
      expect(rawCVData.value.personal.firstName).toBe('')

      expect(previewData.value.personal.email).toBe('you@example.com')
      expect(rawCVData.value.personal.email).toBe('')
    })

    it('returns placeholders for empty list fields in previewData but empty arrays in rawCVData', () => {
      const { previewData, rawCVData } = useCVState()

      expect(previewData.value.experience.length).toBe(2)
      expect(previewData.value.experience[0]!.title).toBe('Your Job Title')
      expect(rawCVData.value.experience.length).toBe(0)

      expect(previewData.value.education.length).toBe(1)
      expect(rawCVData.value.education.length).toBe(0)

      expect(previewData.value.skills.length).toBe(3)
      expect(rawCVData.value.skills.length).toBe(0)
    })

    it('returns real values in both previewData and rawCVData when fields are filled', () => {
      const { personal, experience, previewData, rawCVData } = useCVState()

      personal.value.firstName = 'Alice'
      experience.value.push({ id: 'exp-1', title: 'Engineer', company: 'Corp', location: '', startDate: '', endDate: '', description: '' })

      expect(previewData.value.personal.firstName).toBe('Alice')
      expect(rawCVData.value.personal.firstName).toBe('Alice')

      expect(previewData.value.experience.length).toBe(1)
      expect(previewData.value.experience[0]!.title).toBe('Engineer')
      expect(rawCVData.value.experience.length).toBe(1)
      expect(rawCVData.value.experience[0]!.title).toBe('Engineer')
    })
  })

  describe('resetCV', () => {
    it('resets all CV state to initial empty values', () => {
      const { hasActiveCV, cvTitle, personal, summary, experience, resetCV } = useCVState()

      hasActiveCV.value = true
      cvTitle.value = 'My Awesome CV'
      personal.value.firstName = 'Bob'
      summary.value = 'A short summary'
      experience.value.push({ id: '1', title: 'Job', company: 'Inc', location: '', startDate: '', endDate: '', description: '' })

      resetCV()

      expect(hasActiveCV.value).toBe(false)
      expect(cvTitle.value).toBe('Untitled')
      expect(personal.value.firstName).toBe('')
      expect(summary.value).toBe('')
      expect(experience.value.length).toBe(0)
    })
  })
})
