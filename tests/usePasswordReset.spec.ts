// @vitest-environment nuxt
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { usePasswordReset, getApiErrorMessage } from '../app/composables/usePasswordReset'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { mockFetch } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
}))
mockNuxtImport('$fetch', () => mockFetch)

describe('usePasswordReset', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('API calls', () => {
    it('requestReset calls POST /api/auth/forgot-password/ with email', async () => {
      mockFetch.mockResolvedValueOnce({})
      const { requestReset } = usePasswordReset()

      await requestReset('test@example.com')

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/forgot-password/', {
        method: 'POST',
        body: { email: 'test@example.com' },
      })
    })

    it('verifyCode calls POST /api/auth/verify-code/ with email and code', async () => {
      mockFetch.mockResolvedValueOnce({})
      const { verifyCode } = usePasswordReset()

      await verifyCode('test@example.com', '123456')

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/verify-code/', {
        method: 'POST',
        body: { email: 'test@example.com', code: '123456' },
      })
    })

    it('resetPassword calls POST /api/auth/reset-password/ with email, code, and newPassword', async () => {
      mockFetch.mockResolvedValueOnce({})
      const { resetPassword } = usePasswordReset()

      await resetPassword('test@example.com', '123456', 'NewPass123!')

      expect(mockFetch).toHaveBeenCalledWith('/api/auth/reset-password/', {
        method: 'POST',
        body: { email: 'test@example.com', code: '123456', newPassword: 'NewPass123!' },
      })
    })
  })

  describe('getApiErrorMessage helper', () => {
    it('returns detail string if provided in error data', () => {
      const error = { data: { detail: 'Specific error message' } }
      expect(getApiErrorMessage(error)).toBe('Specific error message')
    })

    it('joins array field errors if no detail string is provided', () => {
      const error = {
        data: {
          email: ['Invalid email'],
          password: ['Too short', 'Needs a number'],
        },
      }
      expect(getApiErrorMessage(error)).toBe('Invalid email Too short Needs a number')
    })

    it('returns fallback message for missing or invalid error data', () => {
      expect(getApiErrorMessage(null)).toBe('Something went wrong. Please try again.')
      expect(getApiErrorMessage(undefined)).toBe('Something went wrong. Please try again.')
      expect(getApiErrorMessage('string error')).toBe('Something went wrong. Please try again.')
      expect(getApiErrorMessage({ data: {} })).toBe('Something went wrong. Please try again.')
    })

    it('uses custom fallback message if provided', () => {
      expect(getApiErrorMessage(null, 'Custom fallback')).toBe('Custom fallback')
    })
  })
})
