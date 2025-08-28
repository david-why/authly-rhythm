import type { RhythmKeyPress } from '@/types'

export function checkCorrect(keyPresses: RhythmKeyPress[], chart: RhythmKeyPress[]) {
  if (keyPresses.length !== chart.length) return false

  const tolerance = 200 // milliseconds

  for (let i = 0; i < chart.length; i++) {
    if (keyPresses[i]!.key !== chart[i]!.key) return false
    if (Math.abs(keyPresses[i]!.time - chart[i]!.time) > tolerance) return false
  }

  return true
}
