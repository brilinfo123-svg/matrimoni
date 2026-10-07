import { cookies } from "next/headers";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import {
  AUTH_COOKIE_NAME,
  verifyAuthToken,
} from "@/lib/auth";

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(
      AUTH_COOKIE_NAME,
    )?.value;

    if (!token) {
      return null;
    }

    const session =
      await verifyAuthToken(token);

    if (!session?.userId) {
      return null;
    }

    await connectDB();

    const user = await User.findById(
      session.userId,
    ).select("-password");

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error(
      "GET_CURRENT_USER_ERROR:",
      error,
    );

    return null;
  }
}