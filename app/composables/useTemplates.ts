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
  bestFor?: string[]
}

export const useTemplates = () => {
  const templates = useState<APITemplate[]>('cv-templates', () => [])
  const loading = useState<boolean>('cv-templates-loading', () => true)
  const error = useState<string | null>('cv-templates-error', () => null)

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
      templates.value = normalizedData.map((t: any) => {
        let image = undefined
        let vibe = undefined
        let bestFor: string[] = []

        const rawSlug = t.slug || t.name || ''
        const normalizedSlug = rawSlug.toLowerCase()

        if (normalizedSlug === 'professional') {
          image = '/templates/Double-col.png'
          vibe = 'STRUCTURED'
          bestFor = ['Product Managers', 'Engineers', 'Tech Leads']
        }
        else if (normalizedSlug === 'modern') {
          image = '/templates/Single-col.png'
          vibe = 'MINIMAL'
          bestFor = ['Finance', 'Law', 'Consulting', 'Academia']
        }

        return {
          templateId: t.templateId,
          name: t.name,
          description: t.description,
          slug: normalizedSlug,
          image,
          vibe,
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
    fetchTemplates,
  }
}
