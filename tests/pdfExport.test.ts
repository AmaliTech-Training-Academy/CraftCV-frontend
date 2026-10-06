import { describe, expect, it } from 'vitest'
import { buildDocumentDefinition } from '~/utils/pdfExport'
import { getRenderer, PDF_RENDERERS } from '~/utils/pdf/registry'
import { buildClassicPdf } from '~/utils/pdf/templates/classic'
import { buildModernPdf } from '~/utils/pdf/templates/modern'
import { buildProfessionalPdf } from '~/utils/pdf/templates/professional'

const fullCvData = {
  title: 'Lead Software Architect',
  personal: {
    firstName: 'Alexandra',
    lastName: 'Chen',
    title: 'Lead Software Architect',
    email: 'alexandra@example.com',
    phone: '+1 555 0192',
    location: 'San Francisco, CA',
    website: 'alexandra.dev',
    linkedin: 'linkedin.com/in/alexandrachen',
    github: 'github.com/alexandrachen',
  },
  summary: 'Architecting scalable cloud systems.',
  experience: [
    {
      id: 'exp-1',
      title: 'Principal Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      startDate: '2021',
      endDate: null,
      description: '- Architected distributed event streaming\n- Mentored 12 senior engineers\nStandard paragraph description.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'M.S. Computer Science',
      school: 'Stanford University',
      fieldOfStudy: 'Distributed Systems',
      location: 'Stanford, CA',
      startDate: '2017',
      endDate: '2019',
      description: 'Specialized in consensus protocols.',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'TypeScript', level: 'Expert' },
    { id: 'skill-2', name: 'Go', level: 'Advanced' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
      credentialUrl: 'https://aws.amazon.com/verify/12345',
    },
  ],
  languages: [
    { id: 'lang-1', name: 'English', proficiency: 'Native' },
    { id: 'lang-2', name: 'Mandarin', proficiency: 'Fluent' },
  ],
  awards: [
    {
      id: 'award-1',
      name: 'Innovator of the Year',
      issuer: 'Tech Corp',
      date: '2022',
      description: 'Awarded for patented distributed cache architecture.',
    },
  ],
  additional_information: [
    {
      id: 'info-1',
      title: 'Publications',
      content: 'Author of Designing Reliable Microservices (2024).',
    },
  ],
}

describe('PDF Registry', () => {
  it('selects classic, modern, and professional renderers by slug', () => {
    expect(getRenderer('classic')).toBe(buildClassicPdf)
    expect(getRenderer('modern')).toBe(buildModernPdf)
    expect(getRenderer('professional')).toBe(buildProfessionalPdf)
  })

  it('normalizes slug casing and whitespace', () => {
    expect(getRenderer('  CLASSIC  ')).toBe(buildClassicPdf)
    expect(getRenderer('Modern')).toBe(buildModernPdf)
    expect(getRenderer('PROFESSIONAL')).toBe(buildProfessionalPdf)
  })

  it('falls back to classic for unknown or missing slugs', () => {
    expect(getRenderer('unknown-slug')).toBe(buildClassicPdf)
    expect(getRenderer('')).toBe(buildClassicPdf)
    expect(getRenderer(null)).toBe(buildClassicPdf)
    expect(getRenderer(undefined)).toBe(buildClassicPdf)
  })

  it('contains expected renderer keys', () => {
    expect(Object.keys(PDF_RENDERERS)).toEqual(['classic', 'modern', 'professional'])
  })
})

