// @vitest-environment nuxt
import { mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import MonthYearPicker, { MONTH_NAMES, formatDateValue, parseDateValue } from '../../app/components/editor/MonthYearPicker.vue'

describe('parseDateValue', () => {
  it('reads "Month YYYY" in month mode', () => {
    const parsed = parseDateValue('January 2024', 'month')
    expect(parsed?.year).toBe(2024)
    expect(parsed?.month).toBe(1)
    expect(parsed?.day).toBe(1)
  })

  it('reads "DD/MM/YYYY" in day mode', () => {
    const parsed = parseDateValue('24/08/1990', 'day')
    expect(parsed?.year).toBe(1990)
    expect(parsed?.month).toBe(8)
    expect(parsed?.day).toBe(24)
  })

  it('has no date for empty values or "Present"', () => {
    expect(parseDateValue('', 'month')).toBeUndefined()
    expect(parseDateValue('   ', 'month')).toBeUndefined()
    expect(parseDateValue(null, 'month')).toBeUndefined()
    expect(parseDateValue(undefined, 'month')).toBeUndefined()
    expect(parseDateValue('Present', 'month')).toBeUndefined()
  })

  it('rejects malformed values instead of throwing', () => {
    expect(parseDateValue('January', 'month')).toBeUndefined()
    expect(parseDateValue('Smarch 2024', 'month')).toBeUndefined()
    expect(parseDateValue('24-08-1990', 'day')).toBeUndefined()
    expect(parseDateValue('32/08/1990', 'day')).toBeUndefined()
    expect(parseDateValue('24/13/1990', 'day')).toBeUndefined()
  })
})

describe('formatDateValue', () => {
  it('writes "Month YYYY" in month mode', () => {
    expect(formatDateValue(new CalendarDate(2024, 1, 1), 'month')).toBe('January 2024')
    expect(formatDateValue(new CalendarDate(2024, 12, 15), 'month')).toBe('December 2024')
  })

  it('writes zero-padded "DD/MM/YYYY" in day mode', () => {
    expect(formatDateValue(new CalendarDate(1990, 8, 24), 'day')).toBe('24/08/1990')
    expect(formatDateValue(new CalendarDate(2001, 2, 3), 'day')).toBe('03/02/2001')
  })

  it('round-trips both modes unchanged', () => {
    expect(formatDateValue(parseDateValue('June 2023', 'month')!, 'month')).toBe('June 2023')
    expect(formatDateValue(parseDateValue('24/08/1990', 'day')!, 'day')).toBe('24/08/1990')
  })
})

const mounted: VueWrapper[] = []

function mountPicker(props: Record<string, unknown> = {}) {
  const wrapper = mount(MonthYearPicker, {
    props: { label: 'Start Date', ...props },
    attachTo: document.body,
  })
  mounted.push(wrapper)
  return wrapper
}

function trigger(wrapper: VueWrapper) {
  return wrapper.find('button[type="button"]')
}

async function openPicker(wrapper: VueWrapper) {
  await trigger(wrapper).trigger('click')
  await nextTick()
}

function click(selector: string) {
  const el = document.querySelector<HTMLElement>(selector)
  expect(el, `expected to find ${selector}`).not.toBeNull()
  el!.click()
}

function cells(attribute: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(`[${attribute}]`))
}

function cellLabeled(attribute: string, text: string) {
  return cells(attribute).find(el => el.textContent?.trim() === text)
}

/**
 * The panel heading is a button, so its text is read directly rather than via
 * `document.body.textContent` — the trigger holds the field's own value, which
 * would make a "contains 2023" assertion pass no matter what the grid showed.
 */
function headingText(title: string) {
  return document.querySelector<HTMLElement>(`[title="${title}"]`)?.textContent?.trim()
}

const MONTH = 'data-reka-month-picker-cell-trigger'
const DAY = 'data-reka-calendar-cell-trigger'
const YEAR = 'data-reka-year-picker-cell-trigger'

afterEach(() => {
  mounted.forEach(wrapper => wrapper.unmount())
  mounted.length = 0
  document.body.innerHTML = ''
})

