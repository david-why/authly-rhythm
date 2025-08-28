// Shared types for both frontend and backend

export interface AuthSignInRequest {
  username: string
  keyPresses: RhythmKeyPress[]
}

export interface RhythmKeyPress {
  key: string
  time: number
}

export interface AuthChartData {
  audioUrl: string
}

export interface User {
  username: string
  audioUrl: string
  keyPresses: RhythmKeyPress[]
}