describe('Classic PDF Renderer (buildClassicPdf)', () => {
  it('builds an A4 document definition with embedded sections', () => {
    const doc = buildDocumentDefinition({
      cvData: fullCvData,
      filename: 'test.pdf',
      paperSize: 'a4',
      includeLinks: true,
      templateSlug: 'classic',
    })
    const serialized = JSON.stringify(doc)

    expect(doc.pageSize).toBe('A4')
    expect(doc.info?.title).toBe('Lead Software Architect')
    expect(serialized).toContain('ALEXANDRA CHEN')
    expect(serialized).toContain('LEAD SOFTWARE ARCHITECT')
    expect(serialized).toContain('Architecting scalable cloud systems.')
    expect(serialized).toContain('Principal Engineer')
    expect(serialized).toContain('Tech Corp')
    expect(serialized).toContain('Present')
    expect(serialized).toContain('Stanford University')
    expect(serialized).toContain('TypeScript (Expert)')
    expect(serialized).toContain('AWS Solutions Architect')
    expect(serialized).toContain('English (Native)')
    expect(serialized).toContain('Innovator of the Year')
    expect(serialized).toContain('Publications')
    expect(serialized).toContain('https://aws.amazon.com/verify/12345')
  })

  it('builds a Letter document and disables link annotations when includeLinks is false', () => {
    const doc = buildDocumentDefinition({
      cvData: fullCvData,
      filename: 'test.pdf',
      paperSize: 'letter',
      includeLinks: false,
      templateSlug: 'classic',
    })
    const serialized = JSON.stringify(doc)

    expect(doc.pageSize).toBe('LETTER')
    expect(serialized).not.toContain('mailto:alexandra@example.com')
    expect(serialized).not.toContain('https://alexandra.dev')
    expect(serialized).toContain('alexandra.dev')
  })

  it('omits optional sections when data is empty', () => {
    const minimal = {
      personal: { firstName: 'Jane', lastName: 'Doe' },
    }
    const doc = buildDocumentDefinition({
      cvData: minimal,
      filename: 'test.pdf',
      paperSize: 'a4',
      templateSlug: 'classic',
    })
    const serialized = JSON.stringify(doc)

    expect(serialized).toContain('JANE DOE')
    expect(serialized).not.toContain('Experience')
    expect(serialized).not.toContain('Education')
    expect(serialized).not.toContain('Skills')
    expect(serialized).not.toContain('Certifications')
    expect(serialized).not.toContain('Languages')
    expect(serialized).not.toContain('Awards')
  })

  it('uses Roboto font (not Times) in defaultStyle to avoid missing-font crashes', () => {
    const doc = buildDocumentDefinition({
      cvData: fullCvData,
      filename: 'test.pdf',
      paperSize: 'a4',
      templateSlug: 'classic',
    })

    expect(doc.defaultStyle).toBeDefined()
    expect((doc.defaultStyle as Record<string, unknown>).font).toBe('Roboto')
  })
})

describe('Modern PDF Renderer (buildModernPdf)', () => {
  it('builds a modern single-column document with all sections and A4 size', () => {
    const doc = buildDocumentDefinition({
      cvData: fullCvData,
      filename: 'test.pdf',
      paperSize: 'a4',
      includeLinks: true,
      templateSlug: 'modern',
    })
    const serialized = JSON.stringify(doc)

    expect(doc.pageSize).toBe('A4')
    expect(serialized).toContain('Alexandra Chen')
    expect(serialized).toContain('Lead Software Architect')
    expect(serialized).toContain('PROFESSIONAL SUMMARY')
    expect(serialized).toContain('PROFESSIONAL EXPERIENCE')
    expect(serialized).toContain('Principal Engineer')
    expect(serialized).toContain('Present')
    expect(serialized).toContain('Stanford University')
    expect(serialized).toContain('TypeScript (Expert)')
    expect(serialized).toContain('AWS Solutions Architect')
    expect(serialized).toContain('English (Native)')
    expect(serialized).toContain('Innovator of the Year')
    expect(serialized).toContain('Publications')
    expect(serialized).toContain('https://aws.amazon.com/verify/12345')
  })

  it('builds a Letter document and respects includeLinks = false', () => {
    const doc = buildDocumentDefinition({
      cvData: fullCvData,
      filename: 'test.pdf',
      paperSize: 'letter',
      includeLinks: false,
      templateSlug: 'modern',
    })
    const serialized = JSON.stringify(doc)

    expect(doc.pageSize).toBe('LETTER')
    expect(serialized).not.toContain('mailto:alexandra@example.com')
  })

  it('omits empty optional sections', () => {
    const minimal = {
      personal: { firstName: 'Jane', lastName: 'Doe' },
    }
    const doc = buildDocumentDefinition({
      cvData: minimal,
      filename: 'test.pdf',
      paperSize: 'a4',
      templateSlug: 'modern',
    })
    const serialized = JSON.stringify(doc)

    expect(serialized).toContain('Jane Doe')
    expect(serialized).not.toContain('PROFESSIONAL EXPERIENCE')
    expect(serialized).not.toContain('Education')
    expect(serialized).not.toContain('Skills')
  })
})

