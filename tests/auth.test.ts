// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../app/composables/useAuth'
import { extractErrorMessage } from '../app/utils/api'
import authMiddleware from '../app/middleware/auth'

const { mockApi, cookies, mockNavigateTo, getCookieRef, getStateRef } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ref } = require('vue')
  const cookies: Record<string, { value: unknown }> = {}
  const userStates: Record<string, { value: unknown }> = {}

  const getCookieRef = (name: string): { value: unknown } => {
    const existing = cookies[name]
    if (existing && existing.value !== undefined) {
      return existing
    }
    const newRef = ref(null)
    cookies[name] = newRef
    return newRef
  }

  const getStateRef = (name: string, init?: () => unknown): { value: unknown } => {
    const existing = userStates[name]
    if (existing) {
      return existing
    }
    const newRef = ref(init ? init() : null)
    userStates[name] = newRef
    return newRef
  }

  return {
    mockApi: vi.fn(),
    cookies,
    mockNavigateTo: vi.fn(),
    getCookieRef,
    getStateRef,
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

vi.mock('#app/composables/state', () => ({
  useState: vi.fn(getStateRef),
  clearNuxtState: vi.fn(),
}))

vi.mock('#app', () => ({
  useCookie: vi.fn(getCookieRef),
  useState: vi.fn(getStateRef),
  navigateTo: mockNavigateTo,
  defineNuxtRouteMiddleware: (fn: (...args: unknown[]) => unknown) => fn,
}))

vi.mock('#app/nuxt', () => ({
  useNuxtApp: () => ({
    payload: { state: {} },
    _state: {},
    $router: {
      push: mockNavigateTo,
      replace: mockNavigateTo,
    },
    runWithContext: (fn: () => unknown) => fn(),
  }),
  tryUseNuxtApp: () => ({
    payload: { state: {} },
    _state: {},
    $router: {
      push: mockNavigateTo,
      replace: mockNavigateTo,
    },
    runWithContext: (fn: () => unknown) => fn(),
  }),
  callWithNuxt: (_nuxt: unknown, fn: () => unknown) => fn(),
  useRuntimeConfig: () => ({ app: { baseURL: '/' }, public: { apiBase: 'http://localhost:8000' } }),
  useRequestHeaders: () => ({}),
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
  useState: vi.fn(getStateRef),
  defineNuxtRouteMiddleware: (fn: (...args: unknown[]) => unknown) => fn,
  useRequestHeaders: () => ({}),
}))

describe('Authentication Flow', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    for (const key in cookies) delete cookies[key]
    const userState = getStateRef('auth_user')
    userState.value = null
    const tokenState = getStateRef('authToken')
    tokenState.value = null
    vi.clearAllMocks()
  })

  describe('useAuth Composable', () => {
    it('sets token, user profile, and redirects to dashboard on successful login', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', createdAt: '2026-09-29T12:00:00Z' }
      mockApi.mockResolvedValueOnce({
        user: mockUser,
        accessToken: 'fake-access-token',
      })

      const { login, token, user, isAuthenticated } = useAuth()

      await login({ email: 'test@example.com', password: 'password123' }, true)

      expect(mockApi).toHaveBeenCalledWith('/auth/login/', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'password123', rememberMe: true },
        unauthenticated: true,
      })

      expect(token.value).toBe('fake-access-token')
      expect(user.value).toEqual(mockUser)
      expect(isAuthenticated.value).toBe(true)
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

    it('redirects to /verify-email without setting session tokens when login response indicates unverified user', async () => {
      mockApi.mockResolvedValueOnce({
        user: { id: 'user-unverified', email: 'unverified@example.com', isVerified: false },
        accessToken: 'should-not-be-saved',
      })

      const { login, token, user, isAuthenticated } = useAuth()

      await login({ email: 'unverified@example.com', password: 'password123' }, false)

      expect(token.value).toBeNull()
      expect(user.value).toBeNull()
      expect(isAuthenticated.value).toBe(false)
      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/verify-email',
        query: { email: 'unverified@example.com', unverified: 'true' },
      })
    })

    it('clears session state and redirects to /verify-email when login error payload indicates unverified email', async () => {
      mockApi.mockRejectedValueOnce({
        status: 400,
        data: { code: 'EMAIL_NOT_VERIFIED', detail: 'Email address is not verified.' },
      })

      const { login, token, user, isAuthenticated } = useAuth()

      try {
        await login({ email: 'unverified@example.com', password: 'password123' }, false)
      }
      catch {
        // expected rethrow
      }

      expect(token.value).toBeNull()
      expect(user.value).toBeNull()
      expect(isAuthenticated.value).toBe(false)
      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/verify-email',
        query: { email: 'unverified@example.com', unverified: 'true' },
      })
    })

    it('posts to /auth/register/ with agreeToTerms and redirects to verify-email on registration', async () => {
      const mockUser = { id: 'user-2', email: 'newuser@example.com', createdAt: '2026-09-29T12:00:00Z' }
      mockApi.mockResolvedValueOnce({
        user: mockUser,
        accessToken: 'fake-register-access',
      })

      const { register, token, user, isAuthenticated } = useAuth()

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
          agreeToTerms: true,
        },
        unauthenticated: true,
      })

      expect(token.value).toBe('fake-register-access')
      expect(user.value).toEqual(mockUser)
      expect(isAuthenticated.value).toBe(true)
      expect(mockNavigateTo).toHaveBeenCalledWith({
        path: '/verify-email',
        query: { email: 'newuser@example.com' },
      })
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

    it('posts to /auth/verify-email/ and sets session tokens in verifyEmail', async () => {
      const mockUser = { id: 'user-3', email: 'verified@example.com' }
      mockApi.mockResolvedValueOnce({
        user: mockUser,
        accessToken: 'fake-verify-access',
      })

      const { verifyEmail, token, user, isAuthenticated } = useAuth()

      const response = await verifyEmail({
        email: 'verified@example.com',
        code: '123456',
      })

      expect(mockApi).toHaveBeenCalledWith('/auth/verify-email/', {
        method: 'POST',
        body: { email: 'verified@example.com', code: '123456' },
        unauthenticated: true,
      })

      expect(response.accessToken).toBe('fake-verify-access')
      expect(token.value).toBe('fake-verify-access')
      expect(user.value).toEqual(mockUser)
      expect(isAuthenticated.value).toBe(true)
    })

    it('sets error message on failed verifyEmail response', async () => {
      mockApi.mockRejectedValueOnce({
        data: { message: 'Invalid or expired verification code.' },
      })

      const { verifyEmail, error } = useAuth()

      try {
        await verifyEmail({
          email: 'verified@example.com',
          code: '000000',
        })
      }
      catch {
        // error is rethrown
      }

      expect(error.value).toBe('Invalid or expired verification code.')
    })

    it('fetches authenticated user profile via /auth/me/', async () => {
      cookies['accessToken'] = { value: 'fake-access-token' }
      const mockProfile = { id: 'user-1', email: 'test@example.com', createdAt: '2026-09-29T12:00:00Z' }
      mockApi.mockResolvedValueOnce(mockProfile)

      const { fetchUser, user } = useAuth()

      const result = await fetchUser()

      expect(mockApi).toHaveBeenCalledWith('/auth/me/')
      expect(result).toEqual(mockProfile)
      expect(user.value).toEqual(mockProfile)
    })

    it('clears authentication tokens and user state on logout', async () => {
      cookies['accessToken'] = { value: 'fake-access-token' }

      const { logout, token, user, isAuthenticated } = useAuth()
      user.value = { id: 'user-1', email: 'test@example.com' }

      await logout()

      expect(token.value).toBeNull()
      expect(user.value).toBeNull()
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
      cookies['accessToken'] = { value: null }

      await authMiddleware({} as never, {} as never)

      expect(mockNavigateTo).toHaveBeenCalledWith('/login')
    })

    it('allows navigation if token exists and hydrates user', async () => {
      cookies['accessToken'] = { value: 'valid-token' }
      mockApi.mockResolvedValueOnce({ id: 'user-1', email: 'test@example.com' })

      const result = await authMiddleware({} as never, {} as never)

      expect(mockNavigateTo).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
