import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

export const $api = async <T>(
  request: NitroFetchRequest,
  options?: NitroFetchOptions<NitroFetchRequest>,
): Promise<T> => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  const authToken = useCookie('auth_token')
  const refreshToken = useCookie('refresh_token')

  const headers = new Headers(options?.headers)

  if (authToken.value) {
    headers.set('Authorization', `Bearer ${authToken.value}`)
  }

  const customOptions: NitroFetchOptions<NitroFetchRequest> = {
    ...options,
    baseURL,
    headers,
  }

  try {
    return await $fetch<T>(request, customOptions)
  }
  catch (error: unknown) {
    const httpError = error as { response?: { status: number } }
    if (httpError.response?.status === 401) {
      if (!refreshToken.value) {
        authToken.value = null
        refreshToken.value = null
        await navigateTo('/auth/login')
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

        await navigateTo('/auth/login')

        throw refreshError
      }
    }

    throw error
  }
}
