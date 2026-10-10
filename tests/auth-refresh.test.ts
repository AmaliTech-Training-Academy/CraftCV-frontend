// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { $api, requestTokenRefresh } from '../app/utils/api'
import authMiddleware from '../app/middleware/auth'

interface HttpError extends Error {
  status: number
  statusCode: number
  response: {
    status: number
    statusCode: number
    data?: unknown
  }
  data?: unknown
}

function createHttpError(status: number, message = 'Error', data: unknown = {}): HttpError {
  const err = new Error(message)
  return Object.assign(err, {
    status,
    statusCode: status,
    data,
    response: {
      status,
      statusCode: status,
      data,
    },
  })
}

const {
  mockNavigateTo,
  tokenRef,
  userRef,
  mockFetch,
} = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ref } = require('vue') as typeof import('vue')
  return {
    mockNavigateTo: vi.fn(),
    tokenRef: ref<string | null>(null),
    userRef: ref<unknown>(null),
    mockFetch: vi.fn(),
  }
})

// Intercept 'ofetch' package so Vite directs all $fetch imports to mockFetch
vi.mock('ofetch', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ofetch')>()
  const fetchMock = Object.assign(
    vi.fn((...args: unknown[]) => mockFetch(...args)),
    {
      create: () => fetchMock,
      raw: vi.fn((...args: unknown[]) => mockFetch(...args)),
      native: vi.fn((...args: unknown[]) => mockFetch(...args)),
    },
  )
  return {
    ...actual,
    $fetch: fetchMock,
    ofetch: fetchMock,
    createFetch: () => fetchMock,
  }
})

// Set global and window fetch
globalThis.$fetch = mockFetch as never
globalThis.fetch = mockFetch as never
if (typeof window !== 'undefined') {
  window.fetch = mockFetch as never
}

vi.mock('#app/composables/router', () => ({
  navigateTo: mockNavigateTo,
  defineNuxtRouteMiddleware: (fn: (...args: unknown[]) => unknown) => fn,
  abortNavigation: vi.fn(),
}))

vi.mock('#app/composables/cookie', () => ({
  useCookie: (name: string) => {
    if (name === 'accessToken') return tokenRef
    if (name === 'authUser') return userRef
    return ref(null)
  },
  refreshCookie: vi.fn(),
}))

vi.mock('#app/composables/state', () => ({
  useState: (_name: string, init?: () => unknown) => ref(init ? init() : null),
  clearNuxtState: vi.fn(),
}))

vi.mock('#app', () => ({
  useCookie: (name: string) => {
    if (name === 'accessToken') return tokenRef
    if (name === 'authUser') return userRef
    return ref(null)
  },
  useState: (_name: string, init?: () => unknown) => ref(init ? init() : null),
  navigateTo: mockNavigateTo,
  defineNuxtRouteMiddleware: (fn: (...args: unknown[]) => unknown) => fn,
  $fetch: mockFetch,
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
  useRuntimeConfig: () => ({ app: { baseURL: '/' }, public: { apiBase: 'http://localhost:8000/api/' } }),
  useRequestHeaders: () => ({}),
}))

vi.mock('#imports', () => ({
  navigateTo: mockNavigateTo,
  useCookie: (name: string) => {
    if (name === 'accessToken') return tokenRef
    if (name === 'authUser') return userRef
    return ref(null)
  },
  useState: (_name: string, init?: () => unknown) => ref(init ? init() : null),
  defineNuxtRouteMiddleware: (fn: (...args: unknown[]) => unknown) => fn,
  useRequestHeaders: () => ({}),
  $fetch: mockFetch,
}))

function getAuthHeader(opts?: { headers?: Headers | Record<string, string> }): string | null {
  if (!opts?.headers) return null
  if (typeof (opts.headers as Headers).get === 'function') {
    return (opts.headers as Headers).get('Authorization')
  }
  return (opts.headers as Record<string, string>)['Authorization'] ?? null
}

