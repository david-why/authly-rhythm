import type { Chart, PaginationParams, RhythmKeyPress, User } from '@/types'
import { sql } from 'bun'

interface DBUser {
  username: string
  audio_url: string
  key_presses: RhythmKeyPress[]
}

interface DBChart {
  id: number
  user_username: string
  title: string
  audio_url: string
  key_presses: RhythmKeyPress[]
  created_at: string
  updated_at: string
}

async function getDbUserByUsername(username: string): Promise<DBUser | null> {
  const result = await sql<DBUser[]>`SELECT * FROM users WHERE username = ${username}`
  return result[0] || null
}

async function getDbCharts({ page, limit }: PaginationParams): Promise<DBChart[]> {
  const offset = (page - 1) * limit
  const result = await sql<
    DBChart[]
  >`SELECT * FROM charts ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  return result
}

async function getDbChartById(id: number): Promise<DBChart | null> {
  const result = await sql<DBChart[]>`SELECT * FROM charts WHERE id = ${id}`
  return result[0] || null
}

function mapUserToDb(user: User): DBUser {
  return {
    username: user.username,
    audio_url: user.audioUrl,
    key_presses: user.keyPresses,
  }
}

function mapChartFromDb(dbChart: DBChart): Chart {
  return {
    id: dbChart.id,
    userUsername: dbChart.user_username,
    title: dbChart.title,
    audioUrl: dbChart.audio_url,
    keyPresses: dbChart.key_presses,
    createdAt: dbChart.created_at,
    updatedAt: dbChart.updated_at,
  }
}

export async function getUser(username: string): Promise<User | null> {
  const user = await getDbUserByUsername(username)
  if (!user) return null

  const { audio_url, key_presses } = user
  return {
    username,
    audioUrl: audio_url,
    keyPresses: key_presses,
  }
}

export async function createUser(user: User): Promise<void> {
  const dbUser = mapUserToDb(user)
  await sql`INSERT INTO users ${sql(dbUser)}`
}

export async function getCharts({ page, limit }: PaginationParams): Promise<Chart[]> {
  const charts = await getDbCharts({ page, limit })
  return charts.map(mapChartFromDb)
}

export async function getChartCount(): Promise<number> {
  const result = await sql`SELECT COUNT(*) FROM charts`
  return Number(result[0].count)
}

export async function getChart(id: number): Promise<Chart | null> {
  const chart = await getDbChartById(id)
  if (!chart) return null
  return mapChartFromDb(chart)
}

export async function deleteChart(id: number): Promise<void> {
  await sql`DELETE FROM charts WHERE id = ${id}`
}

export async function createChart(
  chart: Omit<Chart, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> {
  const dbChart: Omit<DBChart, 'id' | 'created_at' | 'updated_at'> = {
    user_username: chart.userUsername,
    title: chart.title,
    audio_url: chart.audioUrl,
    key_presses: chart.keyPresses,
  }
  const result = await sql<[Pick<DBChart, 'id'>]>`INSERT INTO charts ${sql(dbChart)} RETURNING id`
  return result[0].id
}
