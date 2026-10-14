import { computed, type Ref, type ComputedRef } from 'vue'

export interface PasswordCriterion {
  key: string
  hint: string
  passed: boolean
}

export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong'
export type PasswordStrengthLabel = 'Weak' | 'Fair' | 'Strong'

export interface PasswordStrengthResult {
  score: number
  level: PasswordStrengthLevel
  label: PasswordStrengthLabel
  colorClass: string
  message: string
  criteria: PasswordCriterion[]
  isStrong: boolean
}

function checkCommonPattern(pw: string): boolean {
  if (!pw) return false

  // 4+ consecutive identical characters (e.g. "aaaa", "1111")
  if (/(.)\1{3,}/.test(pw)) return true

  // High-entropy passphrases (e.g. 20+ characters) are not simple weak sequences
  if (pw.length >= 20) return false

  const lower = pw.toLowerCase()

  // Match standalone weak sequences (not embedded in broader words like "administrator")
  const weakWordPattern = /(^|[^a-z])(password|admin|letmein|welcome|qwerty)([^a-z]|$)/i
  if (weakWordPattern.test(lower)) return true

  // Sequential numbers
  if (lower.includes('123456')) return true

  return false
}

export function evaluatePasswordStrength(password?: string): PasswordStrengthResult {
  const pw = password || ''
  const hasCommonPattern = checkCommonPattern(pw)

  const criteria: PasswordCriterion[] = [
    { key: 'length', hint: 'at least 8 characters', passed: pw.length >= 8 },
    { key: 'lowercase', hint: 'a lowercase letter', passed: /[a-z]/.test(pw) },
    { key: 'uppercase', hint: 'an uppercase letter', passed: /[A-Z]/.test(pw) },
    { key: 'number', hint: 'a number', passed: /[0-9]/.test(pw) },
    { key: 'special', hint: 'a special symbol', passed: /[^A-Za-z0-9]/.test(pw) },
  ]

  const passedCount = criteria.filter(c => c.passed).length
  const missing = criteria.filter(c => !c.passed)

  if (!pw) {
    return {
      score: 0,
      level: 'weak',
      label: 'Weak',
      colorClass: 'text-red-700 dark:text-red-400',
      message: '',
      criteria,
      isStrong: false,
    }
  }

  // 3. Strong (All requirements met and no common sequences)
  if (passedCount === 5 && !hasCommonPattern) {
    return {
      score: passedCount,
      level: 'strong',
      label: 'Strong',
      colorClass: 'text-emerald-800 dark:text-emerald-300',
      message: 'Password is strong.',
      criteria,
      isStrong: true,
    }
  }

  // Build guidance message with hints and consistent period punctuation
  const hints = missing.map(m => m.hint)
  let message = ''
  if (hints.length > 0 && hasCommonPattern) {
    message = `To make it stronger, add: ${hints.join(', ')} and avoid common sequences.`
  }
  else if (hints.length > 0) {
    message = `To make it stronger, add: ${hints.join(', ')}.`
  }
  else if (hasCommonPattern) {
    message = 'To make it stronger, avoid common sequences.'
  }

  // 1. Weak (< 8 characters or 0 to 1 criteria passed)
  if (pw.length < 8 || passedCount <= 1) {
    return {
      score: pw.length < 8 ? Math.min(passedCount, 1) : passedCount,
      level: 'weak',
      label: 'Weak',
      colorClass: 'text-red-700 dark:text-red-400',
      message,
      criteria,
      isStrong: false,
    }
  }

  // 2. Medium / Fair (2 to 4 criteria met, or all met but common pattern detected)
  return {
    score: passedCount,
    level: 'medium',
    label: 'Fair',
    colorClass: 'text-amber-800 dark:text-amber-300',
    message,
    criteria,
    isStrong: false,
  }
}

export function usePasswordStrength(passwordSource: Ref<string> | ComputedRef<string> | (() => string)) {
  return computed(() => {
    const pw = typeof passwordSource === 'function' ? passwordSource() : passwordSource.value
    return evaluatePasswordStrength(pw)
  })
}
