export interface AuthSignInRequest {
  username: string
  keyPresses: RhythmKeyPress[]
}

export interface RhythmKeyPress {
  key: string
  time: number
}
