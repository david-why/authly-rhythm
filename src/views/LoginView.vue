<script setup lang="ts">
import { API_BASE_URL } from '@/consts'
import { useAuth } from '@/stores/auth'
import type { AuthChartData } from '@/types'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const auth = useAuth()
const router = useRouter()

let audioBlobUrl: string | null = null
let audio: HTMLAudioElement | null = null
let startTime: number | null = null

const state = ref<'username' | 'signingIn' | 'loadingAudio' | 'waiting' | 'playing' | 'done'>(
  'username',
)
const usernameReadonly = computed(() => state.value !== 'username')
const loginDisabled = computed(() => state.value !== 'username' && state.value !== 'done')

const username = ref('')
const keyPresses = ref<{ key: string; time: number }[]>([])

const password = computed(() => keyPresses.value.map((kp) => `${kp.key}(${kp.time})`).join(','))

async function handleSubmit() {
  if (state.value === 'done') {
    const res = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.value,
        keyPresses: keyPresses.value,
      }),
    })
    if (res.ok) {
      const { token } = await res.json()
      auth.login(token)
      router.push('/')
      return
    }
    alert('Invalid username or password.')
    state.value = 'username'
    return
  }

  if (!/^[a-zA-Z0-9]+$/.test(username.value)) {
    alert('Username must contain only letters and numbers.')
    return
  }
  keyPresses.value = []
  state.value = 'signingIn'
  const res = await fetch(`${API_BASE_URL}/auth/data/${username.value}`)
  if (!res.ok) {
    alert('User not found.')
    state.value = 'username'
    return
  }
  const data = (await res.json()) as AuthChartData

  state.value = 'loadingAudio'
  const audioRes = await fetch(data.audioUrl)
  if (!audioRes.ok) {
    alert('Audio not found.')
    state.value = 'username'
    return
  }
  const audioData = await audioRes.blob()
  if (audioBlobUrl) {
    URL.revokeObjectURL(audioBlobUrl)
  }
  audioBlobUrl = URL.createObjectURL(audioData)

  audio = new Audio()
  await new Promise<void>((resolve, reject) => {
    if (!audio || !audioBlobUrl) return
    audio.addEventListener('canplay', () => {
      resolve()
    })
    audio.addEventListener('error', (e) => {
      console.error(e)
      reject(e.error || e.message)
    })
    audio.src = audioBlobUrl
    audio.load()
  })

  state.value = 'waiting'
}

function onKeyDown(e: KeyboardEvent) {
  console.log(e)
  if (state.value === 'waiting') {
    state.value = 'playing'
    audio?.play()
    startTime = Date.now()
    audio?.addEventListener('ended', () => {
      state.value = 'done'
      startTime = null
    })
  } else if (state.value === 'playing') {
    const currentTime = Date.now()
    if (startTime) {
      const elapsed = currentTime - startTime
      keyPresses.value.push({ key: e.key, time: elapsed })
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  if (audio) {
    audio.pause()
    audio.src = ''
    audio.load()
  }
  if (audioBlobUrl) {
    URL.revokeObjectURL(audioBlobUrl)
    audioBlobUrl = null
  }
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <h1>Sign in</h1>
  <p>Please sign in using the form below.</p>
  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label class="form-label" for="username"><strong>Username</strong></label>
      <input
        id="username"
        class="form-control"
        type="text"
        name="username"
        placeholder="Enter your username"
        required
        v-model="username"
        :disabled="usernameReadonly"
      />
    </div>
    <div class="mb-3" v-if="['loadingAudio', 'waiting', 'playing', 'done'].includes(state)">
      <label class="form-label"><strong>Password</strong></label>
      <input id="password" class="form-control" type="text" :value="password" disabled />
      <div class="form-text" v-if="state === 'loadingAudio'">Loading audio...</div>
      <div class="form-text" v-else-if="state === 'waiting'">Tap any key when you're ready!</div>
      <div class="form-text" v-else-if="state === 'playing'">
        Play the rhythm as you set it when you registered! {{ keyPresses.length }} keys pressed.
      </div>
      <div class="form-text" v-else-if="state === 'done'">
        Completed! {{ keyPresses.length }} keys pressed. Please sign in now!
      </div>
    </div>
    <button type="submit" class="btn btn-primary" :disabled="loginDisabled">Sign In</button>
  </form>
</template>

<style scoped>
.form-grid {
  display: grid;
  max-width: 500px;
  grid-template-columns: auto 1fr;
  gap: 1em;
  margin: 1em 0;
}
.signin-button {
  grid-column: span 2;
  padding: 0.5em 1em;
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}
.signin-button:disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
}
</style>
