// src/lib/auth.ts

import { SignJWT, jwtVerify } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not defined in .env.local");
}

const secretKey = new TextEncoder().encode(secret);

export async function createAuthToken(userId: string) {
  return await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      secretKey,
    );

    const userId = payload.userId;

    if (
      typeof userId !== "string" ||
      !userId
    ) {
      return null;
    }

    return {
      userId,
    };
  } catch (error) {
    console.error("AUTH_TOKEN_ERROR:", error);
    return null;
  }
}