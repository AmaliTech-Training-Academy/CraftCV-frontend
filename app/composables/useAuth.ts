import { extractErrorMessage } from '../utils/api'

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
        unauthenticated: true,
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
      error.value = extractErrorMessage(err, 'Invalid email or password.')

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
        unauthenticated: true,
      })

      const res = response as Record<string, unknown> | null | undefined
      const tokensObj = res?.tokens as Record<string, unknown> | undefined
      const accessToken = (typeof res?.access === 'string' ? res.access : undefined)
        || (typeof tokensObj?.access === 'string' ? tokensObj.access : undefined)
        || (typeof res?.token === 'string' ? res.token : undefined)
      const refreshToken = (typeof res?.refresh === 'string' ? res.refresh : undefined)
        || (typeof tokensObj?.refresh === 'string' ? tokensObj.refresh : undefined)
      const hasTokens = Boolean(accessToken && refreshToken)

      if (hasTokens) {
        const authCookie = useCookie('auth_token', {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
        const refreshCookie = useCookie('refresh_token', {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
        authCookie.value = accessToken
        refreshCookie.value = refreshToken
      }

      if (options.autoNavigate !== false) {
        await navigateTo(hasTokens ? '/dashboard' : '/login')
      }
      return response
    }
    catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Registration failed. Please check your details and try again.')

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
