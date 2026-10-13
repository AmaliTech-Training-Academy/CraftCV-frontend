import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { evaluatePasswordStrength, usePasswordStrength } from '../app/utils/password'

describe('evaluatePasswordStrength', () => {
  it('returns empty message and weak level for empty input', () => {
    const res = evaluatePasswordStrength('')
    expect(res.level).toBe('weak')
    expect(res.label).toBe('Weak')
    expect(res.score).toBe(0)
    expect(res.message).toBe('')
    expect(res.isStrong).toBe(false)
  })

  it('evaluates weak passwords (< 8 characters or 1 rule) with text-red-700', () => {
    const res1 = evaluatePasswordStrength('abc')
    expect(res1.level).toBe('weak')
    expect(res1.label).toBe('Weak')
    expect(res1.colorClass).toContain('text-red-700')
    expect(res1.message).toContain('To make it stronger, add:')
    expect(res1.isStrong).toBe(false)

    const res2 = evaluatePasswordStrength('1234567')
    expect(res2.level).toBe('weak')
    expect(res2.label).toBe('Weak')
    expect(res2.colorClass).toContain('text-red-700')
    expect(res2.message).toContain('To make it stronger, add:')
  })

  it('evaluates medium passwords (2 to 4 criteria met) with text-amber-800', () => {
    // 8+ chars, lowercase, numbers (3 criteria met)
    const res = evaluatePasswordStrength('securepass1')
    expect(res.level).toBe('medium')
    expect(res.label).toBe('Fair')
    expect(res.colorClass).toContain('text-amber-800')
    expect(res.message).toContain('To make it stronger, add:')
    expect(res.isStrong).toBe(false)
  })

  it('evaluates complete strong passwords meeting all requirements with text-emerald-800', () => {
    // 8+ chars, lowercase, uppercase, number, special symbol, no simple repetition
    const res = evaluatePasswordStrength('P@ssw0rd2026!')
    expect(res.level).toBe('strong')
    expect(res.label).toBe('Strong')
    expect(res.colorClass).toContain('text-emerald-800')
    expect(res.message).toBe('Password is strong.')
    expect(res.isStrong).toBe(true)
  })

  it('caps score and assigns weak level when password is under 8 characters', () => {
    // 7 chars, meets lowercase, uppercase, number, special
    const res = evaluatePasswordStrength('Aa1!xyz')
    expect(res.score).toBe(1)
    expect(res.level).toBe('weak')
    expect(res.label).toBe('Weak')
    expect(res.colorClass).toContain('text-red-700')
    expect(res.message).toBe('To make it stronger, add: at least 8 characters.')
    expect(res.isStrong).toBe(false)
  })

  it('does not flag words like Administrator as weak sequences', () => {
    const res = evaluatePasswordStrength('Administrator2026!')
    expect(res.level).toBe('strong')
    expect(res.label).toBe('Strong')
    expect(res.isStrong).toBe(true)
  })

  it('does not flag high-entropy passphrases containing common words', () => {
    const res = evaluatePasswordStrength('Welcome-To-The-Jungle-2026!')
    expect(res.level).toBe('strong')
    expect(res.label).toBe('Strong')
    expect(res.isStrong).toBe(true)
  })

  it('does NOT flag words containing "abc" as substrings as common patterns (avoids false positives)', () => {
    // Cabcall contains "abc" in "Cab" + "c", but is not a weak sequence
    const res = evaluatePasswordStrength('Cabcall2026!')
    expect(res.level).toBe('strong')
    expect(res.label).toBe('Strong')
    expect(res.colorClass).toContain('text-emerald-800')
    expect(res.message).toBe('Password is strong.')
    expect(res.isStrong).toBe(true)
  })

  it('flags passwords containing 4+ identical characters or weak words as medium even if length >= 8', () => {
    const res1 = evaluatePasswordStrength('Qwerty123!')
    expect(res1.level).toBe('medium')
    expect(res1.label).toBe('Fair')
    expect(res1.colorClass).toContain('text-amber-800')
    expect(res1.message).toContain('avoid common sequences')
    expect(res1.isStrong).toBe(false)

    const res2 = evaluatePasswordStrength('aaaaB1!xyz')
    expect(res2.level).toBe('medium')
    expect(res2.label).toBe('Fair')
    expect(res2.colorClass).toContain('text-amber-800')
    expect(res2.message).toContain('avoid common sequences')
    expect(res2.isStrong).toBe(false)
  })

  it('works reactively with usePasswordStrength', () => {
    const pw = ref('short')
    const strength = usePasswordStrength(pw)
    expect(strength.value.level).toBe('weak')
    expect(strength.value.label).toBe('Weak')

    pw.value = 'securepass1'
    expect(strength.value.level).toBe('medium')
    expect(strength.value.label).toBe('Fair')

    pw.value = 'P@ssw0rd2026!'
    expect(strength.value.level).toBe('strong')
    expect(strength.value.label).toBe('Strong')
  })
})
