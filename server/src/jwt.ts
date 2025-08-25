import { jwtVerify, SignJWT, type JWTPayload } from 'jose'

const AUTH_SECRET = process.env.AUTH_SECRET

export async function signJwt(payload: JWTPayload): Promise<string> {
  if (!AUTH_SECRET) {
    throw new Error('Missing AUTH_SECRET env variable')
  }
  const secret = new TextEncoder().encode(AUTH_SECRET)
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('authly-rhythm')
    .setExpirationTime('1d')
    .sign(secret)
}

export async function verifyJwt<Payload extends JWTPayload>(jwt: string): Promise<Payload> {
  if (!AUTH_SECRET) {
    throw new Error('Missing AUTH_SECRET env variable')
  }
  const secret = new TextEncoder().encode(AUTH_SECRET)
  const { payload } = await jwtVerify<Payload>(jwt, secret)
  return payload
}
