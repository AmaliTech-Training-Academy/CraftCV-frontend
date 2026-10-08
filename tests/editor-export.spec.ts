// @vitest-environment nuxt
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useCVState } from '~/composables/useCVState'
import { getRenderer } from '~/utils/pdf/registry'
import { buildDocumentDefinition } from '~/utils/pdfExport'

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

describe('Editor Export Integration', () => {
  beforeEach(async () => {
    mockApi.mockReset()
    const { resetCV } = useCVState()
    resetCV()

    // `cvId` is a cookie, and `useCookie` gives each caller its own ref rather
    // than sharing one the way `useState` does — so the reset only reaches the
    // layout once the write has flushed.
    await nextTick()
  })

  it('selects the appropriate PDF renderer according to selectedTemplateSlug', () => {
    const { selectedTemplateSlug } = useCVState()

    selectedTemplateSlug.value = 'classic'
    const classicRenderer = getRenderer(selectedTemplateSlug.value)
    expect(classicRenderer.name).toBe('buildClassicPdf')

    selectedTemplateSlug.value = 'modern'
    const modernRenderer = getRenderer(selectedTemplateSlug.value)
    expect(modernRenderer.name).toBe('buildModernPdf')

    selectedTemplateSlug.value = 'professional'
    const professionalRenderer = getRenderer(selectedTemplateSlug.value)
    expect(professionalRenderer.name).toBe('buildProfessionalPdf')

    selectedTemplateSlug.value = 'unknown-template'
    const fallbackRenderer = getRenderer(selectedTemplateSlug.value)
    expect(fallbackRenderer.name).toBe('buildClassicPdf')
  })

  it('generates document definition using raw unpadded CV data', () => {
    const { personal, experience, rawCVData, selectedTemplateSlug } = useCVState()

    personal.value.firstName = 'David'
    personal.value.lastName = 'Miller'
    experience.value.push({
      id: 'exp-1',
      title: 'DevOps Specialist',
      company: 'Cloud Ops',
      location: 'Berlin',
      startDate: '2022',
      endDate: 'Present',
      description: 'Maintained Kubernetes clusters.',
    })

    selectedTemplateSlug.value = 'modern'

    const docDef = buildDocumentDefinition({
      cvData: rawCVData.value,
      filename: 'David_Miller.pdf',
      paperSize: 'a4',
      templateSlug: selectedTemplateSlug.value,
    })

    const serialized = JSON.stringify(docDef)
    expect(serialized).toContain('David Miller')
    expect(serialized).toContain('DevOps Specialist')
    expect(serialized).toContain('Cloud Ops')
    expect(serialized).not.toContain('mock-1')
    expect(serialized).not.toContain('Your Job Title')
  })

  it('preserves autosave status independently from export state', () => {
    const { saveState, lastSavedAt } = useCVState()

    saveState.value = 'saved'
    lastSavedAt.value = '2026-10-03T11:00:00Z'

    expect(saveState.value).toBe('saved')
    expect(lastSavedAt.value).toBe('2026-10-03T11:00:00Z')
  })

  it('opens export modal when Export PDF button is clicked', async () => {
    const { mountSuspended } = await import('@nuxt/test-utils/runtime')
    const EditorLayout = (await import('~/layouts/editor.vue')).default

    const wrapper = await mountSuspended(EditorLayout, {
      slots: {
        default: () => '<div>Editor Form Content</div>',
      },
    })

    const exportButtons = wrapper.findAll('button').filter(b => b.text().includes('Export'))
    expect(exportButtons.length).toBeGreaterThan(0)

    expect(document.body.textContent).not.toContain('Ready to export')

    await exportButtons[0]?.trigger('click')

    expect(document.body.textContent).toContain('Ready to export')
    expect(document.body.textContent).toContain('Export Document')

    wrapper.unmount()
  })

  it('holds the workspace behind a loading state until the CV has loaded', async () => {
    const { mountSuspended } = await import('@nuxt/test-utils/runtime')
    const EditorLayout = (await import('~/layouts/editor.vue')).default

    // A CV id means the editor is about to fetch one. Leaving the request
    // pending is the reload the loading state exists for: without it the form
    // renders from empty state and a CV with content looks like it lost it.
    mockApi.mockImplementation(() => new Promise(() => {}))
    useCVState().cvId.value = 'cv-slow'
    await nextTick()

    const wrapper = await mountSuspended(EditorLayout, {
      slots: {
        default: () => '<div>Editor Form Content</div>',
      },
    })

    expect(wrapper.text()).toContain('Loading your CV')
    expect(wrapper.text()).not.toContain('Editor Form Content')

    wrapper.unmount()
  })

  it('renders the form straight away when there is no CV to load', async () => {
    const { mountSuspended } = await import('@nuxt/test-utils/runtime')
    const EditorLayout = (await import('~/layouts/editor.vue')).default

    // A brand new CV has an empty id, so nothing is fetched and a loading state
    // would be a stall for no reason.
    const wrapper = await mountSuspended(EditorLayout, {
      slots: {
        default: () => '<div>Editor Form Content</div>',
      },
    })

    expect(wrapper.text()).toContain('Editor Form Content')
    expect(wrapper.text()).not.toContain('Loading your CV')

    wrapper.unmount()
  })

  it('includes certifications from rawCVData in exported document definition', () => {
    const { personal, certifications, rawCVData, selectedTemplateSlug } = useCVState()

    personal.value.firstName = 'Alice'
    personal.value.lastName = 'Smith'
    certifications.value.push({
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2024',
    })

    selectedTemplateSlug.value = 'classic'

    const docDef = buildDocumentDefinition({
      cvData: rawCVData.value,
      filename: 'Alice_Smith.pdf',
      paperSize: 'a4',
      templateSlug: selectedTemplateSlug.value,
    })

    const serialized = JSON.stringify(docDef)
    expect(serialized).toContain('AWS Certified Solutions Architect')
    expect(serialized).toContain('Amazon Web Services')
  })
})
