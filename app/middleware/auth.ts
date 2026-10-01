export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  const { token, user, fetchUser } = useAuth()

  if (!token.value) {
    return navigateTo('/login')
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
