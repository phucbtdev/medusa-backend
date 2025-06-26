import { jwtVerify } from "jose"

const CLERK_JWT_PUBLIC_KEY = process.env.CLERK_JWT_PUBLIC_KEY || ""

export const verifyClerkToken = async (token: string) => {
  const encoder = new TextEncoder()
  const publicKey = encoder.encode(CLERK_JWT_PUBLIC_KEY)

  const { payload } = await jwtVerify(token, publicKey)
  return payload
}
