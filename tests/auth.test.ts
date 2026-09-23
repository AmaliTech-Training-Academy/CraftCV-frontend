// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '../app/composables/useAuth'
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

vi.mock('../app/utils/api', () => ({
  $api: mockApi,
}))

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
      })

      expect(token.value).toBe('fake-access-token')
      expect(isAuthenticated.value).toBe(true)
      expect(cookies['refresh_token']?.value).toBe('fake-refresh-token')
      expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard')
    })

    it('sets generic error message on failed login response', async () => {
      mockApi.mockRejectedValueOnce(new Error('Network error'))

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
      })

      expect(token.value).toBe('fake-register-access')
      expect(isAuthenticated.value).toBe(true)
      expect(mockNavigateTo).toHaveBeenCalledWith('/dashboard')
    })

    it('sets error message on failed registration response', async () => {
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
