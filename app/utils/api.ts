import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

export interface ApiFetchOptions<R extends NitroFetchRequest> extends NitroFetchOptions<R> {
  unauthenticated?: boolean
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
