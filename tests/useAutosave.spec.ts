// @vitest-environment nuxt

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
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
  beforeEach(async () => {
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
    state.saveErrorMessage.value = null
    state.saveErrorDetail.value = { target: null, fields: {} }
    // The template now travels with the CV, so it has to start clean or it
    // leaks between cases.
    state.selectedTemplateId.value = ''
    state.selectedTemplateSlug.value = 'classic'

    // `cvId`, `selectedTemplateId` and `selectedTemplateSlug` are cookies, and
    // `useCookie` gives each caller its own ref rather than sharing one the way
    // `useState` does — so the reset only reaches the next composable once the
    // write has flushed. Without this, every case inherits the previous case's
    // CV id.
    await nextTick()
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
      body: expect.objectContaining({ institution: 'MIT', degree: 'MS', displayOrder: 0 }),
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

  it('does not POST blank new certifications until required fields are filled', async () => {
    mockApi.mockResolvedValueOnce({
      cvId: 'cv-cert-test',
      title: 'My CV',
      certifications: [],
    })

    const { loadCV, triggerAutosave } = useAutosave()
    await loadCV('cv-cert-test')
    await vi.runAllTimersAsync()

    const state = useCVState()
    mockApi.mockReset()
    mockApi.mockResolvedValue({ id: 'real-cert-id' })

    // Add empty certification (as created by "Add Certification")
    state.certifications.value.push({
      id: 'cert_temp_123',
      name: '',
      issuer: '',
      date: '',
    })

    triggerAutosave()
    await flushMicrotasks()

    // Should NOT have made a POST call to /cvs/certifications/
    const certPostCalls = mockApi.mock.calls.filter(
      call => call[0] === '/cvs/certifications/' && call[1]?.method === 'POST',
    )
    expect(certPostCalls).toHaveLength(0)

    // Now fill in required fields
    state.certifications.value[0]!.name = 'AWS Certified Solutions Architect'
    state.certifications.value[0]!.issuer = 'Amazon Web Services'

    triggerAutosave()
    await flushMicrotasks()

    // Should have made a POST call to /cvs/certifications/
    expect(mockApi).toHaveBeenCalledWith('/cvs/certifications/', {
      method: 'POST',
      body: expect.objectContaining({
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        displayOrder: 0,
      }),
    })
  })

  it('sends section fields under the names the backend models', async () => {
    mockApi.mockResolvedValueOnce({
      cvId: 'cv-1',
      title: 'My CV',
      educations: [{ id: 'edu-1', school: 'MIT' }],
      experiences: [],
    })

    const { loadCV, triggerAutosave } = useAutosave()
    await loadCV('cv-1')
    await vi.runAllTimersAsync()

    const state = useCVState()
    mockApi.mockReset()
    mockApi.mockImplementation(async (url: string) => {
      if (url === '/cvs/experiences/') return { id: 'exp-1' }
      return {}
    })

    state.education.value[0]!.degree = 'MS'
    state.experience.value.push({
      id: 'mock-exp-1',
      title: 'Staff Engineer',
      company: 'Amazon',
    } as ExperienceItem)

    triggerAutosave()
    await flushMicrotasks()

    // The editor says `school` and `title`; the backend models neither, so
    // sending them under those names saves the record without them.
    const eduPatch = mockApi.mock.calls.find(call => call[0] === '/cvs/educations/edu-1/')?.[1]
    expect(eduPatch.body).toMatchObject({ institution: 'MIT' })
    expect(eduPatch.body).not.toHaveProperty('school')

    const expPost = mockApi.mock.calls.find(call => call[0] === '/cvs/experiences/')?.[1]
    expect(expPost.body).toMatchObject({ role: 'Staff Engineer', company: 'Amazon' })
    expect(expPost.body).not.toHaveProperty('title')
  })

  it('creates personal details with a PUT under the backend\'s field names', async () => {
    // The CV comes back with no `personalDetail`, so there is nothing to PATCH.
    mockApi.mockResolvedValueOnce({ cvId: 'cv-personal', title: 'My CV' })

    const { loadCV, triggerAutosave } = useAutosave()
    await loadCV('cv-personal')
    await vi.runAllTimersAsync()

    const state = useCVState()
    mockApi.mockReset()
    mockApi.mockResolvedValue({})

    state.personal.value = {
      ...state.personal.value,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '0123456789',
      location: 'London',
      website: 'https://ada.dev',
      nationality: 'British',
      passport: 'X123',
    }

    triggerAutosave()
    await flushMicrotasks()

    const calls = mockApi.mock.calls.filter(call => call[0] === '/cvs/personal-details/')
    expect(calls).toHaveLength(1)

    // A PATCH against a record that does not exist is the 404 this is here to
    // avoid: the endpoint has no POST, so a PUT is the only thing that creates it.
    const options = calls[0]![1]
    expect(options.method).toBe('PUT')

    // A PUT is a full replace, so every field goes. `website` is the backend's
    // `websiteUrl`; nationality and passport have no backend field at all and
    // stay in the editor.
    expect(options.body).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '0123456789',
      location: 'London',
      websiteUrl: 'https://ada.dev',
    })
  })

  it('PATCHes a personal-details record that already exists', async () => {
    mockApi.mockResolvedValueOnce({
      cvId: 'cv-personal',
      title: 'My CV',
      personalDetail: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        websiteUrl: 'https://ada.dev',
      },
    })

    const { loadCV, triggerAutosave } = useAutosave()
    await loadCV('cv-personal')
    await vi.runAllTimersAsync()

    const state = useCVState()

    // The record says `websiteUrl`; the Website control is bound to `website`.
    expect(state.personal.value.website).toBe('https://ada.dev')

    mockApi.mockReset()
    mockApi.mockResolvedValue({})

    state.personal.value = { ...state.personal.value, phone: '0123456789' }

    triggerAutosave()
    await flushMicrotasks()

    const calls = mockApi.mock.calls.filter(call => call[0] === '/cvs/personal-details/')
    expect(calls).toHaveLength(1)
    expect(calls[0]![1].method).toBe('PATCH')
    // Only what changed — not the whole record.
    expect(calls[0]![1].body).toEqual({ phone: '0123456789' })
  })

  it('shows a rejected field beside itself rather than the response summary', async () => {
    mockApi.mockResolvedValueOnce({ cvId: 'cv-personal', title: 'My CV' })

    const { loadCV, triggerAutosave } = useAutosave()
    await loadCV('cv-personal')
    await vi.runAllTimersAsync()

    const state = useCVState()
    mockApi.mockReset()

    // The body the backend answers a personal-details PUT with, verbatim: the
    // fields it rejected, and a generic summary beside them. The summary is
    // what the header badge used to show on its own.
    mockApi.mockImplementation(async (url: string) => {
      if (url === '/cvs/personal-details/') {
        throw {
          data: {
            phone: ['This field may not be blank.'],
            location: ['This field may not be blank.'],
            message: 'Invalid CV data.',
          },
        }
      }
      return {}
    })

    state.personal.value = {
      ...state.personal.value,
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '0123456789',
      location: 'London',
    }

    triggerAutosave()
    await flushMicrotasks()

    // Keyed by the name the backend used, which is what the editor pages look
    // their own fields up by, and filed under the record that was being written
    // so the messages only render there.
    expect(state.saveErrorDetail.value).toEqual({
      target: 'personal',
      fields: {
        phone: 'This field may not be blank.',
        location: 'This field may not be blank.',
      },
    })
    expect(state.saveErrorFor('personal', 'phone')).toBe('This field may not be blank.')
    // The same field name under a different record draws nothing.
    expect(state.saveErrorFor('exp-1', 'phone')).toBe('')
    // One message for the badge's single pill, not the generic summary.
    expect(state.saveErrorMessage.value).toBe('Phone: This field may not be blank. (+1 more)')

    // The next save goes through, so the messages go with it.
    mockApi.mockResolvedValue({})
    triggerAutosave()
    await flushMicrotasks()

    expect(state.saveErrorDetail.value).toEqual({ target: null, fields: {} })
    expect(state.saveErrorFor('personal', 'phone')).toBe('')
    expect(state.saveErrorMessage.value).toBeNull()
  })

  it('files a rejected section field under the entry that was being written', async () => {
    mockApi.mockResolvedValueOnce({ cvId: 'cv-1', title: 'My CV', experiences: [] })

    const { loadCV, triggerAutosave } = useAutosave()
    await loadCV('cv-1')
    await vi.runAllTimersAsync()

    const state = useCVState()
    mockApi.mockReset()

    mockApi.mockImplementation(async (url: string) => {
      if (url === '/cvs/experiences/') {
        throw {
          data: {
            role: ['This field may not be blank.'],
            startDate: ['Date has wrong format.'],
            message: 'Invalid CV data.',
          },
        }
      }
      return {}
    })

    state.experience.value.push({
      id: 'mock-exp-1',
      title: 'Staff Engineer',
      company: 'Amazon',
    } as ExperienceItem)

    triggerAutosave()
    await flushMicrotasks()

    // The entry being posted is the one the messages belong to, so the form
    // that rendered them is the only one that shows them.
    expect(state.saveErrorDetail.value.target).toBe('mock-exp-1')
    // The editor calls it `title`, the backend calls it `role`; the message
    // still has to land on the input the user typed into.
    expect(state.saveErrorFor('mock-exp-1', 'title')).toBe('This field may not be blank.')
    expect(state.saveErrorFor('mock-exp-1', 'startDate')).toBe('Date has wrong format.')

    // A sibling entry, and the personal-details record, draw nothing.
    expect(state.saveErrorFor('mock-exp-2', 'title')).toBe('')
    expect(state.saveErrorFor('personal', 'title')).toBe('')
    expect(state.saveErrorMessage.value).toBe('Role: This field may not be blank. (+1 more)')
  })

  it('does not create personal details while the required fields are blank', async () => {
    mockApi.mockResolvedValueOnce({ cvId: 'cv-personal', title: 'My CV' })

    const { loadCV, triggerAutosave } = useAutosave()
    await loadCV('cv-personal')
    await vi.runAllTimersAsync()

    const state = useCVState()
    mockApi.mockReset()
    mockApi.mockResolvedValue({})

    // Filling in a non-required field first must not fire a full-replace PUT
    // with a blank name and email — that PUT is what 400'd before, and the
    // failure took the CV and section writes down with it.
    state.personal.value = { ...state.personal.value, phone: '0123456789' }

    triggerAutosave()
    await flushMicrotasks()

    expect(mockApi.mock.calls.filter(call => call[0] === '/cvs/personal-details/')).toHaveLength(0)
  })

  it('does not touch personal details when only the professional title changed', async () => {
    mockApi.mockResolvedValueOnce({ cvId: 'cv-2', title: 'Untitled' })

    const { loadCV, triggerAutosave } = useAutosave()
    await loadCV('cv-2')
    await vi.runAllTimersAsync()

    const state = useCVState()
    mockApi.mockReset()
    mockApi.mockResolvedValue({})

    // Three keystrokes into the Professional Title, exactly as typed in the
    // editor. It names the CV — it is not a personal-details field.
    state.personal.value = { ...state.personal.value, title: 'Sen' }

    triggerAutosave()
    await flushMicrotasks()

    expect(mockApi.mock.calls.filter(call => call[0] === '/cvs/personal-details/')).toHaveLength(0)
    expect(state.cvTitle.value).toBe('Sen')
  })

  it('names an unnamed CV after the professional title', async () => {
    mockApi.mockResolvedValue({})

    const state = useCVState()
    state.cvId.value = 'cv-1'
    state.cvTitle.value = 'Untitled'
    state.personal.value = { ...state.personal.value, title: 'Senior Product Designer' }

    await nextTick()
    const { triggerAutosave } = useAutosave()
    triggerAutosave()
    await flushMicrotasks()

    expect(state.cvTitle.value).toBe('Senior Product Designer')
    expect(mockApi).toHaveBeenCalledWith('/cvs/cv-1/', {
      method: 'PATCH',
      body: expect.objectContaining({ title: 'Senior Product Designer' }),
    })
  })

  it('keeps following the professional title while the user is still typing', async () => {
    mockApi.mockResolvedValue({})

    const state = useCVState()
    state.cvId.value = 'cv-1'
    state.cvTitle.value = 'Untitled'
    state.personal.value = { ...state.personal.value, title: 'Senior' }

    await nextTick()
    const { triggerAutosave } = useAutosave()

    // A save fires during a pause in typing.
    triggerAutosave()
    await flushMicrotasks()
    expect(state.cvTitle.value).toBe('Senior')

    // Finishing the word must still rename the CV — a half-typed word is not a
    // name the user chose.
    state.personal.value = { ...state.personal.value, title: 'Senior Product Designer' }
    triggerAutosave()
    await flushMicrotasks()
    expect(state.cvTitle.value).toBe('Senior Product Designer')
  })

  it('stops following the professional title once the user names the CV', async () => {
    mockApi.mockResolvedValue({})

    const state = useCVState()
    state.cvId.value = 'cv-1'
    state.cvTitle.value = 'Untitled'
    state.personal.value = { ...state.personal.value, title: 'Senior' }

    await nextTick()
    const { triggerAutosave } = useAutosave()
    triggerAutosave()
    await flushMicrotasks()
    expect(state.cvTitle.value).toBe('Senior')

    // The user renames the CV in the editor header...
    state.cvTitle.value = 'Backend Developer CV'

    // ...then edits the professional title. The header wins from here on.
    state.personal.value = { ...state.personal.value, title: 'Staff Engineer' }
    triggerAutosave()
    await flushMicrotasks()
    expect(state.cvTitle.value).toBe('Backend Developer CV')
  })

  it('keeps a title the user typed in the editor header', async () => {
    mockApi.mockResolvedValue({})

    const state = useCVState()
    state.cvId.value = 'cv-1'
    state.cvTitle.value = 'Backend Developer CV'
    state.personal.value = { ...state.personal.value, title: 'Senior Product Designer' }

    await nextTick()
    const { triggerAutosave } = useAutosave()
    triggerAutosave()
    await flushMicrotasks()

    expect(state.cvTitle.value).toBe('Backend Developer CV')
    expect(mockApi).toHaveBeenCalledWith('/cvs/cv-1/', {
      method: 'PATCH',
      body: expect.objectContaining({ title: 'Backend Developer CV' }),
    })
  })

  it('carries the selected template when autosave creates the CV', async () => {
    mockApi.mockImplementation(async (url: string) => {
      if (url === '/cvs/') return { cvId: 'new-cv-uuid' }
      return {}
    })

    const state = useCVState()
    state.cvTitle.value = 'My New CV'
    state.selectedTemplateId.value = 'tpl-7'

    await nextTick()
    const { triggerAutosave } = useAutosave()
    triggerAutosave()
    await flushMicrotasks()

    expect(mockApi).toHaveBeenCalledWith('/cvs/', {
      method: 'POST',
      body: { title: 'My New CV', professionalSummary: '', template: 'tpl-7' },
    })
  })

  it('keeps the template id that came back with the loaded CV', async () => {
    mockApi.mockResolvedValueOnce({ cvId: 'cv-tpl', title: 'With template', template: 'tpl-9' })

    const { loadCV } = useAutosave()
    await loadCV('cv-tpl')

    await nextTick()
    expect(useCVState().selectedTemplateId.value).toBe('tpl-9')
  })
})
