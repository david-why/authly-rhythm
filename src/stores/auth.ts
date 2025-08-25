import { jwtDecode } from 'jwt-decode'
import { computed, reactive, ref } from 'vue'

const TOKEN_STORAGE_KEY = 'authly-token'

const tokenRef = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY))

function login(token: string) {
  tokenRef.value = token
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

function logout() {
  tokenRef.value = null
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

const authObject = reactive({
  token: computed(() => tokenRef.value),
  isLoggedIn: computed(() => !!tokenRef.value),
  username: computed(() => (tokenRef.value ? (jwtDecode(tokenRef.value).aud as string) : null)),
  login,
  logout,
})

export function useAuth() {
  return authObject
}