describe('MonthYearPicker.vue', () => {
  it('renders the label and the required indicator', () => {
    const wrapper = mountPicker({ required: true })

    expect(wrapper.text()).toContain('Start Date')
    expect(wrapper.find('span.text-\\[\\#C54A22\\]').exists()).toBe(true)
  })

  it('shows the formatted value on the trigger', () => {
    const wrapper = mountPicker({ modelValue: 'March 2023' })

    expect(trigger(wrapper).text()).toContain('March 2023')
  })

  it('shows the placeholder when there is no value', () => {
    const wrapper = mountPicker({ placeholder: 'Select date' })

    expect(trigger(wrapper).text()).toContain('Select date')
  })

  it('shows "Present" as-is without selecting a month', async () => {
    const wrapper = mountPicker({ modelValue: 'Present' })

    expect(trigger(wrapper).text()).toContain('Present')

    await openPicker(wrapper)
    expect(cells(MONTH).filter(el => el.hasAttribute('data-selected'))).toHaveLength(0)
  })

  it('disables the trigger when disabled is true', () => {
    const wrapper = mountPicker({ disabled: true, modelValue: 'March 2023' })

    expect((trigger(wrapper).element as HTMLButtonElement).disabled).toBe(true)
  })

  it('renders the error message when provided', () => {
    const wrapper = mountPicker({ error: 'Start date is required' })

    expect(wrapper.find('p.text-red-500').text()).toBe('Start date is required')
  })

  it('opens a 12-month grid and marks the current value as selected', async () => {
    const wrapper = mountPicker({ modelValue: 'March 2023' })
    await openPicker(wrapper)

    const monthCells = cells(MONTH)
    expect(monthCells).toHaveLength(12)
    expect(cellLabeled(MONTH, 'Mar')?.hasAttribute('data-selected')).toBe(true)
  })

  it('emits "Month YYYY" and closes when a month is picked', async () => {
    const wrapper = mountPicker({ modelValue: 'March 2023' })
    await openPicker(wrapper)

    cellLabeled(MONTH, 'Jun')!.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['June 2023'])
    expect(cells(MONTH)).toHaveLength(0)
  })

  it('steps the heading year with prev and next', async () => {
    const wrapper = mountPicker({ modelValue: 'March 2023' })
    await openPicker(wrapper)

    expect(headingText('Change year')).toBe('2023')

    click('[aria-label="Next year"]')
    await nextTick()
    expect(headingText('Change year')).toBe('2024')

    click('[aria-label="Previous year"]')
    await nextTick()
    expect(headingText('Change year')).toBe('2023')
  })

  it('drills from the month grid into a year grid and back', async () => {
    const wrapper = mountPicker({ modelValue: 'March 2023' })
    await openPicker(wrapper)

    click('[title="Change year"]')
    await nextTick()

    // 12 years, and 2009 is out of reach on the decade the picker opened on.
    expect(cells(YEAR)).toHaveLength(12)
    expect(cells(MONTH)).toHaveLength(0)
    expect(cellLabeled(YEAR, '2009')).toBeUndefined()

    // One page back reaches it — this is the jump that used to take 14 clicks.
    click('[aria-label="Previous years"]')
    await nextTick()
    cellLabeled(YEAR, '2009')!.click()
    await nextTick()

    // Back on the month grid, on the year that was picked, nothing committed.
    expect(headingText('Change year')).toBe('2009')
    expect(cells(MONTH)).toHaveLength(12)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    // The month now commits against the drilled-to year.
    cellLabeled(MONTH, 'Jun')!.click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['June 2009'])
  })

  it('reopens on the current value after drilling somewhere else', async () => {
    const wrapper = mountPicker({ modelValue: 'March 2023' })
    await openPicker(wrapper)

    click('[title="Change year"]')
    await nextTick()
    click('[aria-label="Previous years"]')
    await nextTick()
    cellLabeled(YEAR, '2009')!.click()
    await nextTick()
    expect(headingText('Change year')).toBe('2009')

    // Close without picking, then reopen.
    await trigger(wrapper).trigger('click')
    await nextTick()
    await openPicker(wrapper)

    expect(headingText('Change year')).toBe('2023')
  })

  it('emits "DD/MM/YYYY" in day mode', async () => {
    const wrapper = mountPicker({ mode: 'day', modelValue: '24/08/1990' })
    await openPicker(wrapper)

    const dayCells = cells(DAY)
    expect(dayCells.length).toBeGreaterThan(0)
    expect(cellLabeled(DAY, '24')?.hasAttribute('data-selected')).toBe(true)

    cellLabeled(DAY, '15')!.click()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['15/08/1990'])
  })

  it('does not offer future dates in day mode', async () => {
    const wrapper = mountPicker({ mode: 'day' })
    await openPicker(wrapper)

    // The 15th of next month is always in the future, whatever today is.
    click('[aria-label="Next month"]')
    await nextTick()

    const fifteenth = cellLabeled(DAY, '15')
    expect(fifteenth).toBeDefined()
    expect(fifteenth!.hasAttribute('data-disabled')).toBe(true)
  })

  it('blocks future years when disableFuture is set', async () => {
    const thisYear = today(getLocalTimeZone()).year
    const wrapper = mountPicker({ modelValue: `June ${thisYear}`, disableFuture: true })
    await openPicker(wrapper)

    click('[title="Change year"]')
    await nextTick()

    expect(cellLabeled(YEAR, String(thisYear))?.hasAttribute('data-disabled')).toBe(false)
    expect(cellLabeled(YEAR, String(thisYear + 1))?.hasAttribute('data-disabled')).toBe(true)
  })

  it('still offers the current month when future dates are blocked', async () => {
    const now = today(getLocalTimeZone())
    const monthName = MONTH_NAMES[now.month - 1]!
    const wrapper = mountPicker({ modelValue: `${monthName} ${now.year}`, disableFuture: true })
    await openPicker(wrapper)

    // The bound is applied as `dateObj.set({ day: 1 })`, so the month today
    // falls in stays pickable rather than being cut off mid-month.
    expect(cellLabeled(MONTH, monthName.slice(0, 3))?.hasAttribute('data-disabled')).toBe(false)
  })

  it('leaves future years open when disableFuture is not set', async () => {
    const thisYear = today(getLocalTimeZone()).year
    const wrapper = mountPicker({ modelValue: `June ${thisYear}` })
    await openPicker(wrapper)

    click('[title="Change year"]')
    await nextTick()

    // End dates and expiry dates are legitimately ahead of today.
    expect(cellLabeled(YEAR, String(thisYear + 1))?.hasAttribute('data-disabled')).toBe(false)
  })

  it('drills day -> month -> year without committing', async () => {
    const wrapper = mountPicker({ mode: 'day', modelValue: '24/08/1990' })
    await openPicker(wrapper)

    expect(cells(DAY).length).toBeGreaterThan(0)
    expect(headingText('Change month')).toBe('August 1990')

    // Day grid -> month grid.
    click('[title="Change month"]')
    await nextTick()
    expect(cells(MONTH)).toHaveLength(12)
    expect(cells(DAY)).toHaveLength(0)
    expect(headingText('Change year')).toBe('1990')

    // Month grid -> year grid.
    click('[title="Change year"]')
    await nextTick()
    expect(cells(YEAR)).toHaveLength(12)

    // Pick 1992: lands back on the month grid for that year, still uncommitted.
    cellLabeled(YEAR, '1992')!.click()
    await nextTick()
    expect(headingText('Change year')).toBe('1992')
    expect(cells(MONTH)).toHaveLength(12)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    // Pick June: lands on the day grid with no day chosen yet.
    cellLabeled(MONTH, 'Jun')!.click()
    await nextTick()
    expect(headingText('Change month')).toBe('June 1992')
    expect(cells(DAY).length).toBeGreaterThan(0)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    // Only now does choosing a day commit, with the drilled-to month and year.
    cellLabeled(DAY, '15')!.click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['15/06/1992'])
  })
})
