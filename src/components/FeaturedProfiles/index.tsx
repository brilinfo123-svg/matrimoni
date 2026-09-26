"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiHeart,
  FiMapPin,
} from "react-icons/fi";

import styles from "./index.module.scss";

interface Profile {
  id: string;
  name: string;
  age: number | null;
  location: string;
  profession: string;
  image: string;
  initials: string;
  verified: boolean;
  education: string;
}

export default function FeaturedProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch("/api/profiles/featured", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch featured profiles.");
        }

        const data = await response.json();

        if (data.success) {
          setProfiles(data.profiles || []);
        } else {
          setProfiles([]);
        }
      } catch (error) {
        console.error("FEATURED_PROFILES_FETCH_ERROR:", error);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>
              Meet people who could <span>fit your world.</span>
            </h2>
          </div>
        </div>

        {/* Profiles Grid */}
        <div className={styles.profileGrid}>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <article
                  key={index}
                  className={styles.profileCard}
                >
                  {/* Loading Image */}
                  <div className={styles.imageWrapper}>
                    <div className={styles.imagePlaceholder}>
                      <span>...</span>
                    </div>
                  </div>

                  {/* Loading Content */}
                  <div className={styles.profileContent}>
                    <div className={styles.nameRow}>
                      <h3>Loading...</h3>
                    </div>

                    <div className={styles.location}>
                      <FiMapPin aria-hidden="true" />
                      <span>Loading...</span>
                    </div>

                    <div className={styles.profession}>
                      <FiBriefcase aria-hidden="true" />
                      <span>Loading...</span>
                    </div>
                  </div>
                </article>
              ))
            : profiles.map((profile) => (
                <article
                  key={profile.id}
                  className={styles.profileCard}
                >
                  {/* ================================
                      IMAGE SECTION
                  ================================= */}

                  <div className={styles.imageWrapper}>
                    {profile.image ? (
                      <Image
                        src={profile.image}
                        alt={`${profile.name} profile`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className={styles.profileImage}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span>{profile.initials}</span>
                      </div>
                    )}

                    {/* Image Overlay */}
                    <div className={styles.imageOverlay} />

                    {/* Top Row */}
                    <div className={styles.topRow}>
                      {profile.verified && (
                        <span className={styles.verified}>
                          <FiCheck aria-hidden="true" />
                          Verified
                        </span>
                      )}

                      <button
                        type="button"
                        className={styles.favoriteButton}
                        aria-label={`Add ${profile.name} to shortlist`}
                      >
                        <FiHeart aria-hidden="true" />
                      </button>
                    </div>

                    {/* Compatibility */}
                    <div className={styles.compatibility}>
                      <span>Compatibility</span>
                      <strong>—</strong>
                    </div>
                  </div>

                  {/* ================================
                      PROFILE CONTENT
                  ================================= */}

                  <div className={styles.profileContent}>
                    {/* Name */}
                    <div className={styles.nameRow}>
                      <h3>
                        {profile.name}
                        {profile.age !== null
                          ? `, ${profile.age}`
                          : ""}
                      </h3>

                      {profile.verified && (
                        <span
                          className={styles.verifiedSmall}
                          aria-label="Verified profile"
                        >
                          <FiCheck aria-hidden="true" />
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div className={styles.location}>
                      <FiMapPin aria-hidden="true" />
                      <span>{profile.location}</span>
                    </div>

                    {/* Profession */}
                    <div className={styles.profession}>
                      <FiBriefcase aria-hidden="true" />
                      <span>{profile.profession}</span>
                    </div>

                    {/* Details */}
                    <div className={styles.details}>
                      <span>{profile.education}</span>

                      <span className={styles.detailDot}>•</span>

                      <span>{profile.profession}</span>
                    </div>

                    {/* View Profile */}
                    <Link
                      href={`/profile/${profile.id}`}
                      className={styles.viewProfile}
                    >
                      <span>View profile</span>
                      <FiArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
        </div>

        {/* Mobile View All */}
        <div className={styles.mobileViewAll}>
          <Link
            href="/search"
            className={styles.viewAllButton}
          >
            <span>Explore all profiles</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Desktop View All */}
      <div className={styles.viewAll}>
        <Link
          href="/search"
          className={styles.desktopViewAll}
        >
          <span>View all profiles</span>
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}