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

import { $api } from '~/utils/api'

async function post<T = void>(path: string, body: Record<string, unknown>): Promise<T> {
  return $api<T>(`/auth${path}`, {
    method: 'POST',
    body,
    unauthenticated: true,
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
