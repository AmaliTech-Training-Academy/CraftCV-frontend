import { ref } from 'vue'

// Inline shape for mock template data — will be replaced by the real CvData type
// once ~/types/cv is defined in the shared types package.
type MockCvData = Record<string, unknown>

// Mock list of templates for the selector gallery
export const useTemplates = () => {
  const templates = ref([
    {
      id: 'template-1',
      name: 'Atlantic',
      vibe: 'STRUCTURED',
      description: 'A two-column layout built for product leaders and engineers. Packs depth and metrics into a clean, scannable format — no visual clutter.',
      bestFor: ['Product Managers', 'Engineers', 'Tech Leads'],
      component: 'TwoColumnTemplate',
      mockData: {
        title: 'Senior Product Lead',
        professional_summary: 'Experienced product leader specializing in cross-functional team management and scaling SaaS platforms.',
        personal_details: {
          first_name: 'Sarah',
          last_name: 'Jenkins',
          email: 'sarah@domain.co',
          phone: '+44 7911 123456',
          location: 'London, UK',
        },
        experiences: [],
        educations: [],
        skills: [],
      } as MockCvData,
    },
    {
      id: 'template-2',
      name: 'Meridian',
      vibe: 'MINIMAL',
      description: 'A clean, single-column layout that lets your story speak. Trusted by professionals in industries where clarity and restraint matter most.',
      bestFor: ['Finance', 'Law', 'Consulting', 'Academia'],
      component: 'SingleColumnTemplate',
      mockData: {
        title: 'Full-Stack Systems Architect',
        professional_summary: 'Architecting scalable microservices for enterprise fintech solutions.',
        personal_details: {
          first_name: 'Elena',
          last_name: 'Rostova',
          email: 'elena@domain.co',
          phone: '+1 555 0192',
          location: 'Dublin, Ireland',
        },
        experiences: [],
        educations: [],
        skills: [],
      } as MockCvData,
    },
  ])

  return {
    templates,
  }
}