describe('Professional PDF Renderer (buildProfessionalPdf)', () => {
  it('builds a professional two-column document with sidebar and dark background', () => {
    const doc = buildDocumentDefinition({
      cvData: fullCvData,
      filename: 'test.pdf',
      paperSize: 'a4',
      includeLinks: true,
      templateSlug: 'professional',
    })
    const serialized = JSON.stringify(doc)

    expect(doc.pageSize).toBe('A4')
    expect(typeof doc.background).toBe('function')
    const bg = typeof doc.background === 'function' ? doc.background(1, { width: 595, height: 842, orientation: 'portrait' }) : null
    expect(JSON.stringify(bg)).toContain('#2C3E50')

    expect(serialized).toContain('ALEXANDRA CHEN')
    expect(serialized).toContain('LEAD SOFTWARE ARCHITECT')
    expect(serialized).toContain('CONTACT')
    expect(serialized).toContain('SKILLS')
    expect(serialized).toContain('EDUCATION')
    expect(serialized).toContain('LANGUAGES')
    expect(serialized).toContain('PROFESSIONAL SUMMARY')
    expect(serialized).toContain('PROFESSIONAL EXPERIENCE')
    expect(serialized).toContain('Principal Engineer')
    expect(serialized).toContain('Present')
    expect(serialized).toContain('CERTIFICATIONS')
    expect(serialized).toContain('AWARDS')
    expect(serialized).toContain('ADDITIONAL INFORMATION')
  })

  it('builds a Letter document and respects includeLinks = false', () => {
    const doc = buildDocumentDefinition({
      cvData: fullCvData,
      filename: 'test.pdf',
      paperSize: 'letter',
      includeLinks: false,
      templateSlug: 'professional',
    })
    const serialized = JSON.stringify(doc)

    expect(doc.pageSize).toBe('LETTER')
    expect(serialized).not.toContain('mailto:alexandra@example.com')
  })

  it('omits empty optional sections in both sidebar and main column', () => {
    const minimal = {
      personal: { firstName: 'Jane', lastName: 'Doe' },
    }
    const doc = buildDocumentDefinition({
      cvData: minimal,
      filename: 'test.pdf',
      paperSize: 'a4',
      templateSlug: 'professional',
    })
    const serialized = JSON.stringify(doc)

    expect(serialized).toContain('JANE DOE')
    expect(serialized).not.toContain('PROFESSIONAL EXPERIENCE')
    expect(serialized).not.toContain('CERTIFICATIONS')
    expect(serialized).not.toContain('AWARDS')
  })
})

describe('Backend-shaped snake_case data support', () => {
  it('normalizes backend-shaped ResolvedCvData into document definition', () => {
    const backendData = {
      title: 'Backend Engineer',
      personal_details: {
        first_name: 'Morgan',
        last_name: 'Lee',
        email: 'morgan@example.com',
      },
      professional_summary: 'Experienced backend engineer.',
      experiences: [
        {
          id: 'exp-1',
          role: 'Senior Backend Developer',
          company: 'Acme Corp',
          start_date: '2020',
          end_date: null,
          description: '- Designed microservices',
        },
      ],
      educations: [
        {
          id: 'edu-1',
          institution: 'MIT',
          degree: 'B.S.',
          field_of_study: 'EECS',
          start_date: '2016',
          end_date: '2020',
        },
      ],
      skills: [{ id: 's-1', name: 'Go' }],
      certifications: [],
    }

    const doc = buildDocumentDefinition({
      cvData: backendData,
      filename: 'morgan.pdf',
      paperSize: 'a4',
      templateSlug: 'classic',
    })
    const serialized = JSON.stringify(doc)

    expect(serialized).toContain('MORGAN LEE')
    expect(serialized).toContain('Senior Backend Developer')
    expect(serialized).toContain('Acme Corp')
    expect(serialized).toContain('Present')
    expect(serialized).toContain('MIT')
  })
})

