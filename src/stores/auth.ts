import { computed, ref } from 'vue'

const tokenRef = ref<string | null>(null)

export function useAuth() {
  function login(token: string) {
    tokenRef.value = token
  }

  function logout() {
    tokenRef.value = null
  }

  const token = computed(() => tokenRef.value)
  const isLoggedIn = computed(() => !!tokenRef.value)

  return {
    token,
    isLoggedIn,
    login,
    logout,
  }
}
