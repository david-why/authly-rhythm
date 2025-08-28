import type { RhythmKeyPress, User } from '@/types'
import { sql } from 'bun'

interface DBUser {
  username: string
  audio_url: string
  key_presses: RhythmKeyPress[]
}

async function getDbUserByUsername(username: string): Promise<DBUser | null> {
  const result = await sql<DBUser[]>`SELECT * FROM users WHERE username = ${username}`
  return result[0] || null
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
