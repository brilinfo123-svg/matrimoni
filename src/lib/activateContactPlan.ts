import User from "@/models/User";

type Plan = "contact_pack" | "monthly";

export async function activateContactPlan(
  userId: string,
  plan: Plan
) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (plan === "contact_pack") {
    user.contactCredits =
      (user.contactCredits || 0) + 20;
  }

  if (plan === "monthly") {
    const now = new Date();

    const currentExpiry =
      user.premiumUntil &&
      new Date(user.premiumUntil) > now
        ? new Date(user.premiumUntil)
        : now;

    currentExpiry.setDate(
      currentExpiry.getDate() + 30
    );

    user.premiumUntil = currentExpiry;
  }

  // Monthly plan never removes contactCredits.
  await user.save();

  return {
    contactCredits: user.contactCredits,
    premiumUntil: user.premiumUntil,
  };
}