import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getContactUserId } from "@/lib/contact-auth";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const userId = await getContactUserId();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const plan = body.plan;

    if (!["contact_pack", "monthly"].includes(plan)) {
      return NextResponse.json(
        { success: false, message: "Invalid plan." },
        { status: 400 }
      );
    }

    await connectDB();

    let user;

    if (plan === "contact_pack") {
      user = await User.findByIdAndUpdate(
        userId,
        { $inc: { contactCredits: 20 } },
        { new: true }
      );
    } else {
      const now = new Date();

      // Extend from the current expiry if premium is still active.
      user = await User.findById(userId);

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found." },
          { status: 404 }
        );
      }

      const currentExpiry =
        user.premiumUntil && user.premiumUntil > now
          ? new Date(user.premiumUntil)
          : now;

      currentExpiry.setDate(currentExpiry.getDate() + 30);
      user.premiumUntil = currentExpiry;

      await user.save();
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const now = new Date();
    const premiumActive =
      !!user.premiumUntil && user.premiumUntil > now;

    return NextResponse.json({
      success: true,
      message:
        plan === "contact_pack"
          ? "20 contact credits added."
          : "Premium activated for 30 days.",
      balance: {
        contactCredits: user.contactCredits || 0,
        freeContactUnlocksUsed: user.freeContactUnlocksUsed || 0,
        premiumActive,
        premiumUntil: user.premiumUntil || null,
      },
    });
  } catch (error) {
    console.error("CONTACT_ACTIVATE_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Unable to activate plan." },
      { status: 500 }
    );
  }
}