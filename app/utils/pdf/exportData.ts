import { isRealText } from './sanitizeExportData'

export interface CvExportPersonal {
  firstName: string
  lastName: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  linkedin: string
  github: string
  twitter: string
  first_name: string
  last_name: string
}

export interface CvExportExperience {
  id: string
  title: string
  role: string
  company: string
  location: string
  startDate: string
  endDate: string
  start_date: string
  end_date: string | null
  description: string
  display_order: number
}

export interface CvExportEducation {
  id: string
  degree: string
  school: string
  institution: string
  fieldOfStudy: string
  field_of_study: string
  location: string
  startDate: string
  endDate: string
  start_date: string
  end_date: string | null
  description: string
  display_order: number
}

export interface CvExportSkill {
  id: string
  name: string
  level: string
  display_order: number
}

export interface CvExportCertification {
  id: string
  name: string
  issuer: string
  date: string
  issue_date: string
  credentialUrl: string
  credential_url: string
  display_order: number
}

export interface CvExportLanguage {
  id: string
  name: string
  proficiency: string
  display_order: number
}

export interface CvExportAward {
  id: string
  name: string
  issuer: string
  date: string
  description: string
  display_order: number
}

export interface CvExportAdditionalInformation {
  id: string
  title: string
  content: string
  display_order: number
}

export interface CvExportData {
  title: string
  personal: CvExportPersonal
  personal_details: CvExportPersonal
  summary: string
  professional_summary: string
  experience: CvExportExperience[]
  experiences: CvExportExperience[]
  education: CvExportEducation[]
  educations: CvExportEducation[]
  skills: CvExportSkill[]
  certifications: CvExportCertification[]
  languages: CvExportLanguage[]
  awards: CvExportAward[]
  additional_information: CvExportAdditionalInformation[]
}

const emptyPersonal: CvExportPersonal = {
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  github: '',
  twitter: '',
  first_name: '',
  last_name: '',
}

const asRecord = (value: unknown): Record<string, unknown> => (
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
)

const asString = (value: unknown): string => typeof value === 'string' ? value.trim() : ''

const firstString = (record: Record<string, unknown>, ...keys: string[]): string => {
  for (const key of keys) {
    const value = asString(record[key])
    if (value) return value
  }
  return ''
}

const asRecords = (value: unknown): Record<string, unknown>[] => (
  Array.isArray(value) ? value.map(asRecord) : []
)

