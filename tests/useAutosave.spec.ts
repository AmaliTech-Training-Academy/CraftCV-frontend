// @vitest-environment nuxt

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAutosave } from '../app/composables/useAutosave'
import { type ExperienceItem, type PersonalDetails, useCVState } from '../app/composables/useCVState'

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

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockApi.mockReset()

    // Reset CV state
    const state = useCVState()
    state.cvId.value = ''
    state.cvTitle.value = ''
    state.summary.value = ''
    state.personal.value = {} as PersonalDetails
    state.education.value = []
    state.experience.value = []
    state.skills.value = []
    state.certifications.value = []
    state.saveState.value = 'idle'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // Helper to flush promises without relying on timers
  const flushMicrotasks = async () => {
    for (let i = 0; i < 20; i++) {
      await Promise.resolve()
    }
  }

  it('creates a new CV on first save when cvId is empty', async () => {
    // Mock the API responses
    mockApi.mockImplementation(async (url: string) => {
      if (url === '/cvs/') return { cvId: 'new-cv-uuid', lastSavedAt: '2023-01-01T00:00:00Z' }
      return {}
    })

    const { triggerAutosave } = useAutosave()
    const state = useCVState()

    state.cvTitle.value = 'My New CV'

    triggerAutosave()
    await flushMicrotasks()

    expect(mockApi).toHaveBeenCalledWith('/cvs/', {
      method: 'POST',
      body: {
        title: 'My New CV',
        professionalSummary: '',
      },
    })
    expect(state.saveState.value).toBe('saved')
  })

  it('populates local state including sections on loadCV', async () => {
    mockApi.mockResolvedValueOnce({
      cvId: 'existing-cv',
      title: 'Existing CV',
      educations: [{ id: 'edu-1', school: 'MIT' }],
      experiences: [{ id: 'exp-1', company: 'Google' }],
    })

    const { loadCV } = useAutosave()
    await loadCV('existing-cv')
    await flushMicrotasks()

    const state = useCVState()
    expect(state.cvTitle.value).toBe('Existing CV')
    expect(state.education.value).toHaveLength(1)
    expect(state.education.value[0]?.school).toBe('MIT')
    expect(state.experience.value).toHaveLength(1)
    expect(state.experience.value[0]?.company).toBe('Google')
  })

  it('correctly dispatches POST, PATCH, and DELETE for section changes', async () => {
    // 1. Load an existing CV with one education and one certification
    mockApi.mockResolvedValueOnce({
      cvId: 'cv-1',
      title: 'My CV',
      educations: [{ id: 'edu-1', school: 'MIT', degree: 'BS' }],
      certifications: [{ id: 'cert-1', name: 'AWS' }],
    })

    const { loadCV, triggerAutosave } = useAutosave()
    await loadCV('cv-1')
    await vi.runAllTimersAsync()

    const state = useCVState()

    // Reset mocks to catch just the save calls
    mockApi.mockReset()

    // Mock responses for the save operations based on URL
    mockApi.mockImplementation(async (url: string) => {
      if (url === '/cvs/experiences/') return { id: 'new-exp-id' }
      if (url === '/cvs/cv-1/') return { lastSavedAt: 'new-time' }
      return {}
    })

    // 2. Modify state: Edit education, remove certification, add experience
    state.education.value[0]!.degree = 'MS'

    state.certifications.value = [] // Deleted

    state.experience.value.push({
      id: 'mock-exp-1',
      company: 'Amazon',
    } as ExperienceItem)

    // 3. Trigger autosave
    triggerAutosave()
    await flushMicrotasks()

    // 4. Verify API calls

    // Education should be PATCHed
    expect(mockApi).toHaveBeenCalledWith('/cvs/educations/edu-1/', {
      method: 'PATCH',
      body: expect.objectContaining({ school: 'MIT', degree: 'MS', displayOrder: 0 }),
    })

    // Certification should be DELETEd
    expect(mockApi).toHaveBeenCalledWith('/cvs/certifications/cert-1/', {
      method: 'DELETE',
    })

    // Experience should be POSTed (notice it omits local mock-id)
    expect(mockApi).toHaveBeenCalledWith('/cvs/experiences/', {
      method: 'POST',
      body: expect.objectContaining({ company: 'Amazon', displayOrder: 0 }),
    })

    // The top-level CV should be PATCHed with the new section IDs
    expect(mockApi).toHaveBeenCalledWith('/cvs/cv-1/', {
      method: 'PATCH',
      body: expect.objectContaining({
        educations: ['edu-1'],
        certifications: [],
        experiences: ['new-exp-id'],
      }),
    })

    // Check that the mock id was replaced with the real ID
    expect(state.experience.value[0]?.id).toBe('new-exp-id')
  })
})
