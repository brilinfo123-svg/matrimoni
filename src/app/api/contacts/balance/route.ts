import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getContactUserId } from "@/lib/contact-auth";
import User from "@/models/User";

const FREE_LIMIT = 5;

export async function GET() {
  try {
    const userId = await getContactUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select(
      "contactCredits freeContactUnlocksUsed premiumUntil unlockedProfiles"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const now = new Date();
    const premiumActive =
      !!user.premiumUntil && new Date(user.premiumUntil) > now;

    const freeUsed = user.freeContactUnlocksUsed || 0;
    const freeRemaining = Math.max(0, FREE_LIMIT - freeUsed);

    return NextResponse.json({
      success: true,
      balance: {
        freeTotal: FREE_LIMIT,
        freeUsed,
        freeRemaining,
        contactCredits: user.contactCredits || 0,
        premiumActive,
        premiumUntil: user.premiumUntil || null,
        totalAvailable: premiumActive
          ? "unlimited"
          : freeRemaining + (user.contactCredits || 0),
        unlockedCount: user.unlockedProfiles?.length || 0,
      },
    });
  } catch (error) {
    console.error("CONTACT_BALANCE_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load contact balance." },
      { status: 500 }
    );
  }
}