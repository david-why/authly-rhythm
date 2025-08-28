<script setup lang="ts">
import type { RhythmKeyPress } from '@/types'
import { onBeforeUnmount, onMounted } from 'vue'

const { audioUrl } = defineProps<{
  audioUrl: string
}>()
const emit = defineEmits<{
  play: [{ startTime: number }]
  done: [{ keyPresses: RhythmKeyPress[] }]
}>()

let startTime: number | null = null
let keyPresses: RhythmKeyPress[] = []

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function onPlay() {
  startTime = Date.now()
  keyPresses = []
  emit('play', { startTime })
}

function onEnded() {
  emit('done', { keyPresses })
}

function onKeyDown(event: KeyboardEvent) {
  if (!startTime) return

  const keyPress: RhythmKeyPress = {
    key: event.key,
    time: Date.now() - startTime,
  }

  keyPresses.push(keyPress)
}
</script>

<template>
  <audio
    class="d-none"
    :src="audioUrl"
    v-if="audioUrl"
    autoplay
    @play="onPlay"
    @ended="onEnded"
  ></audio>
</template>
