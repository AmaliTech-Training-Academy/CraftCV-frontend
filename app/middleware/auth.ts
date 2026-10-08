export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const { token, user, fetchUser, refreshToken } = useAuth()

  if (!token.value) {
    try {
      await refreshToken()
    }
    catch {
      return navigateTo('/login')
    }
  }

  if (!user.value) {
    try {
      await fetchUser()
    }
    catch {
      return navigateTo('/login')
    }
  }
})
