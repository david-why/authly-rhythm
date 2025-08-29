import { signJwt, verifyJwt } from './src/jwt'
import { HTTPError, Server } from './src/server'
import * as db from './src/database'
import { checkCorrect } from './src/rhythm'
import { uploadToCdn } from '@/cdn'
import type { AuthRegisterRequest, AuthSignInRequest, ChartCreateRequest } from '@/types'

async function ensureAuth(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new HTTPError(401, 'Unauthorized')
  }
  const token = authHeader.replace('Bearer ', '')
  try {
    const payload = await verifyJwt<{ aud: string }>(token)
    return payload
  } catch {
    throw new HTTPError(401, 'Unauthorized')
  }
}

function error(status: number, message: string) {
  return Response.json({ message }, { status })
}

const BASE_URL = process.env.BASE_URL
const PORT = Number(process.env.PORT) || 3001

const server = new Server()

server.get('/auth/data/:username', async (req) => {
  const { username } = req.params
  const data = await db.getUser(username)
  if (!data) return error(404, 'The user is not found.')
  return Response.json({
    audioUrl: data.audioUrl,
  })
})

server.post('/auth/signin', async (req) => {
  const { username, keyPresses } = (await req.json()) as AuthSignInRequest
  const user = await db.getUser(username)
  if (!user) return error(404, 'The user is not found.')
  const correctKeyPresses = user.keyPresses
  const isCorrect = checkCorrect(keyPresses, correctKeyPresses)
  if (!isCorrect) {
    return error(
      401,
      `Incorrect rhythm. Hint: your pattern has ${correctKeyPresses.length} key presses!`,
    )
  }
  return Response.json({ token: await signJwt({ aud: username }) })
})

server.post('/auth/register', async (req) => {
  const { username, audioUrl, keyPresses } = (await req.json()) as AuthRegisterRequest
  const user = await db.getUser(username)
  if (user) return error(409, 'User already exists.')
  await db.createUser({ username, audioUrl, keyPresses })
  return Response.json({ message: 'User registered successfully.' })
})

const uploadingFiles: Record<string, ArrayBuffer> = {}

server.post('/auth/upload', async (req) => {
  if (!BASE_URL) return error(500, 'Server base URL not provided')
  if (!req.body) return error(500, 'Request body not found')
  const MAX_SIZE = 25 * 1024 * 1024 // 25MB
  const contentLength = Number(req.headers.get('content-length'))
  if (isNaN(contentLength) || contentLength > MAX_SIZE) {
    return error(413, 'File too large. Maximum size is 25MB.')
  }
  const file = await req.arrayBuffer()
  const uid = crypto.randomUUID()
  uploadingFiles[uid] = file
  try {
    const cdnUrl = await uploadToCdn(`${BASE_URL}/auth/upload/${uid}`)
    return Response.json({ url: cdnUrl })
  } finally {
    if (uid in uploadingFiles) {
      delete uploadingFiles[uid]
    }
  }
})

server.get('/auth/upload/:uid', async (req) => {
  return new Response(uploadingFiles[req.params.uid] || null)
})

server.get('/charts', async (req) => {
  await ensureAuth(req)
  const charts = await db.getCharts()
  return Response.json(charts)
})

server.get('/charts/:id', async (req) => {
  await ensureAuth(req)
  const chart = await db.getChart(Number(req.params.id))
  return Response.json(chart)
})

server.post('/charts', async (req) => {
  const { aud: username } = await ensureAuth(req)
  const reqData = (await req.json()) as ChartCreateRequest
  const id = await db.createChart({ userUsername: username, ...reqData })
  return Response.json({ id })
})

server.get('/', () => new Response(Bun.file('../dist/index.html')))

server.serve({
  port: PORT,
})

console.log('Server listening on', PORT)
