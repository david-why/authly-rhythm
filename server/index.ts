import { signJwt } from './src/jwt'
import { Server } from './src/server'

const PORT = Number(process.env.PORT) || 3001

const server = new Server()

server.get('/', () => new Response('Hello World'))

server.get('/auth/data/:username', async (req) => {
  const { username } = req.params
  return new Response(
    JSON.stringify({
      audioUrl: `/api/audio/${username}`,
    }),
  )
})

server.get('/audio/:username', async (req) => {
  const { username } = req.params
  console.log(username)
  return new Response(Bun.file(`/tmp/never.mp3`))
})

server.post('/auth/signin', async (req) => {
  const { username, keyPresses } = (await req.json()) as {
    username: string
    keyPresses: { key: string; time: number }[]
  }
  console.log(keyPresses)
  return Response.json({ token: await signJwt({ aud: username }) })
})

server.serve({
  port: PORT,
})

console.log('Server listening on', PORT)
