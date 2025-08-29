<script setup lang="ts">
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import RhythmPlay from '@/components/RhythmPlay.vue'
import { API_BASE_URL } from '@/consts'
import type { Chart, RhythmKeyPress } from '@/types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const id = route.params.id as string

const chart = ref<Chart>()

const errorMessage = ref('')

const shouldShowStats = ref(false)

const timerId = ref<number | null>(null)
watch(timerId, (_, oldValue) => {
  if (oldValue) {
    clearInterval(oldValue)
  }
})
const updateNotesCounter = ref(0)
const isPlaying = ref(false)
const startTime = ref<number | null>(null)
const currentKeyIndex = ref(0)
const score = ref(0)
const maxScore = computed(() => {
  if (!chart.value) return 0
  return chart.value.keyPresses.length
})
const lastVerdict = ref('-')
const statsText = computed(() => {
  if (!chart.value) return ''
  return `SCORE  ${score.value.toString().padStart(5, '0')} / ${maxScore.value.toString().padStart(5, '0')}\nTIME   --:-- / --:--\n\n--- ${lastVerdict.value} ---`
})

const displayNotes = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  updateNotesCounter.value
  if (!chart.value || !startTime.value) return []
  const notes = chart.value.keyPresses.slice(currentKeyIndex.value)
  if (!notes.length) return []
  const nextNote = notes.shift()!
  const prevNote = currentKeyIndex.value
    ? chart.value.keyPresses[currentKeyIndex.value - 1]
    : { time: 0 }
  console.log((Date.now() - startTime.value - prevNote.time) / (nextNote.time - prevNote.time))
  return [
    {
      ...nextNote,
      progress: Math.max(
        0,
        Math.min(
          1,
          (Date.now() - startTime.value - prevNote.time) / (nextNote.time - prevNote.time),
        ),
      ),
    },
  ].concat(
    notes.map((press) => ({
      ...press,
      progress: 0,
    })),
  )
})

async function fetchChart() {
  const res = await fetch(`${API_BASE_URL}/charts/${id}`)
  if (!res.ok) {
    errorMessage.value = `Error fetching chart: ${res.status} ${res.statusText}`
    return
  }
  chart.value = await res.json()
}

function startPlay() {
  if (!chart.value) return
  shouldShowStats.value = true
  startTime.value = null
  score.value = 0
  currentKeyIndex.value = 0
  isPlaying.value = true
  timerId.value = setInterval(() => {
    updateNotesCounter.value++
  }, 10)
}

onMounted(() => {
  fetchChart()
})

onBeforeUnmount(() => {
  timerId.value = null
})

function onPlayerStart(time: number) {
  startTime.value = time
}

function onPlayerPress({ key, time }: RhythmKeyPress) {
  if (!chart.value || !startTime.value) return
  const note = chart.value.keyPresses[currentKeyIndex.value]
  if (!note) return
  if (note.key === key && Math.abs(time - note.time) <= 200) {
    score.value++
    lastVerdict.value = `HIT    ${time > note.time ? '+' : ''}${time - note.time}`
  } else if (note.key !== key) {
    lastVerdict.value = 'MISS'
  } else if (time > note.time) {
    lastVerdict.value = `LATE   +${time - note.time}`
  } else {
    lastVerdict.value = `EARLY  -${note.time - time}`
  }
  currentKeyIndex.value++
}

function onPlayerDone() {
  isPlaying.value = false
  timerId.value = null
}
</script>

<template>
  <h1 v-if="chart">Play {{ chart.title }}</h1>
  <h1 v-else>Play</h1>
  <p class="alert alert-danger" v-if="errorMessage">{{ errorMessage }}</p>
  <p class="alert alert-info" v-else-if="!chart"><LoadingSpinner /> Loading chart...</p>
  <template v-else>
    <p>
      Chart created by: <strong>{{ chart.userUsername }}</strong>
    </p>
    <p>Click on the button below to start playing this chart!</p>
    <button class="btn btn-success" role="button" @click="startPlay" :disabled="isPlaying">
      Play!
    </button>
    <pre v-if="shouldShowStats || true" class="mt-3" v-text="statsText"></pre>
    <div v-for="note in displayNotes" :key="`${note.key}@${note.time}`">
      <div class="row align-items-center">
        <div class="col-1">{{ note.key }}</div>
        <div class="col">
          <div
            class="progress"
            role="progressbar"
            :aria-label="`Progress bar for note '${note.key}'`"
            :aria-valuenow="note.progress"
            aria-valuemin="0"
            aria-valuemax="1"
          >
            <div class="progress-bar" :style="{ width: `${Math.round(note.progress * 100)}%` }">
              {{ `${Math.round(note.progress * 100)}%` }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  <RhythmPlay
    :audio-url="chart.audioUrl"
    :playing="isPlaying"
    v-if="!!chart"
    @start="onPlayerStart"
    @press="onPlayerPress"
    @done="onPlayerDone"
  ></RhythmPlay>
</template>

<style lang="scss" scoped>
$enable-transitions: false;
</style>
