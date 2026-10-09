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

          if (normalizedSlug === 'professional' || normalizedSlug === 'classic') {
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
          else if (normalizedSlug === 'two-column' || normalizedSlug === 'two_column' || normalizedSlug === 'double-column' || normalizedSlug === 'doublecol') {
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
    loading,
    error,
    activeCategory,
    categories,
    fetchTemplates,
  }
}
