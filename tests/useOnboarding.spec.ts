// @vitest-environment nuxt

import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboarding } from '../app/composables/useOnboarding'

describe('useOnboarding', () => {
  beforeEach(() => {
    const { preferences } = useOnboarding()
    preferences.value = {
      careerLevel: null,
      cvPurpose: null,
      hasUsedTemplate: false,
    }
  })

  it('returns null for recommended template when no career level is chosen', () => {
    const { getRecommendedTemplateId } = useOnboarding()
    expect(getRecommendedTemplateId()).toBeNull()
  })

  it('recommends campus for entry level school applicants', () => {
    const { setCareerLevel, setCvPurpose, getRecommendedTemplateId } = useOnboarding()
    setCareerLevel('entry')
    setCvPurpose('school')
    expect(getRecommendedTemplateId()).toBe('campus')
  })

  it('recommends sprout for entry level job searchers', () => {
    const { setCareerLevel, setCvPurpose, getRecommendedTemplateId } = useOnboarding()
    setCareerLevel('entry')
    setCvPurpose('job_search')
    expect(getRecommendedTemplateId()).toBe('sprout')
  })

  it('recommends northstar for mid-level professionals', () => {
    const { setCareerLevel, getRecommendedTemplateId } = useOnboarding()
    setCareerLevel('mid')
    expect(getRecommendedTemplateId()).toBe('northstar')
  })

  it('recommends prism for executive leadership', () => {
    const { setCareerLevel, getRecommendedTemplateId } = useOnboarding()
    setCareerLevel('executive')
    expect(getRecommendedTemplateId()).toBe('prism')
  })

  it('removes the recommended template once a template is marked as used', () => {
    const { setCareerLevel, setCvPurpose, getRecommendedTemplateId, markTemplateUsed } = useOnboarding()
    setCareerLevel('entry')
    setCvPurpose('job_search')

    expect(getRecommendedTemplateId()).toBe('sprout')

    // User uses any template
    markTemplateUsed()

    // Recommended badge / id is now cleared
    expect(getRecommendedTemplateId()).toBeNull()
  })

  it('restores recommendation if the user re-runs onboarding and sets career level', () => {
    const { setCareerLevel, markTemplateUsed, getRecommendedTemplateId } = useOnboarding()
    setCareerLevel('mid')
    expect(getRecommendedTemplateId()).toBe('northstar')

    markTemplateUsed()
    expect(getRecommendedTemplateId()).toBeNull()

    // User re-runs onboarding
    setCareerLevel('executive')
    expect(getRecommendedTemplateId()).toBe('prism')
  })
})
