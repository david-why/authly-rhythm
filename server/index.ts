import { serve } from 'bun'

const PORT = process.env.PORT || 3001

serve({
  port: PORT,
  routes: {
    '/': {
      GET: () => new Response('Hello World'),
    },
    '/auth/data/david': {
      GET: () =>
        new Response(
          JSON.stringify({
            audioUrl: '/api/audio/david',
          }),
        ),
    },
    '/audio/david': {
      GET: () => new Response(Bun.file('/tmp/never.mp3')),
    },
    '/auth/signin': {
      POST: async (req) => {
        const { username, keyPresses } = (await req.json()) as {
          username: string
          keyPresses: { key: string; time: number }[]
        }
        console.log(keyPresses)
        return Response.json({ token: '123456' })
      },
    },
  },
})

console.log('Server listening on', PORT)
