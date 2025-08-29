// Shared types for both frontend and backend

export interface AuthSignInRequest {
  username: string
  keyPresses: RhythmKeyPress[]
}

export interface AuthRegisterRequest {
  username: string
  audioUrl: string
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

export interface Chart {
  id: number
  userUsername: string
  title: string
  audioUrl: string
  keyPresses: RhythmKeyPress[]
  createdAt: string
  updatedAt: string
}

export interface ChartCreateRequest {
  title: string
  audioUrl: string
  keyPresses: RhythmKeyPress[]
}

export interface ChartCreateResponse {
  id: number
}

export interface PaginationParams {
  page: number
  limit: number
}
