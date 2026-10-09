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

export interface VerifyEmailPayload {
  email: string
  code: string
}

export interface User {
  id: string
  email: string
  createdAt?: string
  isVerified?: boolean
  emailVerified?: boolean
}

export interface TokenPayload {
  user?: User
  accessToken?: string
  access?: string
  token?: string
  requiresVerification?: boolean
  code?: string
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

      const isUserUnverified = response.user?.isVerified === false
        || response.user?.emailVerified === false
        || response.requiresVerification === true
        || response.code === 'EMAIL_NOT_VERIFIED'

      if (isUserUnverified) {
        token.value = null
        user.value = null
        const tokenCookie = useCookie<string | null>('accessToken', getAuthCookieOptions())
        tokenCookie.value = null
        const userCookie = useCookie<User | null>('authUser', getAuthCookieOptions())
        userCookie.value = null

        await navigateTo({
          path: '/verify-email',
          query: { email: credentials.email.trim(), unverified: 'true' },
        })
        return response
      }

      const tokenVal = response.accessToken || response.access || response.token
      if (tokenVal) {
        const tokenCookie = useCookie<string | null>('accessToken', getAuthCookieOptions(rememberMe))
        tokenCookie.value = tokenVal
        token.value = tokenVal
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
      const errData = (err as { data?: Record<string, unknown> })?.data
      const detailStr = typeof errData?.detail === 'string' ? errData.detail : ''
      const messageStr = typeof errData?.message === 'string' ? errData.message : ''
      const errorStr = typeof errData?.error === 'string' ? errData.error : ''

      const isUnverifiedErr = errData?.code === 'EMAIL_NOT_VERIFIED'
        || errData?.code === 'UNVERIFIED_EMAIL'
        || errData?.requiresVerification === true
        || detailStr.toLowerCase().includes('not verified')
        || detailStr.toLowerCase().includes('unverified')
        || messageStr.toLowerCase().includes('not verified')
        || messageStr.toLowerCase().includes('unverified')
        || errorStr.toLowerCase().includes('not verified')
        || errorStr.toLowerCase().includes('unverified')

      if (isUnverifiedErr) {
        token.value = null
        user.value = null
        const tokenCookie = useCookie<string | null>('accessToken', getAuthCookieOptions())
        tokenCookie.value = null
        const userCookie = useCookie<User | null>('authUser', getAuthCookieOptions())
        userCookie.value = null

        await navigateTo({
          path: '/verify-email',
          query: { email: credentials.email.trim(), unverified: 'true' },
        })
      }

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

      const tokenVal = response.accessToken || response.access || response.token
      if (tokenVal) {
        const tokenCookie = useCookie<string | null>('accessToken', getAuthCookieOptions())
        tokenCookie.value = tokenVal
        token.value = tokenVal
      }

      if (response.user) {
        const userCookie = useCookie<User | null>('authUser', getAuthCookieOptions())
        userCookie.value = response.user
        user.value = response.user
      }

      if (options.autoNavigate !== false) {
        await navigateTo({
          path: '/verify-email',
          query: { email: payload.email },
        })
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

  const verifyEmail = async (payload: VerifyEmailPayload) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api<TokenPayload>('/auth/verify-email/', {
        method: 'POST',
        body: {
          email: payload.email,
          code: payload.code,
        },
        unauthenticated: true,
      })

      const tokenVal = response.accessToken || response.access || response.token
      if (tokenVal) {
        const tokenCookie = useCookie<string | null>('accessToken', getAuthCookieOptions())
        tokenCookie.value = tokenVal
        token.value = tokenVal
      }

      if (response.user) {
        const userCookie = useCookie<User | null>('authUser', getAuthCookieOptions())
        userCookie.value = response.user
        user.value = response.user
      }

      return response
    }
    catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Invalid or expired verification code.')
      throw err
    }
    finally {
      loading.value = false
    }
  }

  const resendVerification = async (email: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $api('/auth/resend-verification/', {
        method: 'POST',
        body: { email },
        unauthenticated: true,
      })
      return response
    }
    catch (err: unknown) {
      error.value = extractErrorMessage(err, 'Failed to resend verification code.')
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
    catch {
      // Ignore backend errors to guarantee client-side cleanup and redirect
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
    verifyEmail,
    resendVerification,
    logout,
    isAuthenticated: computed(() => Boolean(token.value)),
  }
}