describe('Placeholder Stripping & Section Omission', () => {
  it('strips all mock strings and placeholder defaults from document definition', () => {
    const mockStateData = {
      title: 'Professional Title',
      personal_details: {
        first_name: 'Your',
        last_name: 'Name',
        email: 'you@example.com',
        phone: '0x0000000',
        location: 'City, Country',
        website: 'www.yourwebsite.com',
      },
      professional_summary: 'Your professional summary will appear here. Write a short, impactful paragraph highlighting your key achievements, skills, and career goals.',
      experiences: [
        {
          id: 'mock-1',
          role: 'Your Job Title',
          company: 'Company Name',
          location: 'City, Country',
          start_date: 'Start Date',
          end_date: 'End Date',
          description: 'Describe your responsibilities, key achievements, and the impact you made in this role.',
        },
      ],
      educations: [
        {
          id: 'mock-edu-1',
          degree: 'Your Degree or Certification',
          institution: 'School or University Name',
          location: 'City, Country',
          start_date: 'Start Date',
          end_date: 'End Date',
          description: 'Add any honors, awards, minors, or relevant coursework here.',
        },
      ],
      skills: [
        { id: 'mock-skill-1', name: 'Your Skill' },
        { id: 'mock-skill-2', name: 'Another Skill' },
      ],
    }

    const doc = buildDocumentDefinition({
      cvData: mockStateData,
      filename: 'test.pdf',
      paperSize: 'a4',
      templateSlug: 'modern',
    })

    const serialized = JSON.stringify(doc)
    expect(serialized).not.toContain('Your Name')
    expect(serialized).not.toContain('Professional Title')
    expect(serialized).not.toContain('Your Job Title')
    expect(serialized).not.toContain('Company Name')
    expect(serialized).not.toContain('Your Degree or Certification')
    expect(serialized).not.toContain('School or University Name')
    expect(serialized).not.toContain('Your Skill')
    expect(serialized).not.toContain('www.yourwebsite.com')
    expect(serialized).not.toContain('you@example.com')
    expect(serialized).not.toContain('0x0000000')
    expect(serialized).not.toContain('PROFESSIONAL EXPERIENCE')
    expect(serialized).not.toContain('EDUCATION')
    expect(serialized).not.toContain('SKILLS')
    expect(serialized).not.toContain('PROFESSIONAL SUMMARY')
  })

  it('renders only user-filled sections and hides unentered sections', () => {
    const partiallyFilledData = {
      personal_details: {
        first_name: 'Sarah',
        last_name: 'Connor',
      },
      experiences: [
        {
          id: 'exp-1',
          role: 'Operations Lead',
          company: 'Resistance Inc',
          start_date: '2023-01',
          end_date: null,
          description: 'Managing operations.',
        },
      ],
      educations: [],
      skills: [],
      professional_summary: '',
    }

    const doc = buildDocumentDefinition({
      cvData: partiallyFilledData,
      filename: 'sarah.pdf',
      paperSize: 'a4',
      templateSlug: 'modern',
    })

    const serialized = JSON.stringify(doc)
    expect(serialized).toContain('Sarah Connor')
    expect(serialized).toContain('Operations Lead')
    expect(serialized).toContain('Resistance Inc')
    expect(serialized).toContain('PROFESSIONAL EXPERIENCE')
    expect(serialized).not.toContain('EDUCATION')
    expect(serialized).not.toContain('SKILLS')
    expect(serialized).not.toContain('PROFESSIONAL SUMMARY')
  })

  it('decodes HTML entities in experience and education descriptions', () => {
    const dataWithEntities = {
      personal: { firstName: 'Alex', lastName: 'R' },
      experiences: [
        {
          id: 'exp-html',
          role: 'Lead R&D Engineer',
          company: 'Acme & Co',
          description: '<p>Led R&amp;D team &lt;10 members&gt;. Scale &gt; 100k users.</p>',
        },
      ],
    }

    const doc = buildDocumentDefinition({
      cvData: dataWithEntities,
      filename: 'html-entities.pdf',
      paperSize: 'a4',
      templateSlug: 'modern',
    })

    const serialized = JSON.stringify(doc)
    expect(serialized).toContain('Led R&D team <10 members>. Scale > 100k users.')
    expect(serialized).not.toContain('&amp;')
    expect(serialized).not.toContain('&lt;')
    expect(serialized).not.toContain('&gt;')
  })
})
