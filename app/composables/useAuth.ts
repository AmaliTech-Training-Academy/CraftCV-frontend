interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials extends LoginCredentials {
  confirmPassword?: string
}

interface AuthResponse {
  access: string
  refresh: string
}

export const useAuth = () => {
  const token = useCookie('auth_token')

  const loading = ref(false)
  const error = ref<string | null>(null)

  const storeAuthTokens = (response: AuthResponse, rememberMe: boolean) => {
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
  }

  const login = async (credentials: LoginCredentials, rememberMe: boolean) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<AuthResponse>('/auth/login/', {
        method: 'POST',
        body: credentials,
      })

      storeAuthTokens(response, rememberMe)
      await navigateTo('/dashboard')

      return response
    }
    catch (err: unknown) {
      const e = err as { data?: { message?: string, detail?: string, error?: string } }
      error.value
        = e?.data?.message
          || e?.data?.detail
          || e?.data?.error
          || 'Invalid email or password.'

      throw err
    }
    finally {
      loading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials, rememberMe: boolean = false) => {
    loading.value = true
    error.value = null

    try {
      const payload = {
        email: credentials.email.trim(),
        password: credentials.password,
      }

      const response = await $api<AuthResponse>('/auth/register/', {
        method: 'POST',
        body: payload,
      })

      storeAuthTokens(response, rememberMe)
      return response
    }
    catch (err: unknown) {
      const e = err as { data?: { message?: string, detail?: string, error?: string, non_field_errors?: string[] } }
      const backendError = e?.data?.message
        || e?.data?.detail
        || e?.data?.error
        || e?.data?.non_field_errors?.[0]
        || 'Registration failed. Please try again.'

      error.value = backendError
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
