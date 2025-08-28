<script setup lang="ts">
import RhythmPlay from '@/components/RhythmPlay.vue'
import { API_BASE_URL } from '@/consts'
import type { AuthRegisterRequest, RhythmKeyPress } from '@/types'
import { formatKeyPresses } from '@/utils/rhythm'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const username = ref('')
const audioFile = ref<File | null>(null)
const keyPresses = ref<RhythmKeyPress[]>([])

const password = computed(() => formatKeyPresses(keyPresses.value))

const audioBlobUrl = ref<string | null>(null)
watch(audioFile, (file) => {
  if (audioBlobUrl.value) {
    URL.revokeObjectURL(audioBlobUrl.value)
    audioBlobUrl.value = null
  }
  if (file) {
    audioBlobUrl.value = URL.createObjectURL(file)
  }
})

const passwordIsSet = ref(false)
const showPlayer = computed(() => !!audioBlobUrl.value && !passwordIsSet.value)
const isPlaying = ref(false)

const isFormComplete = computed(() => {
  return username.value.trim().length > 0 && audioFile.value && passwordIsSet.value
})

const errorMessage = ref('')

async function onSubmit() {
  if (!audioFile.value) return

  errorMessage.value = ''

  const uploadRes = await fetch(`${API_BASE_URL}/auth/upload`, {
    method: 'POST',
    body: audioFile.value,
    headers: {
      'Content-Type': audioFile.value.type,
    },
  })
  if (!uploadRes.ok) {
    const error = await uploadRes.text()
    console.error('Upload error:', error)
    errorMessage.value = 'Failed to upload audio file. Please try again later.'
    return
  }
  const uploadData = (await uploadRes.json()) as { url: string }
  const audioUrl = uploadData.url

  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      username: username.value,
      audioUrl: audioUrl,
      keyPresses: keyPresses.value,
    } satisfies AuthRegisterRequest),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const error = await res.text()
    console.error('Registration error:', error)
    errorMessage.value = 'Failed to register. Please try again later.'
  }

  router.push('/user')
}

function onAudioFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    audioFile.value = target.files[0]
  } else {
    audioFile.value = null
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function onKeyDown(event: KeyboardEvent) {
  if (isPlaying.value || !showPlayer.value) return
  event.preventDefault()
  isPlaying.value = true
  keyPresses.value = []
}

function onRhythmKeyPress(press: RhythmKeyPress) {
  keyPresses.value.push(press)
}

function onPlayFinish() {
  isPlaying.value = false
  passwordIsSet.value = keyPresses.value.length > 0
}

function onReset() {
  keyPresses.value = []
  passwordIsSet.value = false
  isPlaying.value = false
}
</script>

<template>
  <h1>Register</h1>
  <p>You can register for an account here.</p>
  <p>
    <em>Already have a Rhythmly account? <RouterLink to="/login">Sign in here!</RouterLink></em>
  </p>
  <form @submit.prevent="onSubmit">
    <div class="form-group mb-3">
      <label class="form-label fw-bold" for="username">Username</label>
      <input
        class="form-control"
        id="username"
        type="text"
        placeholder="Enter your new username"
        v-model="username"
        required
      />
    </div>
    <div class="form-group mb-3">
      <label class="form-label fw-bold" for="audioUrl">Audio</label>
      <input
        class="form-control"
        id="audioUrl"
        type="file"
        accept="audio/*"
        required
        @change="onAudioFileChange"
      />
      <small class="form-text text-muted"
        >This audio file will play when you are playing the rhythm!</small
      >
    </div>
    <div class="form-group mb-3">
      <label class="form-label fw-bold" for="password">Password</label>
      <input
        class="form-control"
        id="password"
        placeholder="Enter your password"
        :value="password"
        disabled
      />
      <small class="form-text text-muted" v-if="!audioFile"
        >Upload a file to set your password</small
      >
      <small class="form-text text-muted" v-else-if="passwordIsSet"
        >Click on the "Reset" button to clear and reset your password</small
      >
      <small class="form-text text-muted" v-else-if="!isPlaying"
        >Press any key to set your password!</small
      >
    </div>
    <div class="form-row mb-3">
      <button type="submit" class="btn btn-primary me-2" :disabled="!isFormComplete">
        Register
      </button>
      <button type="button" class="btn btn-danger" :disabled="!passwordIsSet" @click="onReset">
        Reset
      </button>
    </div>
  </form>
  <RhythmPlay
    :audio-url="audioBlobUrl!"
    :playing="isPlaying"
    v-if="showPlayer"
    @press="onRhythmKeyPress"
    @done="onPlayFinish"
    :key="audioBlobUrl!"
  />
  <div class="alert alert-danger" v-if="errorMessage">{{ errorMessage }}</div>
</template>
