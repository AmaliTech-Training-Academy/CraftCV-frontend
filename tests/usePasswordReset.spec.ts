// @vitest-environment nuxt
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { usePasswordReset } from '../app/composables/usePasswordReset'
import { extractErrorMessage } from '../app/utils/api'

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

describe('usePasswordReset', () => {
  beforeEach(() => {
    mockApi.mockReset()
  })

  describe('API calls', () => {
    it('requestReset calls POST /auth/forgot-password/ with email via $api', async () => {
      mockApi.mockResolvedValueOnce({})
      const { requestReset } = usePasswordReset()

      await requestReset('test@example.com')

      expect(mockApi).toHaveBeenCalledWith('/auth/forgot-password/', {
        method: 'POST',
        body: { email: 'test@example.com' },
        unauthenticated: true,
      })
    })

    it('verifyCode calls POST /auth/verify-code/ with email and code via $api', async () => {
      mockApi.mockResolvedValueOnce({})
      const { verifyCode } = usePasswordReset()

      await verifyCode('test@example.com', '123456')

      expect(mockApi).toHaveBeenCalledWith('/auth/verify-code/', {
        method: 'POST',
        body: { email: 'test@example.com', code: '123456' },
        unauthenticated: true,
      })
    })

    it('resetPassword calls POST /auth/reset-password/ with email, code, and newPassword via $api', async () => {
      mockApi.mockResolvedValueOnce({})
      const { resetPassword } = usePasswordReset()

      await resetPassword('test@example.com', '123456', 'NewPass123!')

      expect(mockApi).toHaveBeenCalledWith('/auth/reset-password/', {
        method: 'POST',
        body: { email: 'test@example.com', code: '123456', newPassword: 'NewPass123!' },
        unauthenticated: true,
      })
    })
  })

  describe('extractErrorMessage helper', () => {
    it('returns detail string if provided in error data', () => {
      const error = { data: { detail: 'Specific error message' } }
      expect(extractErrorMessage(error)).toBe('Specific error message')
    })

    it('joins array field errors if no detail string is provided', () => {
      const error = {
        data: {
          email: ['Invalid email'],
          password: ['Too short', 'Needs a number'],
        },
      }
      expect(extractErrorMessage(error)).toBe('Invalid email Too short Needs a number')
    })

    it('returns fallback message for missing or invalid error data', () => {
      expect(extractErrorMessage(null, 'Custom fallback')).toBe('Custom fallback')
    })
  })
})
