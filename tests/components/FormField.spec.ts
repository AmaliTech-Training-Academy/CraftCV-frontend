// @vitest-environment nuxt
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormField from '../../app/components/editor/FormField.vue'

const createPasteEvent = (text: string): ClipboardEvent => {
  const event = new Event('paste', { cancelable: true })
  Object.defineProperty(event, 'clipboardData', {
    value: {
      getData: () => text,
    },
  })
  return event as unknown as ClipboardEvent
}

describe('FormField.vue', () => {
  it('renders label, input and passes basic props', () => {
    const wrapper = mount(FormField, {
      props: {
        label: 'First Name',
        placeholder: 'e.g. Jane',
        modelValue: 'Jane',
      },
    })

    expect(wrapper.find('label').text()).toContain('First Name')
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('e.g. Jane')
    expect(input.element.value).toBe('Jane')
  })

  it('displays required asterisk and error message when provided', () => {
    const wrapper = mount(FormField, {
      props: {
        label: 'Email',
        required: true,
        error: 'Email is required',
      },
    })

    expect(wrapper.find('label').text()).toContain('*')
    expect(wrapper.text()).toContain('Email is required')
    expect(wrapper.find('input').classes()).toContain('border-red-400')
  })

  describe('Phone input (type="tel" / inputmode="tel")', () => {
    it('blocks letter keystrokes on keydown', async () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Phone Number',
          type: 'tel',
          modelValue: '',
        },
      })

      const input = wrapper.find('input')

      // Letter keys should have preventDefault called
      const letterEvent = new KeyboardEvent('keydown', { key: 'a', cancelable: true })
      input.element.dispatchEvent(letterEvent)
      expect(letterEvent.defaultPrevented).toBe(true)

      const upperLetterEvent = new KeyboardEvent('keydown', { key: 'Z', cancelable: true })
      input.element.dispatchEvent(upperLetterEvent)
      expect(upperLetterEvent.defaultPrevented).toBe(true)

      // Disallowed special chars should be prevented
      const invalidSymbolEvent = new KeyboardEvent('keydown', { key: '$', cancelable: true })
      input.element.dispatchEvent(invalidSymbolEvent)
      expect(invalidSymbolEvent.defaultPrevented).toBe(true)

      // Digits and valid phone characters should be allowed
      const digitEvent = new KeyboardEvent('keydown', { key: '5', cancelable: true })
      input.element.dispatchEvent(digitEvent)
      expect(digitEvent.defaultPrevented).toBe(false)

      const plusEvent = new KeyboardEvent('keydown', { key: '+', cancelable: true })
      input.element.dispatchEvent(plusEvent)
      expect(plusEvent.defaultPrevented).toBe(false)

      // Navigation / control keys (Backspace, Tab, ArrowLeft) should be allowed
      const backspaceEvent = new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true })
      input.element.dispatchEvent(backspaceEvent)
      expect(backspaceEvent.defaultPrevented).toBe(false)
    })

    it('strips letters on input event', async () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Phone Number',
          type: 'tel',
          modelValue: '',
        },
      })

      const input = wrapper.find('input')
      input.element.value = '+1 555-abc-1234'
      await input.trigger('input')

      expect(input.element.value).toBe('+1 555--1234')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['+1 555--1234'])
    })

    it('strips letters on paste event', async () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Phone Number',
          type: 'tel',
          modelValue: '+1',
        },
      })

      const input = wrapper.find('input')
      const pasteEvent = createPasteEvent('call 555-9012')
      input.element.dispatchEvent(pasteEvent)

      expect(pasteEvent.defaultPrevented).toBe(true)
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['+1 555-9012'])
    })
  })

  describe('Numeric input (type="number" / inputmode="numeric")', () => {
    it('blocks non-digit keystrokes', async () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Quantity',
          type: 'number',
          modelValue: '',
        },
      })

      const input = wrapper.find('input')

      const letterEvent = new KeyboardEvent('keydown', { key: 'e', cancelable: true })
      input.element.dispatchEvent(letterEvent)
      expect(letterEvent.defaultPrevented).toBe(true)

      const digitEvent = new KeyboardEvent('keydown', { key: '7', cancelable: true })
      input.element.dispatchEvent(digitEvent)
      expect(digitEvent.defaultPrevented).toBe(false)
    })

    it('strips non-digits on input', async () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Code',
          inputmode: 'numeric',
          modelValue: '',
        },
      })

      const input = wrapper.find('input')
      input.element.value = '12ab34'
      await input.trigger('input')

      expect(input.element.value).toBe('1234')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1234'])
    })
  })

  describe('URL & Email inputs', () => {
    it('prevents space key on url and email fields', async () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Website',
          type: 'url',
          modelValue: '',
        },
      })

      const input = wrapper.find('input')
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ', cancelable: true })
      input.element.dispatchEvent(spaceEvent)
      expect(spaceEvent.defaultPrevented).toBe(true)
    })

    it('strips spaces on paste into email field', async () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Email',
          type: 'email',
          modelValue: '',
        },
      })

      const input = wrapper.find('input')
      const pasteEvent = createPasteEvent(' user@example.com ')
      input.element.dispatchEvent(pasteEvent)

      expect(pasteEvent.defaultPrevented).toBe(true)
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['user@example.com'])
    })
  })

  it('emits blur event when input loses focus', async () => {
    const wrapper = mount(FormField, {
      props: {
        label: 'Name',
        modelValue: 'Alex',
      },
    })

    const input = wrapper.find('input')
    await input.trigger('blur')
    expect(wrapper.emitted('blur')).toBeDefined()
  })

  describe('Accessibility and Tooltips', () => {
    it('renders aria-required and sr-only required label when required', () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Email',
          required: true,
        },
      })

      const input = wrapper.find('input')
      expect(input.attributes('aria-required')).toBe('true')
      expect(wrapper.find('.sr-only').text()).toBe('(required)')
    })

    it('sets aria-invalid and connects aria-describedby to error id', () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Email',
          error: 'Invalid email address',
        },
      })

      const input = wrapper.find('input')
      expect(input.attributes('aria-invalid')).toBe('true')
      const describedby = input.attributes('aria-describedby')
      expect(describedby).toBeDefined()
      const errorEl = wrapper.find('[role="alert"]')
      expect(errorEl.attributes('id')).toBe(describedby)
      expect(errorEl.text()).toBe('Invalid email address')
    })

    it('renders accessible tooltip button and links tooltip via aria-describedby', () => {
      const wrapper = mount(FormField, {
        props: {
          label: 'Phone Number',
          tooltip: 'Include your international country code',
        },
      })

      const btn = wrapper.find('button[type="button"]')
      expect(btn.exists()).toBe(true)
      expect(btn.attributes('aria-label')).toContain('Phone Number')
      const input = wrapper.find('input')
      expect(input.attributes('aria-describedby')).toContain('-tooltip')
    })
  })
})
