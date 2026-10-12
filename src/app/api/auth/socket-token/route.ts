import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";
import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken =
      cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const session = await verifyAuthToken(sessionToken);

    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Auth configuration missing" },
        { status: 500 },
      );
    }

    const token = await new SignJWT({
      userId: String(session.userId),
      type: "socket",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(new TextEncoder().encode(secret));

    return NextResponse.json(
      { success: true, token },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("SOCKET_TOKEN_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to create socket token" },
      { status: 500 },
    );
  }
}