import { describe, it, expect } from 'vitest'
import {
  parseDescription,
  descriptionToHTML,
  tiptapJSONToDescription,
  formatMonthYear,
  dateRangeLabel,
} from '../app/utils/cvText'

describe('cvText utilities', () => {
  describe('parseDescription', () => {
    it('returns empty array when text is null or undefined or empty', () => {
      expect(parseDescription(null)).toEqual([])
      expect(parseDescription(undefined)).toEqual([])
      expect(parseDescription('')).toEqual([])
      expect(parseDescription('   ')).toEqual([])
    })

    it('parses single and multiple paragraphs', () => {
      const text = 'First paragraph.\nSecond paragraph.'
      const blocks = parseDescription(text)
      expect(blocks).toEqual([
        { type: 'p', text: 'First paragraph.' },
        { type: 'p', text: 'Second paragraph.' },
      ])
    })

    it('parses hyphen bullet lists', () => {
      const text = '- Item 1\n- Item 2'
      const blocks = parseDescription(text)
      expect(blocks).toEqual([
        { type: 'ul', items: ['Item 1', 'Item 2'] },
      ])
    })

    it('parses unicode bullet points with or without trailing space', () => {
      const text = '• Item 1\n•Item 2'
      const blocks = parseDescription(text)
      expect(blocks).toEqual([
        { type: 'ul', items: ['Item 1', 'Item 2'] },
      ])
    })

    it('parses asterisk and dash bullet points', () => {
      const text = '* Star bullet\n– En-dash bullet\n— Em-dash bullet'
      const blocks = parseDescription(text)
      expect(blocks).toEqual([
        { type: 'ul', items: ['Star bullet', 'En-dash bullet', 'Em-dash bullet'] },
      ])
    })

    it('does not treat negative numbers as bullets', () => {
      const text = '-10% decrease in latency'
      const blocks = parseDescription(text)
      expect(blocks).toEqual([
        { type: 'p', text: '-10% decrease in latency' },
      ])
    })

    it('handles mixed paragraphs and bullet lists', () => {
      const text = 'Introductory sentence.\n- Point A\n- Point B\nConclusion sentence.'
      const blocks = parseDescription(text)
      expect(blocks).toEqual([
        { type: 'p', text: 'Introductory sentence.' },
        { type: 'ul', items: ['Point A', 'Point B'] },
        { type: 'p', text: 'Conclusion sentence.' },
      ])
    })
  })

  describe('descriptionToHTML', () => {
    it('converts plain text to HTML paragraphs and lists', () => {
      const text = 'Paragraph\n- Bullet 1\n- Bullet 2'
      const html = descriptionToHTML(text)
      expect(html).toBe('<p>Paragraph</p><ul><li><p>Bullet 1</p></li><li><p>Bullet 2</p></li></ul>')
    })
  })

  describe('tiptapJSONToDescription', () => {
    it('converts Tiptap JSON content into plain text format', () => {
      const json = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Overview line' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Task 1' }],
                  },
                ],
              },
            ],
          },
        ],
      }
      expect(tiptapJSONToDescription(json)).toBe('Overview line\n- Task 1')
    })
  })

  describe('formatMonthYear', () => {
    it('formats YYYY-MM-01 correctly', () => {
      expect(formatMonthYear('2024-05-01')).toBe('May 2024')
      expect(formatMonthYear('2020-01-01')).toBe('January 2020')
      expect(formatMonthYear('2021-12-01')).toBe('December 2021')
    })

    it('returns raw value when format does not match YYYY-MM-DD', () => {
      expect(formatMonthYear('May 2024')).toBe('May 2024')
      expect(formatMonthYear('Present')).toBe('Present')
      expect(formatMonthYear('')).toBe('')
    })
  })

  describe('dateRangeLabel', () => {
    it('generates date ranges for experiences and educations', () => {
      expect(dateRangeLabel('2022-01-01', '2023-05-01', false)).toBe('January 2022 - May 2023')
      expect(dateRangeLabel('2022-01-01', null, true)).toBe('January 2022 - Present')
      expect(dateRangeLabel(null, null, false)).toBe('')
    })
  })
})
