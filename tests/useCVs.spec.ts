// @vitest-environment nuxt

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { type CVSummary, useCVs } from '../app/composables/useCVs'
import { useCVState } from '../app/composables/useCVState'

const { mockApi } = vi.hoisted(() => ({
  mockApi: vi.fn(),
}))

vi.mock('../app/utils/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../app/utils/api')>()
  return {
    ...actual,
    $api: mockApi,
  }
})

describe('useCVs', () => {
  beforeEach(() => {
    mockApi.mockReset()

    useCVState().resetCV()

    const { cvs, loading, loaded, error } = useCVs()
    cvs.value = []
    loading.value = false
    loaded.value = false
    error.value = null
  })

  describe('fetchCVs', () => {
    it('reads a bare array', async () => {
      mockApi.mockResolvedValueOnce([{ cvId: 'cv-1', title: 'First' }])

      const { cvs, fetchCVs } = useCVs()
      await fetchCVs()

      expect(cvs.value).toHaveLength(1)
      expect(cvs.value[0]!.cvId).toBe('cv-1')
    })

    it('unwraps a paginated DRF response', async () => {
      mockApi.mockResolvedValueOnce({ count: 1, results: [{ cvId: 'cv-2', title: 'Second' }] })

      const { cvs, fetchCVs } = useCVs()
      await fetchCVs()

      expect(cvs.value).toHaveLength(1)
      expect(cvs.value[0]!.cvId).toBe('cv-2')
    })

    it('accepts the id aliases and drops entries that carry no identifier', async () => {
      mockApi.mockResolvedValueOnce([
        { id: 'cv-3', title: 'Third' },
        { uuid: 'cv-4', title: 'Fourth' },
        { title: 'No identifier at all' },
      ])

      const { cvs, fetchCVs } = useCVs()
      await fetchCVs()

      // A row we cannot open is worse than no row, so it is filtered out.
      expect(cvs.value.map(c => c.cvId)).toEqual(['cv-3', 'cv-4'])
    })

    it('falls back to "Untitled" when a CV has no title', async () => {
      mockApi.mockResolvedValueOnce([{ cvId: 'cv-5' }])

      const { cvs, fetchCVs } = useCVs()
      await fetchCVs()

      expect(cvs.value[0]!.title).toBe('Untitled')
    })

    it('surfaces a server error and still marks the list loaded', async () => {
      mockApi.mockRejectedValueOnce({ response: { status: 500 } })

      const { cvs, error, loaded, fetchCVs } = useCVs()
      await fetchCVs()

      expect(error.value).toBe('Something went wrong on our side. Please try again later.')
      expect(cvs.value).toEqual([])
      // `loaded` gates the empty state, so a failed fetch must not claim the
      // user has no resumes.
      expect(loaded.value).toBe(true)
    })

    it('describes a dead connection rather than blaming the server', async () => {
      mockApi.mockRejectedValueOnce(new Error('network down'))

      const { error, fetchCVs } = useCVs()
      await fetchCVs()

      expect(error.value).toContain('Unable to connect to the server')
    })

    it('treats an unrecognised payload shape as an empty list', async () => {
      mockApi.mockResolvedValueOnce({ unexpected: 'shape' })

      const { cvs, error, fetchCVs } = useCVs()
      await fetchCVs()

      expect(cvs.value).toEqual([])
      expect(error.value).toBeNull()
    })
  })

  describe('createCV', () => {
    it('sends the chosen template and adopts the returned id', async () => {
      mockApi.mockResolvedValueOnce({ cvId: 'made-cv', lastSavedAt: '2024-05-01T09:00:00Z' })

      useCVState().cvTitle.value = 'Targeted CV'

      const { createCV } = useCVs()
      const id = await createCV('tpl-42')

      expect(mockApi).toHaveBeenCalledWith('/cvs/', {
        method: 'POST',
        body: { title: 'Targeted CV', professionalSummary: '', template: 'tpl-42' },
      })
      expect(id).toBe('made-cv')

      // `cvId` is a cookie, and `useCookie` hands each caller its own ref rather
      // than sharing one the way `useState` does — so the id is read back through
      // a fresh instance, after the write has flushed, which is what a component
      // mounting later actually sees.
      await nextTick()
      const reopened = useCVState()
      expect(reopened.cvId.value).toBe('made-cv')
      expect(reopened.hasActiveCV.value).toBe(true)
      expect(reopened.lastSavedAt.value).toBe('2024-05-01T09:00:00Z')
    })

    it('omits the template when none was chosen', async () => {
      mockApi.mockResolvedValueOnce({ cvId: 'made-cv' })

      const { createCV } = useCVs()
      await createCV()

      expect(mockApi).toHaveBeenCalledWith('/cvs/', {
        method: 'POST',
        body: { title: 'Untitled', professionalSummary: '' },
      })
    })
  })

  describe('deleteCV', () => {
    it('DELETEs the CV and drops it from the list', async () => {
      mockApi.mockResolvedValue(undefined)

      const { cvs, deleteCV } = useCVs()
      cvs.value = [
        { cvId: 'cv-1', title: 'One' },
        { cvId: 'cv-2', title: 'Two' },
      ]

      await deleteCV('cv-1')

      expect(mockApi).toHaveBeenCalledWith('/cvs/cv-1/', { method: 'DELETE' })
      expect(cvs.value.map(c => c.cvId)).toEqual(['cv-2'])
    })

    it('clears the editor state when the open CV is the one deleted', async () => {
      mockApi.mockResolvedValue(undefined)

      const state = useCVState()
      state.cvId.value = 'cv-open'
      state.hasActiveCV.value = true
      state.cvTitle.value = 'Open one'

      // The cookie write has to land before another instance reads it back.
      await nextTick()

      const { cvs, deleteCV } = useCVs()
      cvs.value = [{ cvId: 'cv-open', title: 'Open one' }]

      await deleteCV('cv-open')

      // Leaving cvId set would point the editor at a CV that no longer exists.
      await nextTick()
      expect(useCVState().cvId.value).toBeFalsy()
      expect(state.hasActiveCV.value).toBe(false)
      expect(state.cvTitle.value).toBe('Untitled')
      expect(cvs.value).toEqual([])
    })

    it('leaves the open CV alone when a different one is deleted', async () => {
      mockApi.mockResolvedValue(undefined)

      const state = useCVState()
      state.cvId.value = 'cv-open'
      await nextTick()

      const { cvs, deleteCV } = useCVs()
      cvs.value = [
        { cvId: 'cv-open', title: 'Open' },
        { cvId: 'cv-other', title: 'Other' },
      ]

      await deleteCV('cv-other')

      await nextTick()
      expect(useCVState().cvId.value).toBe('cv-open')
      expect(cvs.value.map(c => c.cvId)).toEqual(['cv-open'])
    })
  })

  describe('selectCV', () => {
    it('points the editor at the chosen CV', async () => {
      const { selectCV } = useCVs()
      const cv: CVSummary = { cvId: 'cv-9', title: 'Ninth', lastSavedAt: '2024-02-03T10:00:00Z' }

      // The navigation belongs to Nuxt rather than this composable, so a failure
      // to route here says nothing about the state being set up.
      await selectCV(cv).catch(() => {})

      await nextTick()
      const state = useCVState()
      expect(state.cvId.value).toBe('cv-9')
      expect(state.hasActiveCV.value).toBe(true)
      expect(state.cvTitle.value).toBe('Ninth')
      expect(state.lastSavedAt.value).toBe('2024-02-03T10:00:00Z')
    })
  })
})