export function toExportData(source: unknown): CvExportData {
  const data = asRecord(source)
  const personalRecord = asRecord(data.personal ?? data.personal_details)

  const rawFirstName = firstString(personalRecord, 'firstName', 'first_name')
  const rawLastName = firstString(personalRecord, 'lastName', 'last_name')
  const rawPersonalTitle = firstString(personalRecord, 'title', 'professional_title')
  const rawEmail = firstString(personalRecord, 'email')
  const rawPhone = firstString(personalRecord, 'phone')
  const rawLocation = firstString(personalRecord, 'location')
  const rawWebsite = firstString(personalRecord, 'website')
  const rawLinkedin = firstString(personalRecord, 'linkedin')
  const rawGithub = firstString(personalRecord, 'github')
  const rawTwitter = firstString(personalRecord, 'twitter')

  const firstName = isRealText(rawFirstName) ? rawFirstName : ''
  const lastName = isRealText(rawLastName) ? rawLastName : ''
  const personalTitle = isRealText(rawPersonalTitle) ? rawPersonalTitle : ''
  const email = isRealText(rawEmail) ? rawEmail : ''
  const phone = isRealText(rawPhone) ? rawPhone : ''
  const location = isRealText(rawLocation) ? rawLocation : ''
  const website = isRealText(rawWebsite) ? rawWebsite : ''
  const linkedin = isRealText(rawLinkedin) ? rawLinkedin : ''
  const github = isRealText(rawGithub) ? rawGithub : ''
  const twitter = isRealText(rawTwitter) ? rawTwitter : ''

  const personal: CvExportPersonal = {
    ...emptyPersonal,
    firstName,
    lastName,
    first_name: firstName,
    last_name: lastName,
    title: personalTitle,
    email,
    phone,
    location,
    website,
    linkedin,
    github,
    twitter,
  }

  const rawSummary = firstString(data, 'summary', 'professional_summary')
  const summary = isRealText(rawSummary) ? rawSummary : ''

  const experiences: CvExportExperience[] = asRecords(data.experience ?? data.experiences)
    .filter((item) => {
      const title = firstString(item, 'title', 'role')
      const company = firstString(item, 'company')
      return isRealText(title) || isRealText(company)
    })
    .map((item, index) => {
      const title = firstString(item, 'title', 'role')
      const company = firstString(item, 'company')
      const itemLocation = firstString(item, 'location')
      const startDate = firstString(item, 'startDate', 'start_date')
      const rawEnd = item.endDate !== undefined ? item.endDate : item.end_date
      const endDateStr = asString(rawEnd)
      const isPresent = rawEnd === null || endDateStr.toLowerCase() === 'present' || (!endDateStr && !!startDate)
      const normalizedEndDate = isPresent ? 'Present' : endDateStr

      return {
        id: firstString(item, 'id') || `experience-${index}`,
        title: isRealText(title) ? title : '',
        role: isRealText(title) ? title : '',
        company: isRealText(company) ? company : '',
        location: isRealText(itemLocation) ? itemLocation : '',
        startDate: isRealText(startDate) ? startDate : '',
        endDate: isRealText(normalizedEndDate) ? normalizedEndDate : '',
        start_date: isRealText(startDate) ? startDate : '',
        end_date: isPresent ? null : (isRealText(endDateStr) ? endDateStr : null),
        description: isRealText(firstString(item, 'description')) ? firstString(item, 'description') : '',
        display_order: typeof item.display_order === 'number' ? item.display_order : index,
      }
    })

  const educations: CvExportEducation[] = asRecords(data.education ?? data.educations)
    .filter((item) => {
      const degree = firstString(item, 'degree')
      const school = firstString(item, 'school', 'institution')
      return isRealText(degree) || isRealText(school)
    })
    .map((item, index) => {
      const degree = firstString(item, 'degree')
      const school = firstString(item, 'school', 'institution')
      const fieldOfStudy = firstString(item, 'fieldOfStudy', 'field_of_study')
      const itemLocation = firstString(item, 'location')
      const startDate = firstString(item, 'startDate', 'start_date')
      const rawEnd = item.endDate !== undefined ? item.endDate : item.end_date
      const endDateStr = asString(rawEnd)
      const isPresent = rawEnd === null || endDateStr.toLowerCase() === 'present' || (!endDateStr && !!startDate)
      const normalizedEndDate = isPresent ? 'Present' : endDateStr

      return {
        id: firstString(item, 'id') || `education-${index}`,
        degree: isRealText(degree) ? degree : '',
        school: isRealText(school) ? school : '',
        institution: isRealText(school) ? school : '',
        fieldOfStudy: isRealText(fieldOfStudy) ? fieldOfStudy : '',
        field_of_study: isRealText(fieldOfStudy) ? fieldOfStudy : '',
        location: isRealText(itemLocation) ? itemLocation : '',
        startDate: isRealText(startDate) ? startDate : '',
        endDate: isRealText(normalizedEndDate) ? normalizedEndDate : '',
        start_date: isRealText(startDate) ? startDate : '',
        end_date: isPresent ? null : (isRealText(endDateStr) ? endDateStr : null),
        description: isRealText(firstString(item, 'description')) ? firstString(item, 'description') : '',
        display_order: typeof item.display_order === 'number' ? item.display_order : index,
      }
    })

  const skills: CvExportSkill[] = asRecords(data.skills)
    .filter(item => isRealText(firstString(item, 'name')))
    .map((item, index) => ({
      id: firstString(item, 'id') || `skill-${index}`,
      name: firstString(item, 'name'),
      level: isRealText(firstString(item, 'level', 'proficiency')) ? firstString(item, 'level', 'proficiency') : '',
      display_order: typeof item.display_order === 'number' ? item.display_order : index,
    }))

  const certifications: CvExportCertification[] = asRecords(data.certifications)
    .filter(item => isRealText(firstString(item, 'name')))
    .map((item, index) => {
      const name = firstString(item, 'name')
      const issuer = firstString(item, 'issuer')
      const date = firstString(item, 'date', 'issueDate', 'issue_date')
      const credentialUrl = firstString(item, 'credentialUrl', 'credential_url')

      return {
        id: firstString(item, 'id') || `certification-${index}`,
        name,
        issuer: isRealText(issuer) ? issuer : '',
        date: isRealText(date) ? date : '',
        issue_date: isRealText(date) ? date : '',
        credentialUrl: isRealText(credentialUrl) ? credentialUrl : '',
        credential_url: isRealText(credentialUrl) ? credentialUrl : '',
        display_order: typeof item.display_order === 'number' ? item.display_order : index,
      }
    })

  const languages: CvExportLanguage[] = asRecords(data.languages)
    .filter(item => isRealText(firstString(item, 'name')))
    .map((item, index) => ({
      id: firstString(item, 'id') || `language-${index}`,
      name: firstString(item, 'name'),
      proficiency: isRealText(firstString(item, 'proficiency')) ? firstString(item, 'proficiency') : '',
      display_order: typeof item.display_order === 'number' ? item.display_order : index,
    }))

  const awards: CvExportAward[] = asRecords(data.awards)
    .filter(item => isRealText(firstString(item, 'name')))
    .map((item, index) => ({
      id: firstString(item, 'id') || `award-${index}`,
      name: firstString(item, 'name'),
      issuer: isRealText(firstString(item, 'issuer')) ? firstString(item, 'issuer') : '',
      date: isRealText(firstString(item, 'date')) ? firstString(item, 'date') : '',
      description: isRealText(firstString(item, 'description')) ? firstString(item, 'description') : '',
      display_order: typeof item.display_order === 'number' ? item.display_order : index,
    }))

  const additionalInformation: CvExportAdditionalInformation[] = asRecords(data.additional_information ?? data.additionalInformation)
    .filter(item => isRealText(firstString(item, 'title')) || isRealText(firstString(item, 'content')))
    .map((item, index) => ({
      id: firstString(item, 'id') || `additional-${index}`,
      title: isRealText(firstString(item, 'title')) ? firstString(item, 'title') : '',
      content: isRealText(firstString(item, 'content')) ? firstString(item, 'content') : '',
      display_order: typeof item.display_order === 'number' ? item.display_order : index,
    }))

  const rawDocTitle = firstString(data, 'title', 'cvTitle')
  const docTitle = isRealText(rawDocTitle) ? rawDocTitle : personalTitle

  return {
    title: docTitle,
    personal,
    personal_details: personal,
    summary,
    professional_summary: summary,
    experience: experiences,
    experiences,
    education: educations,
    educations,
    skills,
    certifications,
    languages,
    awards,
    additional_information: additionalInformation,
  }
}
