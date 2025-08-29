<script setup lang="ts">
import RhythmPlay from '@/components/RhythmPlay.vue'
import { API_BASE_URL } from '@/consts'
import { useAuth } from '@/stores/auth'
import type { ChartCreateRequest, ChartCreateResponse, RhythmKeyPress } from '@/types'
import { formatKeyPresses } from '@/utils/rhythm'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
const auth = useAuth()
const router = useRouter()

const title = ref('')
const audioFile = ref<File | null>(null)

const audioBlobUrl = ref<string | null>(null)
watch(audioFile, (file) => {
  onReset()
  if (audioBlobUrl.value) {
    URL.revokeObjectURL(audioBlobUrl.value)
    audioBlobUrl.value = null
  }
  if (file) {
    audioBlobUrl.value = URL.createObjectURL(file)
  }
})

const keyPresses = ref<RhythmKeyPress[]>([])
const notesString = computed(() => formatKeyPresses(keyPresses.value))

const isCharted = ref(false)
const isPlaying = ref(false)
const errorMessage = ref('')

const isFormComplete = computed(
  () => title.value.trim().length > 0 && isCharted.value && !!audioFile.value,
)

onMounted(() => {
  if (!auth.isLoggedIn) {
    router.push('/login')
  }
  window.addEventListener('keydown', onKeyDown, { capture: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown, { capture: true })
  if (audioBlobUrl.value) {
    URL.revokeObjectURL(audioBlobUrl.value)
    audioBlobUrl.value = null
  }
})

function onKeyDown(event: KeyboardEvent) {
  if (isPlaying.value || isCharted.value || !audioBlobUrl.value) return
  event.preventDefault()
  event.stopPropagation()
  isPlaying.value = true
  keyPresses.value = []
}

function onAudioFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    audioFile.value = target.files[0]
  } else {
    audioFile.value = null
  }
}

function onReset() {
  keyPresses.value = []
  isCharted.value = false
  isPlaying.value = false
}

function onRhythmKeyPress(press: RhythmKeyPress) {
  keyPresses.value.push(press)
}

function onPlayFinish() {
  isPlaying.value = false
  isCharted.value = keyPresses.value.length > 0
}

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

  const res = await fetch(`${API_BASE_URL}/charts`, {
    method: 'POST',
    body: JSON.stringify({
      title: title.value,
      audioUrl: audioUrl,
      keyPresses: keyPresses.value,
    } satisfies ChartCreateRequest),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
    },
  })
  if (!res.ok) {
    const error = await res.text()
    console.error('Create chart error:', error)
    errorMessage.value = 'Failed to create the chart. Please try again later.'
  }

  const { id } = (await res.json()) as ChartCreateResponse

  router.push({ name: 'play', params: { id } })
}
</script>

<template>
  <h1>Create Chart</h1>
  <form @submit.prevent="onSubmit">
    <div class="form-group mb-3">
      <label class="form-label fw-bold" for="chart-title">Title</label>
      <input
        class="form-control"
        id="chart-title"
        type="text"
        placeholder="Enter the title of this chart"
        v-model="title"
        :disabled="!!audioFile"
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
        :disabled="!title"
        required
        @change="onAudioFileChange"
      />
    </div>
    <div class="form-group mb-3">
      <label class="form-label fw-bold" for="notes">Notes</label>
      <textarea class="form-control" id="notes" :value="notesString" disabled></textarea>
      <small class="form-text text-muted" v-if="!audioFile"
        >Upload a file first to create a chart</small
      >
      <small class="form-text text-muted" v-else-if="isCharted"
        >Click on the "Reset" button to re-chart</small
      >
      <small class="form-text text-muted" v-else-if="!isPlaying"
        >Press any key to chart this song!</small
      >
    </div>
    <div class="form-row mb-3">
      <button type="submit" class="btn btn-primary me-2" :disabled="!isFormComplete">Create</button>
      <button type="button" class="btn btn-danger" :disabled="!isCharted" @click="onReset">
        Reset
      </button>
    </div>
  </form>
  <RhythmPlay
    :audio-url="audioBlobUrl"
    :playing="isPlaying"
    v-if="!!audioBlobUrl && !isCharted"
    @press="onRhythmKeyPress"
    @done="onPlayFinish"
    :key="audioBlobUrl"
  />
  <div class="alert alert-danger" v-if="errorMessage">{{ errorMessage }}</div>
</template>
