export default defineNuxtRouteMiddleware(async () => {
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
