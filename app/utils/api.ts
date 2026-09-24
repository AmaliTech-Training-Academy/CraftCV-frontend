import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

export interface ApiFetchOptions<R extends NitroFetchRequest> extends NitroFetchOptions<R> {
  unauthenticated?: boolean
}

function isUserSafeErrorMessage(msg: unknown): msg is string {
  if (typeof msg !== 'string') return false
  const trimmed = msg.trim()
  if (!trimmed) return false

  // Reject HTML tags or documents (e.g. <!DOCTYPE, <html>, <head>, <body>, <div>, <p>)
  if (/^<[\s\S]*>/i.test(trimmed) || /<html|<!doctype|<head|<body|<div|<p/i.test(trimmed)) {
    return false
  }

  // Reject HTTP status / proxy error messages or server status lines
  if (
    /^(4\d\d|5\d\d)(\s|$)/i.test(trimmed)
    || /^(not found|bad gateway|internal server error|service unavailable|gateway timeout|cannot (get|post|put|delete|patch))/i.test(trimmed)
  ) {
    return false
  }

  // Reject raw URLs or protocol links (e.g. http://, https://, ftp://)
  if (/(https?:\/\/|ftp:\/\/|:\/\/\w+)/i.test(trimmed)) {
    return false
  }

  // Reject internal stack traces or code error dumps
  if (
    /\b(at\s+[\w$.]+|node_modules|\.ts:\d+|\.js:\d+|\.vue:\d+|Error:|TypeError:|ReferenceError:|SyntaxError:)\b/i.test(trimmed)
    || trimmed.includes('\n at ')
  ) {
    return false
  }

  // Reject excessively long strings (> 300 chars) that are likely dumps
  if (trimmed.length > 300) {
    return false
  }

  return true
}

export function extractErrorMessage(
  err: unknown,
  fallbackMessage: string = 'An unexpected error occurred. Please try again.',
): string {
  const e = err as {
    response?: { status?: number, _data?: unknown }
    statusCode?: number
    status?: number
    data?: unknown
    message?: string
  } | null | undefined

  // Guard against raw URLs or internal error stacks in err.message
  if (e?.message && (/(https?:\/\/|ftp:\/\/|:\/\/\w+)/i.test(e.message) || e.message.includes('\n at '))) {
    return fallbackMessage
  }

  // 1. Network failure / Connection dropped / CORS issues
  if (!e?.response && !e?.data) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }

  const status = e?.statusCode || e?.status || e?.response?.status
  const data = e?.data || e?.response?._data

  // 2. Internal server errors (5xx)
  if (status && status >= 500) {
    return 'System error. Please try again after some time.'
  }

  // 3. User input / Validation errors (4xx)
  if (data) {
    if (typeof data === 'string') {
      if (isUserSafeErrorMessage(data)) return data.trim()
      return fallbackMessage
    }

    if (Array.isArray(data)) {
      const firstValid = data.find(item => isUserSafeErrorMessage(item)) as string | undefined
      if (firstValid) return firstValid.trim()
      return fallbackMessage
    }

    if (typeof data === 'object') {
      const obj = data as Record<string, unknown>

      // DRF detail message or direct message / error strings
      if (isUserSafeErrorMessage(obj.detail)) return obj.detail.trim()
      if (isUserSafeErrorMessage(obj.message)) return obj.message.trim()
      if (isUserSafeErrorMessage(obj.error)) return obj.error.trim()

      // Known error fields from Django REST Framework
      const knownFields = ['email', 'password', 'agree_to_terms', 'agreeTerms', 'non_field_errors']
      const collectedMessages: string[] = []

      for (const field of knownFields) {
        const val = obj[field]
        if (isUserSafeErrorMessage(val)) {
          collectedMessages.push(val.trim())
        }
        else if (Array.isArray(val)) {
          const firstValidStr = val.find(item => isUserSafeErrorMessage(item)) as string | undefined
          if (firstValidStr) collectedMessages.push(firstValidStr.trim())
        }
      }

      if (collectedMessages.length > 0) {
        return collectedMessages.join(' ')
      }
    }
  }

  // 4. Safe fallback for other client-side 4xx or malformed errors
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
