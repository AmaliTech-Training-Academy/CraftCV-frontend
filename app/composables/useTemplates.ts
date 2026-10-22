/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from '#imports'
import { $api } from '../utils/api'

export interface APITemplate {
  templateId: string
  name: string
  description: string
  slug: string
  // Optional frontend-only fields for UI
  image?: string
  vibe?: string
  category?: string
  bestFor?: string[]
}

export const useTemplates = () => {
  const templates = useState<APITemplate[]>('cv-templates', () => [])
  const modernTemplateIds = useState<string[]>('cv-modern-template-ids', () => [])
  const loading = useState<boolean>('cv-templates-loading', () => true)
  const error = useState<string | null>('cv-templates-error', () => null)
  const activeCategory = useState<string>('cv-templates-active-category', () => 'All')

  const categories = computed(() => {
    const cats = new Set<string>()
    templates.value.forEach((t) => {
      if (t.category) cats.add(t.category)
    })
    return ['All', ...Array.from(cats).sort()]
  })

  /**
   * Look up a template by slug, ID, or name.
   * The legacy "Modern" template is hidden from the picker list (`templates`),
   * but existing CVs may still carry its slug or backend UUID; map those to the
   * "Single Column" entry so cards and the editor still resolve a name and preview.
   */
  const findTemplate = (identifier?: string): APITemplate | null => {
    if (!identifier) return null
    let clean = String(identifier).toLowerCase().trim()
    const isModern = clean === 'modern' || modernTemplateIds.value.includes(clean)
    if (isModern) clean = 'single-column'
    return (
      templates.value.find((t) => {
        const slug = t.slug?.toLowerCase()
        if (isModern && (slug === 'single-column' || slug === 'single_column')) return true
        return slug === clean
          || t.templateId?.toLowerCase() === clean
          || t.name?.toLowerCase() === clean
      }) || null
    )
  }

  const fetchTemplates = async () => {
    loading.value = true
    error.value = null
    try {
      // The auth token is handled by the $api utility automatically
      const response = await $api<any>('/templates/')
      console.log('Templates API Response:', response)

      let data = response
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        // Django Rest Framework paginated responses use 'results'
        data = response.results || response.data || []
      }

      const normalizedData = Array.isArray(data) ? data : []

      // Record any IDs belonging to the retired "Modern" template before filtering it out
      modernTemplateIds.value = normalizedData
        .filter((t: any) => (t.slug || t.name || '').toLowerCase() === 'modern' && t.templateId)
        .map((t: any) => String(t.templateId).toLowerCase().trim())

      // Inject some mock images for the known slugs as the API doesn't provide them
      templates.value = normalizedData
        .filter((t: any) => (t.slug || t.name || '').toLowerCase() !== 'modern')
        .map((t: any) => {
          let image = undefined
          let vibe = undefined
          let category = undefined
          let bestFor: string[] = []

          const rawSlug = t.slug || t.name || ''
          const normalizedSlug = rawSlug.toLowerCase()

          if (normalizedSlug === 'classic') {
            image = '/templates/ModernCV.png'
            vibe = 'STRUCTURED'
            category = 'Classic'
            bestFor = ['Product Managers', 'Engineers', 'Tech Leads']
          }
          else if (normalizedSlug === 'single-column' || normalizedSlug === 'single_column') {
            image = '/templates/SingleCol.png'
            vibe = 'MINIMAL'
            category = 'Modern'
            bestFor = ['Finance', 'Law', 'Consulting', 'Academia']
          }
          else if (normalizedSlug === 'professional' || normalizedSlug.includes('professional') || normalizedSlug === 'two-column' || normalizedSlug === 'two_column' || normalizedSlug === 'double-column' || normalizedSlug === 'doublecol') {
            image = '/templates/DoubleCol.png'
            vibe = 'BALANCED'
            category = 'Modern'
            bestFor = ['Developers', 'Designers', 'Project Managers']
          }
          else if (normalizedSlug === 'inkwell') {
            image = '/templates/Inkwell.png'
            vibe = 'BOLD'
            category = 'Creative'
            bestFor = ['Designers', 'Writers', 'Marketers', 'Creatives']
          }
          else if (normalizedSlug === 'prism') {
            image = '/templates/Prism.png'
            vibe = 'CREATIVE'
            category = 'Creative'
            bestFor = ['Designers', 'Frontend Devs', 'Marketers']
          }
          else if (normalizedSlug === 'campus') {
            image = '/templates/Campus.png'
            vibe = 'CLASSIC'
            category = 'Classic'
            bestFor = ['Graduates', 'Academics', 'Traditional Corporate']
          }
          else if (normalizedSlug === 'sprout') {
            image = '/templates/Sprout.png'
            vibe = 'MODERN'
            category = 'Beginner'
            bestFor = ['Juniors', 'Students', 'Tech Interns']
          }
          else if (normalizedSlug === 'northstar') {
            image = '/templates/Northstar.png'
            vibe = 'MODERN'
            category = 'Modern'
            bestFor = ['Senior Professionals', 'Product Managers', 'Tech Leads']
          }
          else if (normalizedSlug === 'meridian') {
            image = '/templates/Meridian.png'
            vibe = 'CLASSIC'
            category = 'Classic'
            bestFor = ['Executives', 'Senior Leaders', 'Directors']
          }

          return {
            templateId: t.templateId,
            name: t.name,
            description: t.description,
            slug: normalizedSlug,
            image,
            vibe,
            category,
            bestFor,
          }
        })
    }
    catch (err: any) {
      error.value = err?.message || 'Failed to load templates'
      console.error(err)
    }
    finally {
      loading.value = false
    }
  }

  return {
    templates,
    modernTemplateIds,
    loading,
    error,
    activeCategory,
    categories,
    fetchTemplates,
    findTemplate,
  }
}
