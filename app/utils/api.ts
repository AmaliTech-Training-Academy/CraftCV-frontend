import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

export interface ApiFetchOptions<R extends NitroFetchRequest> extends NitroFetchOptions<R> {
  unauthenticated?: boolean
}

export function extractErrorMessage(
  err: unknown,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.',
): string {
  if (!err || typeof err !== 'object') {
    return fallbackMessage
  }

  const e = err as { data?: unknown, response?: { _data?: unknown, data?: unknown } }
  const responseData = e.data ?? e.response?._data ?? e.response?.data

  // If there's no data or it's not an object (e.g. raw string, HTML page, primitive), use fallback
  if (!responseData || typeof responseData !== 'object') {
    return fallbackMessage
  }

  // 1. Direct string keys: detail or message
  if ('detail' in responseData && typeof (responseData as { detail: unknown }).detail === 'string') {
    return (responseData as { detail: string }).detail
  }

  if ('message' in responseData && typeof (responseData as { message: unknown }).message === 'string') {
    return (responseData as { message: string }).message
  }

  // 2. Field error objects: { email: ['...'], password: ['at least 8 characters'] }
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

  const authToken = useCookie('auth_token')
  const refreshToken = useCookie('refresh_token')

  const headers = new Headers(options?.headers)
  const isUnauthenticated = Boolean(options?.unauthenticated)

  if (!isUnauthenticated && authToken.value) {
    headers.set('Authorization', `Bearer ${authToken.value}`)
  }

  const customOptions: NitroFetchOptions<NitroFetchRequest> = {
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
      if (!refreshToken.value) {
        authToken.value = null
        refreshToken.value = null
        await navigateTo('/login')
        throw error
      }

      try {
        const refreshData = await $fetch<{ access: string }>('/auth/refresh/', {
          baseURL,
          method: 'POST',
          body: {
            refresh: refreshToken.value,
          },
        })

        authToken.value = refreshData.access

        headers.set('Authorization', `Bearer ${refreshData.access}`)
        customOptions.headers = headers

        return await $fetch<T>(request, customOptions)
      }
      catch (refreshError) {
        authToken.value = null
        refreshToken.value = null

        await navigateTo('/login')

        throw refreshError
      }
    }

    throw error
  }
}
