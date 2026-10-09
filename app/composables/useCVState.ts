import { useState } from '#imports'
import { computed } from 'vue'
import { templateAccent } from '../utils/templateAccents'

export interface PersonalDetails {
  firstName: string
  lastName: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  linkedinUrl: string
  githubUrl: string
  twitterUrl: string
  websiteUrl: string
}

export interface ExperienceItem {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string | null
  isCurrent?: boolean
  description: string
}

export interface EducationItem {
  id: string
  degree: string
  school: string
  fieldOfStudy?: string
  location: string
  startDate: string
  endDate: string | null
  isCurrent?: boolean
  description: string
}

export interface SkillItem {
  id: string
  name: string
  level: string
}

export interface CertificationItem {
  id: string
  name: string
  issuer: string
  date: string
  expirationDate?: string
  doesNotExpire?: boolean
  credentialId?: string
  credentialUrl?: string
  description?: string
}

export type StepStatus = 'empty' | 'incomplete' | 'complete'

/**
 * The field messages a rejected save came back with, and the editor record they
 * belong to.
 *
 * `target` is the id of the section item that was being written, or
 * `'personal'` for the personal-details record; a page shows a message only on
 * the record it belongs to, so one rejected entry cannot put a message under
 * another. `fields` is keyed by the backend's own field name.
 */
export interface SaveErrorDetail {
  target: string | null
  fields: Record<string, string>
}

/**
 * The backend's name for a field the editor calls something else.
 *
 * Sending a field under the editor's name means DRF drops it without
 * complaint, and naming it back is what lets a rejection land on the input that
 * caused it. `title` is the experience's job title — the CV-level title is not
 * a field of any record an error is shown against.
 */
const backendFieldNames: Record<string, string> = {
  website: 'websiteUrl',
  title: 'role',
  school: 'institution',
  date: 'issueDate',
}

