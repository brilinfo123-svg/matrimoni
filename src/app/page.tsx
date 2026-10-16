import { redirect } from "next/navigation";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import Hero from "@/components/Hero";
import FeaturedProfiles from "@/components/FeaturedProfiles";
import HowItWorks from "@/components/HowItWorks";
import SuccessStories from "@/components/SuccessStories";

import styles from "./page.module.scss";

async function isUserLoggedIn() {
  const cookieStore = await cookies();
  const token = cookieStore.get("matrimonial_session")?.value;

  if (!token) {
    return false;
  }

  try {
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      throw new Error("AUTH_SECRET is not configured");
    }

    await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] }
    );

    return true;
  } catch {
    return false;
  }
}

export default async function HomePage() {
  const loggedIn = await isUserLoggedIn();

  // Logged-in users cannot access the homepage.
  if (loggedIn) {
    redirect("/search");
  }

  // Logged-out users can access the homepage.
  return (
    <div className={styles.homePage}>
      <Hero />

      <FeaturedProfiles />

      <HowItWorks />

      <SuccessStories />
    </div>
  );
}