/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from '#imports'
import { $api, extractErrorMessage } from '../utils/api'
import { useCVState } from './useCVState'

/** A CV as the collection endpoint describes it — enough to render a card and open it. */
export interface CVSummary {
  cvId: string
  title: string
  template?: string
  lastSavedAt?: string
}

/**
 * The saved-CV collection: listing, opening and deleting a whole CV.
 *
 * Section records are deliberately not this composable's business. Once a CV is
 * open, every section write goes through `useAutosave`; this one only ever
 * deals with the CV itself, which is what keeps "remove this education" and
 * "delete this CV" from being the same operation.
 */
export const useCVs = () => {
  const cvs = useState<CVSummary[]>('cv-list', () => [])
  const loading = useState<boolean>('cv-list-loading', () => false)
  const loaded = useState<boolean>('cv-list-loaded', () => false)
  const error = useState<string | null>('cv-list-error', () => null)

  /**
   * DRF paginates collection endpoints, and the project has already met both
   * shapes — `useTemplates` unwraps the same way. Rather than pin the dashboard
   * to a guess about which one `/cvs/` returns, accept any of them.
   */
  const unwrap = (payload: any): any[] => {
    if (Array.isArray(payload)) return payload
    if (!payload || typeof payload !== 'object') return []
    for (const key of ['results', 'data', 'items', 'cvs']) {
      if (Array.isArray(payload[key])) return payload[key]
    }
    return []
  }

  /** The key that identifies a CV has appeared as `cvId` on write paths; accept the usual aliases. */
  const toSummary = (cv: any): CVSummary => ({
    cvId: String(cv.cvId ?? cv.id ?? cv.uuid ?? ''),
    title: cv.title || 'Untitled',
    template: cv.template ?? undefined,
    lastSavedAt: cv.lastSavedAt ?? undefined,
  })

  const fetchCVs = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await $api<any>('/cvs/')
      cvs.value = unwrap(response)
        .map(toSummary)
        .filter(cv => Boolean(cv.cvId))
    }
    catch (err) {
      error.value = extractErrorMessage(err, 'Couldn\'t load your resumes.')
    }
    finally {
      loading.value = false
      loaded.value = true
    }
  }

  /**
   * Creates a CV on the backend and adopts the id it returns.
   *
   * Lives here rather than in `useAutosave` on purpose: that composable
   * registers a debounced watcher over the CV state, so calling it from the
   * template picker would queue a save the moment the picker reset that state —
   * and a slow create could then race its own autosave into a duplicate CV.
   * This composable only ever makes the call it is asked to make.
   *
   * The template is sent only when there is one. Nothing breaks if the backend
   * does not model it yet, but when it does this is what lets a saved CV come
   * back in the right design after a refresh.
   */
  const createCV = async (templateId?: string) => {
    const state = useCVState()

    const res = await $api<any>('/cvs/', {
      method: 'POST',
      body: {
        title: state.cvTitle.value || 'Untitled',
        professionalSummary: state.summary.value || '',
        ...(templateId ? { template: templateId } : {}),
      },
    })

    state.cvId.value = res?.cvId || res?.id || res?.uuid || null
    if (res?.lastSavedAt) state.lastSavedAt.value = res.lastSavedAt
    state.hasActiveCV.value = true

    return state.cvId.value
  }

  const deleteCV = async (id: string) => {
    await $api<unknown>(`/cvs/${id}/`, { method: 'DELETE' })
    cvs.value = cvs.value.filter(cv => cv.cvId !== id)

    // Deleting the CV that happens to be open would otherwise leave the editor
    // pointing at a record that no longer exists.
    const state = useCVState()
    if (state.cvId.value === id) state.resetCV()
  }

  /**
   * Points the editor at a saved CV and opens it.
   *
   * `cvId` is a cookie, so writing it here is what makes the editor load this
   * CV — `layouts/editor.vue` reads it on mount. The title is set up front so
   * the header is right immediately instead of showing the previous CV's name
   * until the fetch comes back.
   */
  const selectCV = async (cv: CVSummary) => {
    const state = useCVState()
    state.cvId.value = cv.cvId
    state.hasActiveCV.value = true
    state.cvTitle.value = cv.title
    state.lastSavedAt.value = cv.lastSavedAt ?? null

    await navigateTo('/editor/personal')
  }

  return {
    cvs,
    loading,
    loaded,
    error,
    fetchCVs,
    createCV,
    deleteCV,
    selectCV,
  }
}
