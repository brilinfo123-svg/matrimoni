import mongoose from "mongoose";
import { cookies } from "next/headers";
import { verifyAuthToken } from "@/lib/auth";

export async function getContactUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("matrimonial_session")?.value;

    if (!token) return null;

    const session = await verifyAuthToken(token);
    if (!session?.userId) return null;

    if (!mongoose.Types.ObjectId.isValid(session.userId)) {
      return null;
    }

    return session.userId;
  } catch (error) {
    console.error("CONTACT_AUTH_ERROR:", error);
    return null;
  }
}