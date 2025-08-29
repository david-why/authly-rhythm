<script setup lang="ts">
import type { RhythmKeyPress } from '@/types'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const { audioUrl, playing } = defineProps<{
  audioUrl: string
  playing: boolean
}>()
const emit = defineEmits<{
  start: [startTime: number]
  press: [keyPress: RhythmKeyPress]
  done: [{ keyPresses: RhythmKeyPress[] }]
}>()

const audioPlayer = ref<HTMLAudioElement>()

let startTime: number | null = null
let keyPresses: RhythmKeyPress[] = []

let canPlayThrough: boolean = false
let waitingPlayThrough: boolean = false

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})

watch(
  () => playing,
  async (value) => {
    try {
      if (value) {
        requestPlay()
      } else {
        requestStop()
      }
    } catch (e) {
      console.error(e)
    }
  },
  { immediate: true },
)

function requestPlay() {
  if (!audioPlayer.value) return
  if (!canPlayThrough) {
    waitingPlayThrough = true
    return
  }
  audioPlayer.value.play()
  startTime = Date.now()
  keyPresses = []
  emit('start', startTime)
}

function requestStop() {
  if (!audioPlayer.value) return
  audioPlayer.value.pause()
  audioPlayer.value.currentTime = 0
  waitingPlayThrough = false
}

function onEnded() {
  emit('done', { keyPresses })
}

function onCanPlayThrough() {
  canPlayThrough = true
  if (waitingPlayThrough) {
    waitingPlayThrough = false
    requestPlay()
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (!startTime || !playing || event.repeat) return

  const keyPress: RhythmKeyPress = {
    key: event.key,
    time: Date.now() - startTime,
  }

  keyPresses.push(keyPress)
  emit('press', keyPress)
}
</script>

<template>
  <audio
    class="d-none"
    :src="audioUrl"
    @ended="onEnded"
    @canplaythrough="onCanPlayThrough"
    ref="audioPlayer"
  ></audio>
</template>
