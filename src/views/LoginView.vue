<script setup lang="ts">
import RhythmPlay from '@/components/RhythmPlay.vue'
import { API_BASE_URL } from '@/consts'
import { useAuth } from '@/stores/auth'
import type { AuthChartData, RhythmKeyPress } from '@/types'
import { formatKeyPresses } from '@/utils/rhythm'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const auth = useAuth()
const router = useRouter()

const state = ref<'username' | 'signingIn' | 'loadingAudio' | 'waiting' | 'playing' | 'done'>(
  'username',
)
const usernameReadonly = computed(() => state.value !== 'username')
const loginDisabled = computed(() => state.value !== 'username' && state.value !== 'done')

const audioUrl = ref<string | null>(null)

const username = ref('')
const keyPresses = ref<RhythmKeyPress[]>([])

const password = computed(() => formatKeyPresses(keyPresses.value))

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
    let message = 'Invalid username or password.'
    try {
      const data = await res.json()
      message = data.message || message
    } catch {}
    alert(message)
    state.value = 'username'
    audioUrl.value = null
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
  audioUrl.value = data.audioUrl

  state.value = 'waiting'
}

function onKeyDown(e: KeyboardEvent) {
  console.log(e)
  if (state.value === 'waiting') {
    state.value = 'playing'
  }
}

function onRhythmKeypress(press: RhythmKeyPress) {
  keyPresses.value.push(press)
}

function onPlayDone({ keyPresses: presses }: { keyPresses: RhythmKeyPress[] }) {
  state.value = 'done'
  keyPresses.value = presses
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
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
  <RhythmPlay
    v-if="audioUrl"
    :audio-url="audioUrl"
    :playing="state === 'playing'"
    @press="onRhythmKeypress"
    @done="onPlayDone"
    :key="audioUrl"
  ></RhythmPlay>
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
