// @vitest-environment nuxt
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import ExportModal from '~/components/export/ExportModal.vue'

const PreviewStub = defineComponent({
  props: ['data'],
  template: '<div data-testid="preview">{{ data?.personal_details?.first_name }} {{ data?.personal_details?.last_name }}</div>',
})

const cvData = {
  personal: {
    firstName: 'Alexandra',
    lastName: 'Chen',
  },
}

const getBodyButton = (label: string) => Array.from(document.body.querySelectorAll('button'))
  .find(button => button.textContent?.includes(label))

let wrapper: Awaited<ReturnType<typeof mountSuspended>> | undefined

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('ExportModal.vue', () => {
  it('renders the export shell and the provided template preview when open', async () => {
    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: true,
        activeTemplateComponent: PreviewStub,
        cvData,
      },
    })

    expect(document.body.textContent).toContain('Export Document')
    expect(document.body.textContent).toContain('Ready to export')
    expect(document.body.querySelector<HTMLInputElement>('[aria-label="File name"]')?.value)
      .toMatch(/^Alexandra_Chen_Resume_\d{4}\.pdf$/)
    expect(document.body.querySelector('[data-testid="preview"]')?.textContent).toContain('Alexandra Chen')
  })

  it('does not render modal content when closed', async () => {
    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: false,
        activeTemplateComponent: PreviewStub,
        cvData,
      },
    })

    expect(document.body.textContent).not.toContain('Ready to export')
  })

  it('emits update:modelValue false when dismissed', async () => {
    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: true,
        activeTemplateComponent: PreviewStub,
        cvData,
      },
    })

    const closeButton = document.body.querySelector<HTMLButtonElement>('[aria-label="Close export dialog"]')
    expect(closeButton).not.toBeNull()
    closeButton?.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toContainEqual([false])
  })

  it('emits the selected format, always A4 paper size, and filename', async () => {
    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: true,
        activeTemplateComponent: PreviewStub,
        cvData,
      },
    })

    expect(getBodyButton('US Letter')).toBeUndefined()
    expect(document.body.textContent).not.toContain('Paper Size')

    const plainTextButton = getBodyButton('Plain Text')
    expect(plainTextButton).not.toBeUndefined()
    plainTextButton?.click()

    const filenameInput = document.body.querySelector<HTMLInputElement>('#export-filename')
    expect(filenameInput).not.toBeNull()
    if (filenameInput) {
      filenameInput.value = 'Alexandra_Chen.txt'
      filenameInput.dispatchEvent(new Event('input', { bubbles: true }))
    }

    await nextTick()

    const exportButton = getBodyButton('Export as Plain Text')
    expect(exportButton).not.toBeUndefined()
    exportButton?.click()
    await nextTick()

    expect(wrapper.emitted('export')).toContainEqual([{
      format: 'txt',
      paperSize: 'a4',
      filename: 'Alexandra_Chen.txt',
      includeLinks: true,
    }])
  })

  it('emits print event when Print directly button is clicked', async () => {
    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: true,
        activeTemplateComponent: PreviewStub,
        cvData,
      },
    })

    const printButton = getBodyButton('Print directly')
    expect(printButton).not.toBeUndefined()
    printButton?.click()
    await nextTick()

    expect(wrapper.emitted('print')).toBeDefined()
  })

  it('omits placeholders in the preview when mock data is provided', async () => {
    const mockPreviewData = {
      personal_details: {
        first_name: 'Your',
        last_name: 'Name',
      },
      experiences: [
        { id: '1', role: 'Your Job Title', company: 'Company Name' },
      ],
      skills: [{ id: 's1', name: 'Your Skill' }],
    }

    const MockTemplateStub = defineComponent({
      props: ['data'],
      template: '<div data-testid="mock-preview"><span class="name">{{ data?.personal_details?.first_name }}</span><span class="exp-count">{{ data?.experiences?.length }}</span><span class="skill-count">{{ data?.skills?.length }}</span></div>',
    })

    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: true,
        activeTemplateComponent: MockTemplateStub,
        data: mockPreviewData,
      },
    })

    expect(document.body.querySelector('[data-testid="mock-preview"] .name')?.textContent).toBe('')
    expect(document.body.querySelector('[data-testid="mock-preview"] .exp-count')?.textContent).toBe('0')
    expect(document.body.querySelector('[data-testid="mock-preview"] .skill-count')?.textContent).toBe('0')
    expect(document.body.querySelector<HTMLInputElement>('[aria-label="File name"]')?.value)
      .toMatch(/^CraftCV_Resume_\d{4}\.pdf$/)
  })

  it('renders error banner when errorMessage is passed and emits clear-error on dismiss', async () => {
    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: true,
        activeTemplateComponent: PreviewStub,
        cvData,
        errorMessage: 'Export process encountered an unexpected issue.',
      },
    })

    expect(document.body.textContent).toContain('Export process encountered an unexpected issue.')
    const dismissButton = getBodyButton('Dismiss')
    expect(dismissButton).not.toBeUndefined()
    dismissButton?.click()
    await nextTick()

    expect(wrapper.emitted('clear-error')).toBeDefined()
  })

  it('toggles mobile tabs between Export Options and Preview Document', async () => {
    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: true,
        activeTemplateComponent: PreviewStub,
        cvData,
      },
    })

    const optionsTab = getBodyButton('Export Options')
    const previewTab = getBodyButton('Preview Document')
    expect(optionsTab).not.toBeUndefined()
    expect(previewTab).not.toBeUndefined()

    // Initially, options tab is active
    expect(optionsTab?.className).toContain('bg-white')
    expect(previewTab?.className).toContain('text-stone-500')

    // Click preview tab
    previewTab?.click()
    await nextTick()

    expect(previewTab?.className).toContain('bg-white')
    expect(optionsTab?.className).toContain('text-stone-500')

    // Click options tab back
    optionsTab?.click()
    await nextTick()

    expect(optionsTab?.className).toContain('bg-white')
    expect(previewTab?.className).toContain('text-stone-500')
  })

  it('renders dynamic pagination controls and disables arrows when single page', async () => {
    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: true,
        activeTemplateComponent: PreviewStub,
        cvData,
      },
    })

    expect(document.body.textContent).toContain('Page 1 of 1')
    const prevBtn = document.body.querySelector<HTMLButtonElement>('button[aria-label="Previous page"]')
    const nextBtn = document.body.querySelector<HTMLButtonElement>('button[aria-label="Next page"]')
    expect(prevBtn).not.toBeNull()
    expect(nextBtn).not.toBeNull()
    expect(prevBtn?.disabled).toBe(true)
    expect(nextBtn?.disabled).toBe(true)
  })

  it('renders floating zoom controls and adjusts zoom on click', async () => {
    wrapper = await mountSuspended(ExportModal, {
      props: {
        modelValue: true,
        activeTemplateComponent: PreviewStub,
        cvData,
      },
    })

    const zoomOutBtn = document.body.querySelector<HTMLButtonElement>('button[aria-label="Zoom out"]')
    const zoomInBtn = document.body.querySelector<HTMLButtonElement>('button[aria-label="Zoom in"]')
    const fitBtn = document.body.querySelector<HTMLButtonElement>('button[aria-label="Fit to view"]')
    expect(zoomOutBtn).not.toBeNull()
    expect(zoomInBtn).not.toBeNull()
    expect(fitBtn).not.toBeNull()

    // Initial default zoom is 35%
    expect(document.body.textContent).toContain('35%')

    // Zoom in
    zoomInBtn?.click()
    await nextTick()
    expect(document.body.textContent).toContain('45%')

    // Zoom out twice
    zoomOutBtn?.click()
    await nextTick()
    expect(document.body.textContent).toContain('35%')
    zoomOutBtn?.click()
    await nextTick()
    expect(document.body.textContent).toContain('30%')
    // At minimum 30%, zoomOutBtn should be disabled
    expect(zoomOutBtn?.disabled).toBe(true)

    // Fit resets zoom
    fitBtn?.click()
    await nextTick()
    expect(document.body.textContent).toContain('35%')

    // Can zoom past 45% all the way up to 150%
    for (let i = 0; i < 15; i++) {
      zoomInBtn?.click()
    }
    await nextTick()
    expect(document.body.textContent).toContain('150%')
    expect(zoomInBtn?.disabled).toBe(true)
  })
})
