// @vitest-environment nuxt
import { describe, expect, it, beforeEach } from 'vitest'
import { useCVState } from '~/composables/useCVState'
import { getRenderer } from '~/utils/pdf/registry'
import { buildDocumentDefinition } from '~/utils/pdfExport'

describe('Editor Export Integration', () => {
  beforeEach(() => {
    const { resetCV } = useCVState()
    resetCV()
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

    const exportButtons = wrapper.findAll('button').filter(b => b.text().includes('Export PDF'))
    expect(exportButtons.length).toBeGreaterThan(0)

    expect(document.body.textContent).not.toContain('Ready to export')

    await exportButtons[0]?.trigger('click')

    expect(document.body.textContent).toContain('Ready to export')
    expect(document.body.textContent).toContain('Export Document')

    wrapper.unmount()
  })
})