export const useCVState = () => {
  const hasActiveCV = useState<boolean>('cv-has-active', () => false)
  const cvId = useCookie<string | null>('cv-id', { default: () => null })
  const cvTitle = useState<string>('cv-title', () => 'Untitled')
  const selectedTemplateId = useCookie<string>('cv-template-id', { default: () => '' })
  const selectedTemplateSlug = useCookie<string>('cv-template-slug', { default: () => 'classic' })
  const lastSavedAt = useState<string | null>('cv-last-saved-at', () => null)
  const saveState = useState<'saving' | 'saved' | 'error' | 'idle'>('cv-save-state', () => 'idle')
  const saveErrorMessage = useState<string | null>('cv-save-error', () => null)
  /**
   * The accent colour of every CV that has had one chosen, keyed by CV id.
   *
   * One colour for the whole account was the wrong shape: picking a colour on
   * one CV repainted every other one. A CV that has never had a colour chosen
   * takes its template's own (see `templateAccent`), so a template that was
   * never customised keeps the look it was designed with.
   *
   * A CV that does not exist yet has no id to key on — the editor creates one
   * on the first save, and a colour can be picked before that — so that choice
   * lives under `draft` until the CV has a colour of its own.
   */
  const accentColorsCookie = useCookie<Record<string, string>>('cv-accent-colors', {
    default: () => ({}),
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
  })

  const accentColorsShared = useState<Record<string, string>>('cv-accent-colors-shared', () => accentColorsCookie.value || {})

  const DRAFT_ACCENT_KEY = 'draft'

  const accentColor = computed<string>({
    get: () => {
      const stored = accentColorsShared.value || {}
      return stored[cvId.value || DRAFT_ACCENT_KEY]
        || stored[DRAFT_ACCENT_KEY]
        || templateAccent(selectedTemplateSlug.value)
    },
    set: (value: string) => {
      const updated = { ...(accentColorsShared.value || {}), [cvId.value || DRAFT_ACCENT_KEY]: value }
      accentColorsShared.value = updated
      accentColorsCookie.value = updated
    },
  })
  /**
   * The fields a rejected save named. `saveErrorMessage` is the header badge
   * and has room for one sentence; this is what the editor pages render beside
   * the offending field, on the record it belongs to.
   */
  const saveErrorDetail = useState<SaveErrorDetail>('cv-save-error-detail', () => ({ target: null, fields: {} }))

  /**
   * The message the backend sent for one field of one record, or '' when it had
   * nothing to say about it.
   */
  const saveErrorFor = (target: string, key: string): string => {
    const detail = saveErrorDetail.value
    if (detail.target !== target) return ''
    return detail.fields[backendFieldNames[key] ?? key] ?? ''
  }

  const personal = useState<PersonalDetails>('cv-personal', () => ({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedinUrl: '',
    githubUrl: '',
    twitterUrl: '',
    websiteUrl: '',
  }))

  const summary = useState<string>('cv-summary', () => '')

  const experience = useState<ExperienceItem[]>('cv-experience', () => [])

  const education = useState<EducationItem[]>('cv-education', () => [])

  const skills = useState<SkillItem[]>('cv-skills', () => [])

  const certifications = useState<CertificationItem[]>('cv-certifications', () => [])

  const getPersonalStatus = (): StepStatus => {
    const p = personal.value

    // Phone and location are required by the backend — it answers either one
    // blank with "This field may not be blank" — so they sit with the required
    // trio rather than with the optional extras.
    const reqFilled = !!(
      p.firstName.trim()
      && p.lastName.trim()
      && p.email.trim()
      && p.phone.trim()
      && p.location.trim()
    )
    const titleFilled = !!p.title.trim()

    if (reqFilled && titleFilled) return 'complete'
    if (reqFilled) return 'incomplete'
    return 'empty'
  }

  const getSummaryStatus = (): StepStatus => {
    return summary.value.trim().length > 0 ? 'complete' : 'empty'
  }

  const getExperienceStatus = (): StepStatus => {
    const filled = experience.value.filter(
      e => e.title.trim() && e.company.trim() && e.startDate.trim(),
    )
    if (filled.length === 0) return 'empty'
    if (filled.length === experience.value.length) return 'complete'
    return 'incomplete'
  }

  const getEducationStatus = (): StepStatus => {
    const filled = education.value.filter(
      e => e.degree.trim() && e.school.trim() && e.startDate.trim(),
    )
    if (filled.length === 0) return 'empty'
    if (filled.length === education.value.length) return 'complete'
    return 'incomplete'
  }

  const getSkillsStatus = (): StepStatus => {
    if (skills.value.length === 0) return 'empty'
    const isComplete = skills.value.every(s => s.name.trim())
    return isComplete ? 'complete' : 'incomplete'
  }

  const getCertificationsStatus = (): StepStatus => {
    if (certifications.value.length === 0) return 'empty'
    const isComplete = certifications.value.every(c => c.name.trim() && c.issuer.trim() && c.date.trim())
    return isComplete ? 'complete' : 'incomplete'
  }

  const previewData = computed(() => {
    const p = personal.value || {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedinUrl: '',
      githubUrl: '',
      twitterUrl: '',
      websiteUrl: '',
    }
    return {
      personal: {
        firstName: p.firstName.trim() || 'Your',
        lastName: p.lastName.trim() || 'Name',
        title: p.title.trim() || 'Professional Title',
        email: p.email.trim() || 'you@example.com',
        phone: p.phone.trim() || '0x0000000',
        location: p.location.trim() || 'City, Country',
        website: p.website.trim() || 'www.yourwebsite.com',
        linkedinUrl: p.linkedinUrl?.trim() || '',
        githubUrl: p.githubUrl?.trim() || '',
        twitterUrl: p.twitterUrl?.trim() || '',
        websiteUrl: p.websiteUrl?.trim() || p.website?.trim() || 'www.yourwebsite.com',
      },
      summary: summary.value.trim() || 'Your professional summary will appear here. Write a short, impactful paragraph highlighting your key achievements, skills, and career goals.',
      experience: experience.value.length > 0
        ? experience.value
        : [
            {
              id: 'mock-1',
              title: 'Your Job Title',
              company: 'Company Name',
              location: 'City, Country',
              startDate: 'Start Date',
              endDate: 'End Date',
              description: 'Describe your responsibilities, key achievements, and the impact you made in this role.',
            },
            {
              id: 'mock-2',
              title: 'Previous Job Title',
              company: 'Previous Company Name',
              location: 'City, Country',
              startDate: 'Start Date',
              endDate: 'End Date',
              description: 'List your accomplishments and the specific tasks you were responsible for during your time here.',
            },
          ],
      education: education.value.length > 0
        ? education.value
        : [
            {
              id: 'mock-edu-1',
              degree: 'Your Degree or Certification',
              school: 'School or University Name',
              location: 'City, Country',
              startDate: 'Start Date',
              endDate: 'End Date',
              description: 'Add any honors, awards, minors, or relevant coursework here.',
            },
          ],
      skills: skills.value.length > 0
        ? skills.value
        : [
            { id: 'mock-skill-1', name: 'Your Skill', level: 'Level' },
            { id: 'mock-skill-2', name: 'Another Skill', level: 'Level' },
            { id: 'mock-skill-3', name: 'Relevant Tool', level: 'Level' },
          ],
      certifications: certifications.value,
    }
  })

  // Raw data without placeholders for PDF export
  const rawCVData = computed(() => {
    return {
      personal: personal.value || {},
      summary: summary.value || '',
      experience: experience.value || [],
      education: education.value || [],
      skills: skills.value || [],
      certifications: certifications.value || [],
    }
  })

  const resetCV = () => {
    hasActiveCV.value = false
    // A field error belongs to the record that was open, so it goes with it.
    saveErrorDetail.value = { target: null, fields: {} }
    // The colour belongs to the CV it was chosen for, so only that CV's entry
    // goes — the other CVs keep theirs. The draft goes too: it was picked for
    // the CV being left, not for whichever one is opened next. Read before
    // `cvId` is cleared below, which is what names the entry.
    const accentKeys = { ...(accentColorsShared.value || {}) }
    Reflect.deleteProperty(accentKeys, cvId.value || DRAFT_ACCENT_KEY)
    Reflect.deleteProperty(accentKeys, DRAFT_ACCENT_KEY)
    accentColorsShared.value = accentKeys
    accentColorsCookie.value = accentKeys
    // Clearing this matters as much as the rest: cvId is a cookie, so leaving it
    // set would point the editor at a CV that was just deleted or replaced, and
    // the next mount would happily load it back.
    cvId.value = null
    cvTitle.value = 'Untitled'
    selectedTemplateId.value = ''
    selectedTemplateSlug.value = 'classic'
    personal.value = {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedinUrl: '',
      githubUrl: '',
      twitterUrl: '',
      websiteUrl: '',
    }
    summary.value = ''
    experience.value = []
    education.value = []
    skills.value = []
    certifications.value = []
  }

  return {
    hasActiveCV,
    cvId,
    cvTitle,
    selectedTemplateId,
    selectedTemplateSlug,
    lastSavedAt,
    saveState,
    saveErrorMessage,
    saveErrorDetail,
    saveErrorFor,
    accentColor,
    personal,
    summary,
    experience,
    education,
    skills,
    certifications,
    getPersonalStatus,
    getSummaryStatus,
    getExperienceStatus,
    getEducationStatus,
    getSkillsStatus,
    getCertificationsStatus,
    previewData,
    rawCVData,
    resetCV,
  }
}
