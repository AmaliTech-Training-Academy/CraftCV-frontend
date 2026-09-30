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

export interface LoginResponse {
  access?: string
  accessToken?: string
  access_token?: string
  refresh?: string
  refreshToken?: string
  refresh_token?: string
  token?: string
  tokens?: Record<string, unknown>
}

export function extractAuthTokens(res: Record<string, unknown> | null | undefined): {
  accessToken?: string
  refreshToken?: string
} {
  if (!res || typeof res !== 'object') {
    return {}
  }

  const tokensObj = res.tokens as Record<string, unknown> | undefined

  const accessToken = (typeof res.accessToken === 'string' ? res.accessToken : undefined)
    || (typeof res.access_token === 'string' ? res.access_token : undefined)
    || (typeof res.access === 'string' ? res.access : undefined)
    || (typeof res.token === 'string' ? res.token : undefined)
    || (typeof tokensObj?.accessToken === 'string' ? tokensObj.accessToken : undefined)
    || (typeof tokensObj?.access_token === 'string' ? tokensObj.access_token : undefined)
    || (typeof tokensObj?.access === 'string' ? tokensObj.access : undefined)
    || (typeof tokensObj?.token === 'string' ? tokensObj.token : undefined)

  const refreshToken = (typeof res.refreshToken === 'string' ? res.refreshToken : undefined)
    || (typeof res.refresh_token === 'string' ? res.refresh_token : undefined)
    || (typeof res.refresh === 'string' ? res.refresh : undefined)
    || (typeof tokensObj?.refreshToken === 'string' ? tokensObj.refreshToken : undefined)
    || (typeof tokensObj?.refresh_token === 'string' ? tokensObj.refresh_token : undefined)
    || (typeof tokensObj?.refresh === 'string' ? tokensObj.refresh : undefined)

  return { accessToken, refreshToken }
}

export const useAuth = () => {
  const token = useCookie('auth_token')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const login = async (credentials: LoginCredentials, rememberMe: boolean) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<LoginResponse | Record<string, unknown>>('/auth/login/', {
        method: 'POST',
        body: credentials,
        unauthenticated: true,
      })

      const { accessToken, refreshToken } = extractAuthTokens(response as Record<string, unknown>)

      const authCookie = useCookie('auth_token', {
        path: '/',
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })

      const refreshCookie = useCookie('refresh_token', {
        path: '/',
        maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })

      authCookie.value = accessToken || null
      refreshCookie.value = refreshToken || null
      token.value = accessToken || null

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

      const { accessToken, refreshToken } = extractAuthTokens(response as Record<string, unknown>)
      const hasTokens = Boolean(accessToken)

      if (hasTokens) {
        const authCookie = useCookie('auth_token', {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
        authCookie.value = accessToken
        token.value = accessToken

        if (refreshToken) {
          const refreshCookie = useCookie('refresh_token', {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          })
          refreshCookie.value = refreshToken
        }
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
    const refreshCookie = useCookie('refresh_token', { path: '/' })
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