describe('Token Refresh and Retry Logic', () => {
  beforeEach(() => {
    tokenRef.value = null
    userRef.value = null
    mockNavigateTo.mockReset()
    mockFetch.mockReset()
    vi.clearAllMocks()
  })

  describe('requestTokenRefresh Helper', () => {
    it('returns new accessToken and supports camelCase accessToken or access_token', async () => {
      mockFetch.mockResolvedValueOnce({ accessToken: 'new-token-123' })

      const token = await requestTokenRefresh('http://localhost:8000/api/')
      expect(token).toBe('new-token-123')
      expect(mockFetch).toHaveBeenCalledWith('/auth/refresh/', expect.objectContaining({
        baseURL: 'http://localhost:8000/api/',
        method: 'POST',
        credentials: 'include',
      }))
    })

    it('falls back to access_token if accessToken is not present', async () => {
      mockFetch.mockResolvedValueOnce({ access_token: 'fallback-token-456' })

      const token = await requestTokenRefresh('http://localhost:8000/api/')
      expect(token).toBe('fallback-token-456')
    })

    it('throws error when refresh endpoint returns an empty payload', async () => {
      mockFetch.mockResolvedValueOnce({})

      await expect(requestTokenRefresh('http://localhost:8000/api/')).rejects.toThrow(
        'The refresh endpoint did not return an access token.',
      )
    })
  })

  describe('Concurrent 401s Deduplication ($api)', () => {
    it('shares a single in-flight refresh request when multiple concurrent calls receive 401', async () => {
      tokenRef.value = 'expired-token'

      let refreshCallCount = 0
      let resolveRefresh: (value: unknown) => void
      const refreshGate = new Promise((resolve) => {
        resolveRefresh = resolve
      })

      mockFetch.mockImplementation(async (url: string, opts?: { headers?: Headers }) => {
        if (url.includes('/auth/refresh')) {
          refreshCallCount++
          await refreshGate
          return { accessToken: 'shared-refreshed-token' }
        }

        const auth = getAuthHeader(opts)
        if (auth === 'JWT shared-refreshed-token') {
          return { endpoint: url, ok: true }
        }

        throw createHttpError(401, 'Unauthorized')
      })

      const req1 = $api('/cvs/1/')
      const req2 = $api('/cvs/2/')
      const req3 = $api('/auth/me/')

      // Let all 3 requests start and trigger the shared refresh promise
      await Promise.resolve()
      await Promise.resolve()

      resolveRefresh!({ accessToken: 'shared-refreshed-token' })

      const [res1, res2, res3] = await Promise.all([req1, req2, req3])

      expect(refreshCallCount).toBe(1)
      expect(res1).toEqual({ endpoint: '/cvs/1/', ok: true })
      expect(res2).toEqual({ endpoint: '/cvs/2/', ok: true })
      expect(res3).toEqual({ endpoint: '/auth/me/', ok: true })
      expect(tokenRef.value).toBe('shared-refreshed-token')
    })
  })

  describe('Refresh Error Handling ($api)', () => {
    it('clears the auth token and navigates to /login when refresh returns 401', async () => {
      tokenRef.value = 'expired-token'

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/auth/refresh')) {
          throw createHttpError(401, 'Refresh token expired')
        }

        throw createHttpError(401, 'Unauthorized')
      })

      await expect($api('/cvs/1/')).rejects.toThrow()

      expect(tokenRef.value).toBeNull()
      expect(mockNavigateTo).toHaveBeenCalledWith('/login')
    })

    it('keeps the user logged in and does not navigate to login when refresh fails with 500', async () => {
      tokenRef.value = 'expired-token'

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/auth/refresh')) {
          throw createHttpError(500, 'Internal Server Error')
        }

        throw createHttpError(401, 'Unauthorized')
      })

      await expect($api('/cvs/1/')).rejects.toThrow()

      // Token should NOT be destroyed on server errors
      expect(tokenRef.value).toBe('expired-token')
      expect(mockNavigateTo).not.toHaveBeenCalled()
    })
  })

  describe('Request Retry Using New Token ($api)', () => {
    it('retries the original request with the new access token after a successful refresh', async () => {
      tokenRef.value = 'initial-old-token'
      const authHeadersRecorded: (string | null)[] = []

      mockFetch.mockImplementation(async (url: string, opts?: { headers?: Headers }) => {
        if (url.includes('/auth/refresh')) {
          return { accessToken: 'new-valid-jwt' }
        }

        const authHeader = getAuthHeader(opts)
        authHeadersRecorded.push(authHeader)

        if (authHeader === 'JWT new-valid-jwt') {
          return { data: 'cv-detail-payload' }
        }

        throw createHttpError(401, 'Unauthorized')
      })

      const res = await $api<{ data: string }>('/cvs/1/')

      expect(res).toEqual({ data: 'cv-detail-payload' })
      expect(authHeadersRecorded).toEqual([
        'JWT initial-old-token',
        'JWT new-valid-jwt',
      ])
      expect(tokenRef.value).toBe('new-valid-jwt')
    })
  })

  describe('Logout Guard ($api)', () => {
    it('does not trigger token refresh when /auth/logout/ receives a 401', async () => {
      tokenRef.value = 'expired-token'
      let refreshInvoked = false

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/auth/refresh')) {
          refreshInvoked = true
          return { accessToken: 'should-not-be-called' }
        }

        if (url.includes('/auth/logout')) {
          throw createHttpError(401, 'Unauthorized')
        }

        return {}
      })

      await expect($api('/auth/logout/', { method: 'POST' })).rejects.toThrow()

      expect(refreshInvoked).toBe(false)
    })
  })

  describe('Middleware Token Refresh (Protected Routes)', () => {
    it('attempts to refresh token when token is missing and proceeds if refresh succeeds', async () => {
      tokenRef.value = null
      userRef.value = null

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/auth/refresh')) {
          return { accessToken: 'middleware-token' }
        }
        if (url.includes('/auth/me')) {
          return { id: 'user-1', email: 'test@example.com' }
        }
        return {}
      })

      await authMiddleware({} as never, {} as never)

      expect(tokenRef.value).toBe('middleware-token')
      expect(mockNavigateTo).not.toHaveBeenCalledWith('/login')
    })

    it('redirects to /login when token is missing and refresh fails', async () => {
      tokenRef.value = null
      userRef.value = null

      mockFetch.mockImplementation(async (url: string) => {
        if (url.includes('/auth/refresh')) {
          throw createHttpError(401, 'Unauthorized')
        }
        return {}
      })

      await authMiddleware({} as never, {} as never)

      expect(mockNavigateTo).toHaveBeenCalledWith('/login')
    })
  })
})
