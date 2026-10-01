import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { CookieOptions } from '#app'

export interface ApiFetchOptions<R extends NitroFetchRequest> extends NitroFetchOptions<R> {
  unauthenticated?: boolean
}

export const getAuthCookieOptions = <T = unknown>(rememberMe?: boolean): CookieOptions<T> & { readonly?: false } => {
  const options: CookieOptions<T> & { readonly?: false } = {
    sameSite: 'lax',
    secure: false,
  }
  if (rememberMe !== undefined) {
    options.maxAge = rememberMe ? 60 * 60 * 24 * 30 : undefined
  }
  return options
}

export function extractErrorMessage(
  err: unknown,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.',
): string {
  if (!err || typeof err !== 'object') {
    return fallbackMessage
  }

  const e = err as {
    data?: unknown
    status?: number
    statusCode?: number
    response?: { status?: number, statusCode?: number, _data?: unknown, data?: unknown }
  }

  const status = e.statusCode ?? e.status ?? e.response?.status ?? e.response?.statusCode
  const responseData = e.data ?? e.response?._data ?? e.response?.data

  // 1. Connection / Network failure (no status code and no response data)
  if (!status && !responseData) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }

  // 2. Server Errors (5xx)
  if (typeof status === 'number' && status >= 500 && status < 600) {
    return 'Something went wrong on our side. Please try again later.'
  }

  // 3. Non-JSON / HTML / Primitive Response Fallback
  if (!responseData || typeof responseData !== 'object') {
    return fallbackMessage
  }

  // 4. Structured 4xx DRF Validation Responses
  if ('detail' in responseData && typeof (responseData as { detail: unknown }).detail === 'string') {
    return (responseData as { detail: string }).detail
  }

  if ('message' in responseData && typeof (responseData as { message: unknown }).message === 'string') {
    return (responseData as { message: string }).message
  }

  if ('error' in responseData && typeof (responseData as { error: unknown }).error === 'string') {
    return (responseData as { error: string }).error
  }

  const messages: string[] = []
  for (const value of Object.values(responseData)) {
    if (Array.isArray(value)) {
      messages.push(...value.filter((msg): msg is string => typeof msg === 'string'))
    }
    else if (typeof value === 'string') {
      messages.push(value)
    }
  }

  if (messages.length > 0) {
    return messages.join(' ')
  }

  return fallbackMessage
}

export const $api = async <T>(
  request: NitroFetchRequest,
  options?: ApiFetchOptions<NitroFetchRequest>,
): Promise<T> => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  const authToken = useCookie<string | null>('accessToken', getAuthCookieOptions())

  const headers = new Headers(options?.headers)
  const isUnauthenticated = Boolean(options?.unauthenticated)

  if (!isUnauthenticated && authToken.value) {
    headers.set('Authorization', `Bearer ${authToken.value}`)
  }

  // In SSR context, forward incoming cookies so server-side requests include auth cookies
  if (import.meta.server) {
    const reqHeaders = useRequestHeaders(['cookie'])
    if (reqHeaders.cookie && !headers.has('cookie')) {
      headers.set('cookie', reqHeaders.cookie)
    }
  }

  const customOptions: NitroFetchOptions<NitroFetchRequest> = {
    credentials: 'include',
    ...options,
    baseURL,
    headers,
  }
  delete (customOptions as Record<string, unknown>).unauthenticated

  try {
    return await $fetch<T>(request, customOptions)
  }
  catch (error: unknown) {
    const httpError = error as { response?: { status: number } }
    if (!isUnauthenticated && httpError.response?.status === 401) {
      try {
        const refreshData = await $fetch<{ accessToken?: string, access?: string, token?: string }>('/auth/refresh/', {
          baseURL,
          method: 'POST',
          credentials: 'include',
        })

        const newAccessToken = refreshData.accessToken || refreshData.access || refreshData.token
        if (!newAccessToken) {
          throw new Error('No access token returned from refresh', { cause: error })
        }

        authToken.value = newAccessToken

        headers.set('Authorization', `Bearer ${newAccessToken}`)
        customOptions.headers = headers

        return await $fetch<T>(request, customOptions)
      }
      catch (refreshError) {
        authToken.value = null

        await navigateTo('/login')

        throw refreshError
      }
    }

    throw error
  }
}
