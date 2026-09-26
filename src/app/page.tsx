import { redirect } from "next/navigation";

import { auth } from "@/auth";

import Hero from "@/components/Hero";
import FeaturedProfiles from "@/components/FeaturedProfiles";
import HowItWorks from "@/components/HowItWorks";
import SuccessStories from "@/components/SuccessStories";

import styles from "./page.module.scss";

export default async function HomePage() {
  const session = await auth();

  // Logged-in user ko homepage par nahi aane dena
  if (session?.user) {
    redirect("/search");
  }

  return (
    <div className={styles.homePage}>
      <Hero />

      <FeaturedProfiles />

      <HowItWorks />

      {/* <WhyChooseUs /> */}

      <SuccessStories />

      {/* <SafetySection /> */}

      {/* <CallToAction /> */}
    </div>
  );
}