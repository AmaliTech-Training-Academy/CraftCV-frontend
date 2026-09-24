/**
 * Composable for the forgot-password flow.
 *
 * Covers the 3 API steps:
 *   1. requestReset   — POST /api/auth/forgot-password/
 *   2. verifyCode     — POST /api/auth/verify-code/
 *   3. resetPassword  — POST /api/auth/reset-password/
 *
 * The API always returns 200 for step 1 (anti-enumeration).
 * Steps 2 and 3 return 400 for invalid/expired codes.
 */

interface ApiError {
  detail?: string
  [key: string]: unknown
}

async function post<T = void>(path: string, body: Record<string, unknown>): Promise<T> {
  // useRuntimeConfig() is auto-imported by Nuxt — reads apiBase from nuxt.config.ts
  // In dev set NUXT_PUBLIC_API_BASE=https://<tunnel>/api to point at Django directly.
  // In production nginx proxies /api → Django so the default '/api' is correct.
  const { public: { apiBase } } = useRuntimeConfig()
  return $fetch<T>(`${apiBase}/auth${path}`, {
    method: 'POST',
    body,
  })
}

export const usePasswordReset = () => {
  /**
   * Step 1 — Send reset code to email.
   * Always resolves (server never reveals if the email exists).
   */
  const requestReset = (email: string) =>
    post('/forgot-password/', { email })

  /**
   * Step 2 — Verify the 6-digit code without consuming it.
   * Throws on invalid/expired code.
   */
  const verifyCode = (email: string, code: string) =>
    post('/verify-code/', { email, code })

  /**
   * Step 3 — Set a new password using the verified code.
   * Throws on invalid/expired code (400).
   */
  const resetPassword = (email: string, code: string, newPassword: string) =>
    post('/reset-password/', { email, code, newPassword })

  return { requestReset, verifyCode, resetPassword }
}

/** Typed error helper — extracts a human-readable message from $fetch errors */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error || typeof error !== 'object') return fallback
  const data = (error as { data?: ApiError }).data
  if (data?.detail) return data.detail
  // Collect all field-level error messages
  if (data) {
    const messages = Object.values(data).flat().filter(v => typeof v === 'string')
    if (messages.length) return messages.join(' ')
  }
  return fallback
}
