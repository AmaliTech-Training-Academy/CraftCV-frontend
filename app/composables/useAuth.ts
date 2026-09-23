import { ref } from 'vue'

// Temporary mock for authentication state
export const useAuth = () => {
  // Toggle this to test the conditional account icon rendering
  const isLoggedIn = ref(true)

  return {
    isLoggedIn,
  }
}
