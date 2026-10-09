import type { ResolvedCvData } from '~/types/cv'

const PLACEHOLDER_STRINGS = new Set([
  'your',
  'name',
  'your name',
  'professional title',
  'your job title',
  'previous job title',
  'company name',
  'previous company name',
  'your degree or certification',
  'school or university name',
  'your skill',
  'another skill',
  'relevant tool',
  'e.g. alexandra',
  'e.g. chen',
  'e.g. senior product designer',
  'www.yourwebsite.com',
  'city, country',
  'you@example.com',
  '0x0000000',
  'start date',
  'end date',
          'level',
])

export function isRealText(val?: string | null): boolean {
  if (!val) return false
  const trimmed = val.trim()
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()

  if (PLACEHOLDER_STRINGS.has(lower)) return false
  if (lower.startsWith('e.g.') || lower.startsWith('e.g ')) return false
  if (lower.startsWith('your professional summary will appear here')) return false
  if (lower.startsWith('describe your responsibilities, key achievements')) return false
  if (lower.startsWith('list your accomplishments and the specific tasks')) return false
  if (lower.startsWith('add any honors, awards, minors')) return false

  return true
}

interface RawDataWithAliases {
  title?: string
  summary?: string
  professional_summary?: string
  personal?: Record<string, unknown>
  personal_details?: Record<string, unknown>
  experience?: Array<Record<string, unknown>>
  experiences?: Array<Record<string, unknown>>
  education?: Array<Record<string, unknown>>
  educations?: Array<Record<string, unknown>>
  skills?: Array<Record<string, unknown>>
  certifications?: Array<Record<string, unknown>>
  languages?: Array<Record<string, unknown>>
  awards?: Array<Record<string, unknown>>
  additionalInformation?: Array<Record<string, unknown>>
  additional_information?: Array<Record<string, unknown>>
}

