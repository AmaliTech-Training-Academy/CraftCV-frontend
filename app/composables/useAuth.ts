interface LoginCredentials {
  email: string
  password: string
}

interface RegisterPayload {
  email: string
  password: string
  agreeToTerms: boolean
}

interface RegisterOptions {
  autoNavigate?: boolean
}

interface LoginResponse {
  access: string
  refresh: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractErrorMessage(err: any): string {
  // 1. Network failure / Connection dropped / CORS issues
  if (!err?.response && !err?.data) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }

  const status = err?.statusCode || err?.status || err?.response?.status
  const data = err?.data || err?.response?._data

  // 2. Internal server errors (5xx)
  if (status >= 500) {
    return 'System error. Please try again after some time.'
  }

  // 3. User input / Validation errors (4xx)
  if (data) {
    // DRF detail message: { "detail": "..." }
    if (typeof data.detail === 'string') {
      return data.detail
    }

    // Specific field errors: { "email": ["..."] } or { "password": ["..."] }
    if (data.email) {
      return Array.isArray(data.email) ? data.email[0] : data.email
    }
    if (data.password) {
      return Array.isArray(data.password) ? data.password[0] : data.password
    }

    // Non-field validation errors: { "non_field_errors": ["..."] }
    if (data.non_field_errors) {
      return Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors
    }
  }

  // 4. Safe fallback for other client-side 4xx errors
  return 'Registration failed. Please check your details and try again.'
}

function parseApiError(data: unknown): string | null {
  if (!data) return null
  if (typeof data === 'string') return data

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.detail === 'string') return obj.detail
    if (typeof obj.error === 'string') return obj.error

    if (Array.isArray(data)) {
      const firstString = data.find(item => typeof item === 'string')
      if (firstString) return firstString
    }

    const flatValues = Object.values(obj).flat()
    const firstString = flatValues.find(item => typeof item === 'string')
    if (firstString) return firstString
  }

  return null
}

export const useAuth = () => {
  const token = useCookie('auth_token')

  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (credentials: LoginCredentials, rememberMe: boolean) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<LoginResponse>('/auth/login/', {
        method: 'POST',
        body: credentials,
      })

      const authCookie = useCookie('auth_token', {
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })

      const refreshCookie = useCookie('refresh_token', {
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })

      authCookie.value = response.access
      refreshCookie.value = response.refresh

      await navigateTo('/dashboard')
    }
    catch (err: unknown) {
      const e = err as { data?: unknown }
      error.value = parseApiError(e?.data) || 'Invalid email or password.'

      throw err
    }
    finally {
      loading.value = false
    }
  }

  const register = async (
    payload: RegisterPayload,
    options: RegisterOptions = { autoNavigate: true },
  ) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<LoginResponse | Record<string, unknown>>('/auth/register/', {
        method: 'POST',
        body: {
          email: payload.email,
          password: payload.password,
          agree_to_terms: payload.agreeToTerms,
        },
      })

      if (response && typeof response === 'object' && 'access' in response && 'refresh' in response) {
        const authCookie = useCookie('auth_token', {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
        const refreshCookie = useCookie('refresh_token', {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
        authCookie.value = (response as LoginResponse).access
        refreshCookie.value = (response as LoginResponse).refresh
      }

      if (options.autoNavigate !== false) {
        await navigateTo('/dashboard')
      }
      return response
    }
    catch (err: unknown) {
      error.value = extractErrorMessage(err)

      throw err
    }
    finally {
      loading.value = false
    }
  }

  const logout = async () => {
    token.value = null
    const refreshCookie = useCookie('refresh_token')
    refreshCookie.value = null
    await navigateTo('/login')
  }

  return {
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: computed(() => !!token.value),
  }
}
