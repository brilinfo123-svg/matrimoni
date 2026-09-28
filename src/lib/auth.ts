import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME =
  "matrimonial_session";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not defined in .env.local",
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createAuthToken(
  userId: string,
) {
  if (!userId) {
    throw new Error(
      "User ID is required to create auth token",
    );
  }

  return await new SignJWT({
    userId,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifyAuthToken(
  token: string,
) {
  try {
    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      getSecretKey(),
      {
        algorithms: ["HS256"],
      },
    );

    const userId = payload.userId;

    if (
      typeof userId !== "string" ||
      !userId
    ) {
      console.error(
        "AUTH_TOKEN_ERROR: userId missing from token",
      );

      return null;
    }

    return {
      userId,
    };
  } catch (error) {
    console.error(
      "AUTH_TOKEN_ERROR:",
      error,
    );

    return null;
  }
}