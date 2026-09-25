import { useState } from '#imports'
import { computed } from 'vue'

export interface PersonalDetails {
  firstName: string
  lastName: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  nationality: string
  dateOfBirth: string
  passport: string
  availability: string
}

export interface ExperienceItem {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  description: string
}

export interface EducationItem {
  id: string
  degree: string
  school: string
  location: string
  startDate: string
  endDate: string
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
}

export type StepStatus = 'empty' | 'incomplete' | 'complete'

export const useCVState = () => {
  const hasActiveCV = useState<boolean>('cv-has-active', () => false)
  const cvTitle = useState<string>('cv-title', () => 'Untitled')
  const selectedTemplateId = useState<string>('cv-template-id', () => 'classic')

  const personal = useState<PersonalDetails>('cv-personal', () => ({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    nationality: '',
    dateOfBirth: '',
    passport: '',
    availability: '',
  }))

  const summary = useState<string>('cv-summary', () => '')

  const experience = useState<ExperienceItem[]>('cv-experience', () => [])

  const education = useState<EducationItem[]>('cv-education', () => [])

  const skills = useState<SkillItem[]>('cv-skills', () => [])

  const certifications = useState<CertificationItem[]>('cv-certifications', () => [])

  const getPersonalStatus = (): StepStatus => {
    const p = personal.value

    const reqFilled = !!(p.firstName.trim() && p.lastName.trim() && p.email.trim())
    const standardOptionalFilled = !!(p.title.trim() && p.phone.trim() && p.location.trim())

    if (reqFilled && standardOptionalFilled) return 'complete'
    if (reqFilled) return 'incomplete'
    return 'empty'
  }

  const getSummaryStatus = (): StepStatus => {
    return summary.value.trim().length > 0 ? 'complete' : 'empty'
  }

  const getExperienceStatus = (): StepStatus => {
    if (experience.value.length === 0) return 'empty'
    const isComplete = experience.value.every(e => e.title.trim() && e.company.trim() && e.startDate.trim())
    return isComplete ? 'complete' : 'incomplete'
  }

  const getEducationStatus = (): StepStatus => {
    if (education.value.length === 0) return 'empty'
    const isComplete = education.value.every(e => e.degree.trim() && e.school.trim() && e.startDate.trim())
    return isComplete ? 'complete' : 'incomplete'
  }

  const getSkillsStatus = (): StepStatus => {
    if (skills.value.length === 0) return 'empty'
    const isComplete = skills.value.every(s => s.name.trim())
    return isComplete ? 'complete' : 'incomplete'
  }

  const getCertificationsStatus = (): StepStatus => {
    if (certifications.value.length === 0) return 'empty'
    const isComplete = certifications.value.every(c => c.name.trim() && c.issuer.trim())
    return isComplete ? 'complete' : 'incomplete'
  }

  const previewData = computed(() => {
    const p = personal.value
    return {
      personal: {
        firstName: p.firstName.trim() || 'Your',
        lastName: p.lastName.trim() || 'Name',
        title: p.title.trim() || 'Professional Title',
        email: p.email.trim() || 'you@example.com',
        phone: p.phone.trim() || '0x0000000',
        location: p.location.trim() || 'City, Country',
        website: p.website.trim() || 'www.yourwebsite.com',
        nationality: p.nationality.trim() || 'Nationality',
        dateOfBirth: p.dateOfBirth.trim() || 'DD/MM/YYYY',
        passport: p.passport.trim() || 'Passport Number',
        availability: p.availability.trim() || 'Availability Status',
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
    }
  })

  // Raw data without placeholders for PDF export
  const rawCVData = computed(() => {
    return {
      personal: personal.value,
      summary: summary.value,
      experience: experience.value,
      education: education.value,
      skills: skills.value,
      certifications: certifications.value,
    }
  })

  const resetCV = () => {
    hasActiveCV.value = false
    cvTitle.value = 'Untitled'
    selectedTemplateId.value = 'classic'
    personal.value = {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      nationality: '',
      dateOfBirth: '',
      passport: '',
      availability: '',
    }
    summary.value = ''
    experience.value = []
    education.value = []
    skills.value = []
    certifications.value = []
  }

  return {
    hasActiveCV,
    cvTitle,
    selectedTemplateId,
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
