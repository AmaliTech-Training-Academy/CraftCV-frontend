// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../app/composables/useAuth'
import { extractErrorMessage } from '../app/utils/api'
import authMiddleware from '../app/middleware/auth'

const { mockApi, cookies, mockNavigateTo, getCookieRef } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ref } = require('vue')
  const cookies: Record<string, { value: unknown }> = {}

  const getCookieRef = (name: string) => {
    if (!cookies[name] || cookies[name].value === undefined) {
      cookies[name] = ref(null)
    }
    return cookies[name]
  }

  return {
    mockApi: vi.fn(),
    cookies,
    mockNavigateTo: vi.fn(),
    getCookieRef,
  }
})

vi.mock('#app/composables/router', () => ({
  navigateTo: mockNavigateTo,
  defineNuxtRouteMiddleware: (fn: (...args: unknown[]) => unknown) => fn,
  abortNavigation: vi.fn(),
}))

vi.mock('#app/composables/cookie', () => ({
  useCookie: vi.fn(getCookieRef),
  refreshCookie: vi.fn(),
}))

vi.mock('#app', () => ({
  useCookie: vi.fn(getCookieRef),
  navigateTo: mockNavigateTo,
  defineNuxtRouteMiddleware: (fn: (...args: unknown[]) => unknown) => fn,
}))

vi.mock('#app/nuxt', () => ({
  useNuxtApp: () => ({
    $router: {
      push: mockNavigateTo,
      replace: mockNavigateTo,
    },
    runWithContext: (fn: () => unknown) => fn(),
  }),
  tryUseNuxtApp: () => ({
    $router: {
      push: mockNavigateTo,
      replace: mockNavigateTo,
    },
    runWithContext: (fn: () => unknown) => fn(),
  }),
  callWithNuxt: (_nuxt: unknown, fn: () => unknown) => fn(),
  useRuntimeConfig: () => ({ app: { baseURL: '/' } }),
}))

vi.mock('../app/utils/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../app/utils/api')>()
  return {
    ...actual,
    $api: mockApi,
  }
})

vi.mock('#imports', () => ({
  navigateTo: mockNavigateTo,
  useCookie: vi.fn(getCookieRef),
  defineNuxtRouteMiddleware: (fn: (...args: unknown[]) => unknown) => fn,
}))

