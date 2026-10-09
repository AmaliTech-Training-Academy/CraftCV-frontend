import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { CookieOptions } from '#app'

export interface ApiFetchOptions<R extends NitroFetchRequest>
  extends NitroFetchOptions<R> {
  unauthenticated?: boolean
}

export const getAuthCookieOptions = <T = unknown>(rememberMe?: boolean): CookieOptions<T> & { readonly?: false } => {
  const options: CookieOptions<T> & { readonly?: false } = {
    sameSite: 'lax',
    secure: import.meta.client
      ? window.location.protocol === 'https:'
      : false,
  }
  if (rememberMe !== undefined) {
    options.maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined
  }
  return options
}

export function extractErrorMessage(
  err: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.',
): string {
  if (!err || typeof err !== 'object') {
    return fallbackMessage
  }

  const e = err as {
    data?: unknown
    status?: number
    statusCode?: number
    response?: {
      status?: number
      statusCode?: number
      _data?: unknown
      data?: unknown
    }
  }

  const status
    = e.statusCode
      ?? e.status
      ?? e.response?.status
      ?? e.response?.statusCode

  const responseData
    = e.data
      ?? e.response?._data
      ?? e.response?.data

  // Network / connection failure
  if (!status && !responseData) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }

  // Server errors
  if (typeof status === 'number' && status >= 500 && status < 600) {
    return 'Something went wrong on our side. Please try again later.'
  }

  // Non-object response
  if (!responseData || typeof responseData !== 'object') {
    return fallbackMessage
  }

  const data = responseData as Record<string, unknown>

  // Common API error formats
  for (const key of ['detail', 'message', 'error']) {
    if (typeof data[key] === 'string') {
      return data[key]
    }
  }

  // Django REST Framework field validation errors
  const messages: string[] = []

  for (const value of Object.values(data)) {
    if (Array.isArray(value)) {
      messages.push(
        ...value.filter(
          (message): message is string =>
            typeof message === 'string',
        ),
      )
    }
    else if (typeof value === 'string') {
      messages.push(value)
    }
  }

  return messages.length > 0
    ? messages.join(' ')
    : fallbackMessage
}

function getStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  const e = error as {
    status?: number
    statusCode?: number
    response?: {
      status?: number
      statusCode?: number
    }
  }

  return (
    e.response?.status
    ?? e.response?.statusCode
    ?? e.statusCode
    ?? e.status
  )
}

/**
 * Browser-only refresh lock.
 *
 * If multiple authenticated requests receive 401 at the same time,
 * they share one refresh request instead of all calling /auth/refresh/.
 *
 * This is intentionally NOT used during SSR because a module-level
 * promise could be shared between different users.
 */
let refreshPromise: Promise<string> | null = null

export async function requestTokenRefresh(
  baseURL: string,
): Promise<string> {
  const performRefresh = async (): Promise<string> => {
    const refreshHeaders = new Headers()

    // During SSR, forward the incoming browser cookies to Django.
    // This allows Django to read the HttpOnly refreshToken cookie.
    if (import.meta.server) {
      const incomingHeaders = useRequestHeaders(['cookie'])

      if (incomingHeaders.cookie) {
        refreshHeaders.set(
          'cookie',
          incomingHeaders.cookie,
        )
      }
    }

    const response = await $fetch<{
      accessToken?: string
      access_token?: string
      access?: string
      token?: string
    }>('/auth/refresh/', {
      baseURL,
      method: 'POST',
      credentials: 'include',
      headers: refreshHeaders,
    })

    const token = response?.accessToken || response?.access_token || response?.access || response?.token

    if (
      !token
      || typeof token !== 'string'
    ) {
      throw new Error(
        'The refresh endpoint did not return an access token.',
      )
    }

    return token
  }

  // SSR requests must have their own refresh operation.
  if (import.meta.server) {
    return await performRefresh()
  }

  // Browser requests share one refresh operation.
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return await refreshPromise
}

export const $api = async <T>(
  request: NitroFetchRequest,
  options?: ApiFetchOptions<NitroFetchRequest>,
): Promise<T> => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  const authToken = useCookie<string | null>(
    'accessToken',
    getAuthCookieOptions(),
  )

  const isUnauthenticated = Boolean(
    options?.unauthenticated,
  )

  const headers = new Headers(options?.headers)

  // Attach access token to authenticated requests.
  if (!isUnauthenticated && authToken.value) {
    headers.set(
      'Authorization',
      `JWT ${authToken.value}`,
    )
  }

  // During SSR, forward incoming browser cookies.
  if (import.meta.server) {
    const incomingHeaders = useRequestHeaders(['cookie'])

    if (
      incomingHeaders.cookie
      && !headers.has('cookie')
    ) {
      headers.set(
        'cookie',
        incomingHeaders.cookie,
      )
    }
  }

  const customOptions: NitroFetchOptions<NitroFetchRequest> = {
    ...options,
    baseURL,
    credentials: 'include',
    headers,
  }

  // `unauthenticated` is our custom option and must not
  // be passed to $fetch.
  delete (
    customOptions as Record<string, unknown>
  ).unauthenticated

  try {
    // First attempt.
    return await $fetch<T>(
      request,
      customOptions,
    )
  }
  catch (error: unknown) {
    // Public requests or logout requests should never trigger token refresh.
    if (
      isUnauthenticated
      || getStatusCode(error) !== 401
      || String(request).includes('/auth/logout')
    ) {
      throw error
    }

    let newAccessToken: string

    try {
      // Access token has expired.
      // Django uses the HttpOnly refreshToken cookie
      // to issue a new access token.
      newAccessToken = await requestTokenRefresh(
        baseURL,
      )
    }
    catch (refreshError: unknown) {
      /*
       * Django returns 401 when:
       * - refreshToken is missing
       * - refreshToken is invalid
       * - refreshToken is expired
       *
       * Only then should the user be logged out.
       */
      if (getStatusCode(refreshError) === 401) {
        authToken.value = null

        if (import.meta.client) {
          await navigateTo('/login')
        }
      }

      // For network errors, 500s, etc., don't destroy
      // the user's current authentication state.
      throw refreshError
    }

    // Store the new access token.
    authToken.value = newAccessToken

    // Retry the original request exactly once.
    const retryHeaders = new Headers(
      customOptions.headers,
    )

    retryHeaders.set(
      'Authorization',
      `JWT ${newAccessToken}`,
    )

    return await $fetch<T>(
      request,
      {
        ...customOptions,
        headers: retryHeaders,
      },
    )
  }
}
