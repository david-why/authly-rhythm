import type { RhythmKeyPress } from '@/types'

export function formatKeyPresses(keyPresses: RhythmKeyPress[]) {
  return keyPresses.map(({ time, key }) => `${key}(${Math.floor(time)})`).join('|')
}