describe('Authentication Flow', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    for (const key in cookies) delete cookies[key]
    vi.clearAllMocks()
  })

  describe('useAuth Composable', () => {
    it('sets token and redirects to dashboard on successful login', async () => {
      mockApi.mockResolvedValueOnce({
        access: 'fake-access-token',
        refresh: 'fake-refresh-token',
      })

      const { login, token, isAuthenticated } = useAuth()

      await login({ email: 'test@example.com', password: 'password123' }, false)

      expect(mockApi).toHaveBeenCalledWith('/auth/login/', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123' },
        unauthenticated: true,
      })

      expect(token.value).toBe('fake-access-token')
      expect(isAuthenticated.value).toBe(true)
      expect(cookies['refresh_token']?.value).toBe('fake-refresh-token')
      expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard')
    })

    it('sets generic error message on failed login response', async () => {
      mockApi.mockRejectedValueOnce({ status: 400, data: {} })

      const { login, error } = useAuth()

      try {
        await login({ email: 'test@example.com', password: 'wrong' }, false)
      }
      catch {
        // error is rethrown by useAuth; we only assert on error.value below
      }

      expect(error.value).toBe('Invalid email or password.')
    })

    it('posts to /auth/register/ with agree_to_terms and redirects to dashboard on registration', async () => {
      mockApi.mockResolvedValueOnce({
        access: 'fake-register-access',
        refresh: 'fake-register-refresh',
      })

      const { register, token, isAuthenticated } = useAuth()

      await register({
        email: 'newuser@example.com',
        password: 'Password123!',
        agreeToTerms: true,
      })

      expect(mockApi).toHaveBeenCalledWith('/auth/register/', {
        method: 'POST',
        body: {
          email: 'newuser@example.com',
          password: 'Password123!',
          agree_to_terms: true,
        },
        unauthenticated: true,
      })

      expect(token.value).toBe('fake-register-access')
      expect(isAuthenticated.value).toBe(true)
      expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard')
    })

    it('supports nested tokens response contract and redirects to dashboard', async () => {
      mockApi.mockResolvedValueOnce({
        tokens: {
          access: 'nested-access-token',
          refresh: 'nested-refresh-token',
        },
      })

      const { register, token, isAuthenticated } = useAuth()

      await register({
        email: 'nested@example.com',
        password: 'Password123!',
        agreeToTerms: true,
      })

      expect(token.value).toBe('nested-access-token')
      expect(cookies['refresh_token']?.value).toBe('nested-refresh-token')
      expect(isAuthenticated.value).toBe(true)
      expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard')
    })

    it('redirects to login when registration response lacks tokens', async () => {
      mockApi.mockResolvedValueOnce({
        message: 'Account created. Please sign in.',
      })

      const { register, token, isAuthenticated } = useAuth()

      await register({
        email: 'notokens@example.com',
        password: 'Password123!',
        agreeToTerms: true,
      })

      expect(token.value).toBeFalsy()
      expect(isAuthenticated.value).toBe(false)
      expect(mockNavigateTo).toHaveBeenCalledWith('/login')
    })

    it('sets error message on failed registration response with field errors', async () => {
      mockApi.mockRejectedValueOnce({
        data: { email: ['A user with that email already exists.'] },
      })

      const { register, error } = useAuth()

      try {
        await register({
          email: 'existing@example.com',
          password: 'Password123!',
          agreeToTerms: true,
        })
      }
      catch {
        // error is rethrown
      }

      expect(error.value).toBe('A user with that email already exists.')
    })

    it('clears authentication tokens on logout', async () => {
      cookies['auth_token'] = { value: 'fake-access-token' }
      cookies['refresh_token'] = { value: 'fake-refresh-token' }

      const { logout, token, isAuthenticated } = useAuth()

      await logout()

      expect(token.value).toBeNull()
      expect(cookies['refresh_token']?.value).toBeNull()
      expect(isAuthenticated.value).toBe(false)
      expect(mockNavigateTo).toHaveBeenCalledWith('/login')
    })
  })

  describe('extractErrorMessage', () => {
    it('returns unexpected error fallback when response data is raw HTML without 5xx code or 404 with HTML body', () => {
      const htmlBody = '<!DOCTYPE html><html><body>404 Not Found</body></html>'
      expect(extractErrorMessage({ statusCode: 404, data: htmlBody })).toBe(
        'An unexpected error occurred. Please try again.',
      )
      expect(extractErrorMessage({ data: htmlBody })).toBe(
        'An unexpected error occurred. Please try again.',
      )
    })

    it('returns unexpected error fallback when err is not an object', () => {
      expect(extractErrorMessage(null)).toBe(
        'An unexpected error occurred. Please try again.',
      )
      expect(extractErrorMessage('string error')).toBe(
        'An unexpected error occurred. Please try again.',
      )
    })

    it('returns connection error message when no status code or response data exists', () => {
      expect(extractErrorMessage({})).toBe(
        'Unable to connect to the server. Please check your internet connection and try again.',
      )
      const fetchErr = new Error('FetchError: Failed to fetch http://api.craftcv.com/auth/register')
      expect(extractErrorMessage(fetchErr)).toBe(
        'Unable to connect to the server. Please check your internet connection and try again.',
      )
    })

    it('returns server error message for 5xx responses', () => {
      expect(
        extractErrorMessage({ statusCode: 502, data: '<!DOCTYPE html><html><body>502 Bad Gateway</body></html>' }),
      ).toBe('Something went wrong on our side. Please try again later.')

      expect(
        extractErrorMessage({ response: { status: 500, _data: { detail: 'Traceback…' } } }),
      ).toBe('Something went wrong on our side. Please try again later.')
    })

    it('returns connection error message when err is a network/fetch failure', () => {
      const fetchErr = new Error('FetchError: Failed to fetch http://api.craftcv.com/auth/register')
      expect(extractErrorMessage(fetchErr)).toBe(
        'Unable to connect to the server. Please check your internet connection and try again.',
      )
    })

    it('returns detail, message, or error string when present in 4xx DRF payload', () => {
      expect(extractErrorMessage({ data: { detail: 'Custom error detail.' } })).toBe(
        'Custom error detail.',
      )
      expect(extractErrorMessage({ data: { message: 'Invalid credentials.' } })).toBe(
        'Invalid credentials.',
      )
      expect(extractErrorMessage({ data: { error: 'Account suspended.' } })).toBe(
        'Account suspended.',
      )
    })

    it('aggregates multiple field errors when valid DRF validation objects are provided', () => {
      expect(
        extractErrorMessage({
          data: { email: ['Email already exists.'], password: ['Password too short.'] },
        }),
      ).toBe('Email already exists. Password too short.')
    })
  })

  describe('Route Middleware (Protected Route Behavior)', () => {
    it('redirects to login if unauthenticated', async () => {
      cookies['auth_token'] = { value: null }

      await authMiddleware({} as never, {} as never)

      expect(mockNavigateTo).toHaveBeenCalledWith('/login')
    })

    it('allows navigation if authenticated', async () => {
      cookies['auth_token'] = { value: 'valid-token' }

      const result = await authMiddleware({} as never, {} as never)

      expect(mockNavigateTo).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
