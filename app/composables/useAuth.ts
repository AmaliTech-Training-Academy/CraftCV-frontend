interface LoginCredentials {
  email: string
  password: string
}

interface RegisterPayload {
  email: string
  password: string
  agreeToTerms: boolean
}

interface LoginResponse {
  access: string
  refresh: string
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

  const register = async (payload: RegisterPayload) => {
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

      await navigateTo('/dashboard')
      return response
    }
    catch (err: unknown) {
      const e = err as { data?: { message?: string, detail?: string, error?: string, email?: string[], password?: string[] } }
      error.value
        = e?.data?.message
          || e?.data?.detail
          || e?.data?.error
          || e?.data?.email?.[0]
          || e?.data?.password?.[0]
          || 'Registration failed. Please try again.'

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
