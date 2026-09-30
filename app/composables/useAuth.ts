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

export interface User {
  id: string
  email: string
  createdAt?: string
}

export interface TokenPayload {
  user?: User
  accessToken?: string
}

export const useAuth = () => {
  const token = useCookie<string | null>('accessToken', getAuthCookieOptions())
  const user = useCookie<User | null>('authUser', getAuthCookieOptions())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchUser = async () => {
    if (!token.value) {
      user.value = null
      return null
    }

    try {
      const userData = await $api<User>('/auth/me/')
      user.value = userData
      return userData
    }
    catch (err: unknown) {
      user.value = null
      throw err
    }
  }

  const login = async (credentials: LoginCredentials, rememberMe: boolean = false) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<TokenPayload>('/auth/login/', {
        method: 'POST',
        body: {
          email: credentials.email.trim(),
          password: credentials.password,
          rememberMe,
        },
        unauthenticated: true,
      })

      if (response.accessToken) {
        const tokenCookie = useCookie<string | null>('accessToken', getAuthCookieOptions(rememberMe))
        tokenCookie.value = response.accessToken
        token.value = response.accessToken
      }

      if (response.user) {
        const userCookie = useCookie<User | null>('authUser', getAuthCookieOptions(rememberMe))
        userCookie.value = response.user
        user.value = response.user
      }

      await navigateTo('/dashboard')
      return response
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
      const response = await $api<TokenPayload>('/auth/register/', {
        method: 'POST',
        body: {
          email: payload.email,
          password: payload.password,
          agreeToTerms: payload.agreeToTerms,
        },
        unauthenticated: true,
      })

      if (response.accessToken) {
        token.value = response.accessToken
      }

      if (response.user) {
        user.value = response.user
      }

      if (options.autoNavigate !== false) {
        await navigateTo(token.value ? '/dashboard' : '/login')
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
    try {
      await $api('/auth/logout/', { method: 'POST' })
    }
    catch (e) {
      console.error('Backend logout failed', e)
    }
    finally {
      token.value = null
      user.value = null
      await navigateTo('/login')
    }
  }

  return {
    token,
    user,
    fetchUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: computed(() => Boolean(token.value)),
  }
}
