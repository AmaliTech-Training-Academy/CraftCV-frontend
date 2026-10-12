import { useCookie } from '#imports'

export type CareerLevel = 'entry' | 'mid' | 'executive' | null
export type CvPurpose = 'job_search' | 'school' | 'freelance' | 'ready' | null

export interface OnboardingPreferences {
  careerLevel: CareerLevel
  cvPurpose: CvPurpose
  hasUsedTemplate?: boolean
}

export const useOnboarding = () => {
  const preferences = useCookie<OnboardingPreferences>('onboarding-prefs', {
    default: () => ({
      careerLevel: null,
      cvPurpose: null,
      hasUsedTemplate: false,
    }),
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })

  const setCareerLevel = (level: CareerLevel) => {
    preferences.value = {
      ...preferences.value,
      careerLevel: level,
      hasUsedTemplate: false,
    }
  }

  const setCvPurpose = (purpose: CvPurpose) => {
    preferences.value = {
      ...preferences.value,
      cvPurpose: purpose,
    }
  }

  const markTemplateUsed = () => {
    preferences.value = {
      ...preferences.value,
      hasUsedTemplate: true,
    }
  }

  const getRecommendedTemplateId = (): string | null => {
    if (preferences.value?.hasUsedTemplate) return null

    const { careerLevel, cvPurpose } = preferences.value || {}

    if (!careerLevel) return null

    if (careerLevel === 'entry' && cvPurpose === 'school') {
      return 'campus'
    }

    if (careerLevel === 'executive') {
      return 'prism'
    }

    if (careerLevel === 'mid') {
      return 'northstar'
    }

    // Default for entry-level job search or others
    return 'sprout'
  }

  return {
    preferences,
    setCareerLevel,
    setCvPurpose,
    markTemplateUsed,
    getRecommendedTemplateId,
  }
}