export function sanitizeExportData(data: ResolvedCvData | Record<string, unknown>): ResolvedCvData {
  if (!data || typeof data !== 'object') {
    return {
      title: '',
      professional_summary: '',
      personal_details: {},
      experiences: [],
      educations: [],
      skills: [],
      certifications: [],
      languages: [],
      awards: [],
      additional_information: [],
    }
  }

  const raw = data as RawDataWithAliases
  const p = (raw.personal_details ?? raw.personal ?? {}) as Record<string, unknown>

  const firstName = String(p.first_name ?? p.firstName ?? '')
  const lastName = String(p.last_name ?? p.lastName ?? '')
  const email = String(p.email ?? '')
  const phone = String(p.phone ?? '')
  const location = String(p.location ?? '')
  const website = String(p.website ?? '')
  const linkedin = String(p.linkedin ?? '')
  const github = String(p.github ?? '')
  const twitter = String(p.twitter ?? '')

  const rawSummary = String(raw.professional_summary ?? raw.summary ?? '')
  const rawTitle = String(raw.title ?? '')

  const rawExperiences = raw.experiences ?? raw.experience ?? []
  const experiences = rawExperiences
    .filter((exp) => {
      const role = String(exp.role ?? exp.title ?? '')
      const company = String(exp.company ?? '')
      return isRealText(role) || isRealText(company)
    })
    .map((exp, index) => {
      const role = String(exp.role ?? exp.title ?? '')
      const company = String(exp.company ?? '')
      const loc = exp.location !== undefined ? String(exp.location) : undefined
      const desc = exp.description !== undefined ? String(exp.description) : undefined
      const startDate = exp.start_date !== undefined ? String(exp.start_date) : String(exp.startDate ?? '')
      const rawEnd = exp.end_date !== undefined ? exp.end_date : exp.endDate
      const endDate = rawEnd !== undefined && rawEnd !== null ? String(rawEnd) : null

      return {
        id: String(exp.id ?? `exp-${index}`),
        role: isRealText(role) ? role : '',
        company: isRealText(company) ? company : '',
        location: isRealText(loc) ? loc : undefined,
        description: isRealText(desc) ? desc : undefined,
        start_date: isRealText(startDate) ? startDate : '',
        end_date: isRealText(endDate) ? endDate : null,
        display_order: typeof exp.display_order === 'number' ? exp.display_order : index,
      }
    })

  const rawEducations = raw.educations ?? raw.education ?? []
  const educations = rawEducations
    .filter((edu) => {
      const degree = String(edu.degree ?? '')
      const institution = String(edu.institution ?? edu.school ?? '')
      return isRealText(degree) || isRealText(institution)
    })
    .map((edu, index) => {
      const degree = String(edu.degree ?? '')
      const institution = String(edu.institution ?? edu.school ?? '')
      const field = edu.field_of_study !== undefined ? String(edu.field_of_study) : String(edu.fieldOfStudy ?? '')
      const loc = edu.location !== undefined ? String(edu.location) : ''
      const desc = edu.description !== undefined ? String(edu.description) : undefined
      const startDate = edu.start_date !== undefined ? String(edu.start_date) : String(edu.startDate ?? '')
      const rawEnd = edu.end_date !== undefined ? edu.end_date : edu.endDate
      const endDate = rawEnd !== undefined && rawEnd !== null ? String(rawEnd) : null

      return {
        id: String(edu.id ?? `edu-${index}`),
        degree: isRealText(degree) ? degree : '',
        institution: isRealText(institution) ? institution : '',
        field_of_study: isRealText(field) ? field : '',
        location: isRealText(loc) ? loc : '',
        description: isRealText(desc) ? desc : undefined,
        start_date: isRealText(startDate) ? startDate : '',
        end_date: isRealText(endDate) ? endDate : null,
        display_order: typeof edu.display_order === 'number' ? edu.display_order : index,
      }
    })

  const rawSkills = raw.skills ?? []
  const skills = rawSkills
    .filter(skill => isRealText(String(skill.name ?? '')))
    .map((skill, index) => ({
      id: String(skill.id ?? `skill-${index}`),
      name: String(skill.name),
      display_order: typeof skill.display_order === 'number' ? skill.display_order : index,
    }))

  const rawCertifications = raw.certifications ?? []
  const certifications = rawCertifications
    .filter(cert => isRealText(String(cert.name ?? '')))
    .map((cert, index) => ({
      id: String(cert.id ?? `cert-${index}`),
      name: String(cert.name),
      issuer: isRealText(String(cert.issuer ?? '')) ? String(cert.issuer) : '',
      issue_date: isRealText(String(cert.issue_date ?? cert.date ?? '')) ? String(cert.issue_date ?? cert.date) : undefined,
      credential_url: isRealText(String(cert.credential_url ?? cert.credentialUrl ?? '')) ? String(cert.credential_url ?? cert.credentialUrl) : undefined,
      display_order: typeof cert.display_order === 'number' ? cert.display_order : index,
    }))

  const rawLanguages = raw.languages ?? []
  const languages = rawLanguages
    .filter(lang => isRealText(String(lang.name ?? '')))
    .map((lang, index) => ({
      id: String(lang.id ?? `lang-${index}`),
      name: String(lang.name),
      proficiency: isRealText(String(lang.proficiency ?? '')) ? String(lang.proficiency) : undefined,
      display_order: typeof lang.display_order === 'number' ? lang.display_order : index,
    }))

  const rawAwards = raw.awards ?? []
  const awards = rawAwards
    .filter(award => isRealText(String(award.name ?? '')))
    .map((award, index) => ({
      id: String(award.id ?? `award-${index}`),
      name: String(award.name),
      issuer: isRealText(String(award.issuer ?? '')) ? String(award.issuer) : undefined,
      date: isRealText(String(award.date ?? '')) ? String(award.date) : undefined,
      description: isRealText(String(award.description ?? '')) ? String(award.description) : undefined,
      display_order: typeof award.display_order === 'number' ? award.display_order : index,
    }))

  const rawAdditional = raw.additional_information ?? raw.additionalInformation ?? []
  const additionalInformation = rawAdditional
    .filter(info => isRealText(String(info.title ?? '')) || isRealText(String(info.content ?? '')))
    .map((info, index) => ({
      id: String(info.id ?? `info-${index}`),
      title: isRealText(String(info.title ?? '')) ? String(info.title) : '',
      content: isRealText(String(info.content ?? '')) ? String(info.content) : '',
      display_order: typeof info.display_order === 'number' ? info.display_order : index,
    }))

  return {
    ...data,
    title: isRealText(rawTitle) ? rawTitle : '',
    professional_summary: isRealText(rawSummary) ? rawSummary : '',
    personal_details: {
      first_name: isRealText(firstName) ? firstName : '',
      last_name: isRealText(lastName) ? lastName : '',
      email: isRealText(email) ? email : '',
      phone: isRealText(phone) ? phone : '',
      location: isRealText(location) ? location : '',
      website: isRealText(website) ? website : '',
      linkedin: isRealText(linkedin) ? linkedin : '',
      github: isRealText(github) ? github : '',
      twitter: isRealText(twitter) ? twitter : '',
    },
    experiences,
    experience: experiences,
    educations,
    education: educations,
    skills,
    certifications,
    languages,
    awards,
    additional_information: additionalInformation,
  } as unknown as ResolvedCvData
}
