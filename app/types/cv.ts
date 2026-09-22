export interface PersonalDetails {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  website?: string
  github?: string
  twitter?: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field_of_study?: string
  start_date: string
  end_date: string | null // null indicates "Present"
  description?: string
  display_order: number
}

export interface Experience {
  id: string
  company: string
  role: string
  location?: string
  start_date: string
  end_date: string | null
  description?: string
  display_order: number
}

export interface Skill {
  id: string
  name: string
  display_order: number
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issue_date?: string
  credential_url?: string
  display_order: number
}

export interface Language {
  id: string
  name: string
  proficiency?: string
  display_order: number
}

export interface Award {
  id: string
  name: string
  issuer?: string
  date?: string
  description?: string
  display_order: number
}

export interface AdditionalInformation {
  id: string
  title: string
  content: string
  display_order: number
}

// This interface represents the full dataset a Template component receives.
// It is the "resolved" view of a CV (UUID arrays have been mapped to actual objects).
export interface ResolvedCvData {
  title?: string
  professional_summary?: string
  personal_details: PersonalDetails
  educations: Education[]
  experiences: Experience[]
  skills: Skill[]
  certifications: Certification[]
  languages: Language[]
  awards: Award[]
  additional_information: AdditionalInformation[]
}
