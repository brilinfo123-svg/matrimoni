"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  FiCheck,
  FiChevronDown,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSearch,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import styles from "./matches.module.scss";

type MatchProfile = {
  religionabout: string;
  id: string;
  name: string;
  age: number;
  location: string;
  profession: string;
  education: string;
  compatibility: number;
  initials: string;
  photo?: string | null;
  verified: boolean;
  online: boolean;
  height: string;
  maritalStatus: string;
  mobile: string | null;
  newMatch: boolean;
  about: string;
};

type Tab = "all" | "high" | "new";

type ApiResponse = {
  success: boolean;
  message?: string;
  users: MatchProfile[];
};

export default function MatchesPage() {
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("compatibility");

  const [shortlisted, setShortlisted] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load matches
   */
  useEffect(() => {
    let mounted = true;

    async function loadMatches() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/matches", {
          method: "GET",
          cache: "no-store",
        });

        const data = (await response.json()) as ApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load matches",
          );
        }

        if (mounted) {
          setProfiles(
            Array.isArray(data.users) ? data.users : [],
          );
        }
      } catch (err) {
        console.error("Failed to load matches:", err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading matches.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMatches();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Dynamic stats
   */
  const totalMatches = profiles.length;

  const newMatches = profiles.filter(
    (profile) => profile.newMatch,
  ).length;

  const highMatches = profiles.filter(
    (profile) => profile.compatibility >= 90,
  ).length;

  /*
   * Filter + Search + Sort
   */
  const filteredProfiles = useMemo(() => {
    let result = [...profiles];

    /*
     * Tabs
     */
    if (activeTab === "high") {
      result = result.filter(
        (profile) => profile.compatibility >= 90,
      );
    }

    if (activeTab === "new") {
      result = result.filter(
        (profile) => profile.newMatch,
      );
    }

    /*
     * Search
     */
    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter((profile) =>
        [
          profile.name,
          profile.location,
          profile.profession,
          profile.education,
          profile.maritalStatus,
        ].some((value) =>
          String(value).toLowerCase().includes(query),
        ),
      );
    }

    /*
     * Sort
     */
    result.sort((a, b) => {
      if (sortBy === "compatibility") {
        return b.compatibility - a.compatibility;
      }

      if (sortBy === "newest") {
        return Number(b.newMatch) - Number(a.newMatch);
      }

      return a.name.localeCompare(b.name);
    });

    return result;
  }, [profiles, activeTab, search, sortBy]);

  /*
   * Shortlist
   */
  const toggleShortlist = (id: string) => {
    setShortlisted((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className="container">
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FiHeart aria-hidden="true" />
            </div>

            <h2>Finding your matches...</h2>

            <p>
              We are checking your preferences and finding
              compatible profiles.
            </p>
          </section>
        </div>
      </main>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className="container">
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FiUsers aria-hidden="true" />
            </div>

            <h2>Unable to load matches</h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        {/* Header */}
        <section className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              <FiHeart aria-hidden="true" />
              Your recommendations
            </span>

            <h1>Matches made for you</h1>

            <p>
              Discover profiles that align with your preferences
              and what you&apos;re looking for.
            </p>
          </div>

          <div className={styles.headerStats}>
            <div>
              <strong>{totalMatches}</strong>
              <span>Total matches</span>
            </div>

            <div>
              <strong>{newMatches}</strong>
              <span>New matches</span>
            </div>

            <div>
              <strong>{highMatches}</strong>
              <span>90%+ compatible</span>
            </div>
          </div>
        </section>

        {/* Search & Sort */}
        <section className={styles.controls}>
          <div className={styles.searchBox}>
            <FiSearch aria-hidden="true" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, location or profession..."
              aria-label="Search matches"
            />
          </div>

          <div className={styles.sortBox}>
            <span>Sort by</span>

            <div>
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                aria-label="Sort matches"
              >
                <option value="compatibility">
                  Compatibility
                </option>

                <option value="newest">
                  New matches
                </option>

                <option value="name">Name</option>
              </select>

              <FiChevronDown aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={
              activeTab === "all" ? styles.activeTab : ""
            }
            onClick={() => setActiveTab("all")}
          >
            All matches
            <span>{totalMatches}</span>
          </button>

          <button
            type="button"
            className={
              activeTab === "high" ? styles.activeTab : ""
            }
            onClick={() => setActiveTab("high")}
          >
            Highly compatible
            <span>{highMatches}</span>
          </button>

          <button
            type="button"
            className={
              activeTab === "new" ? styles.activeTab : ""
            }
            onClick={() => setActiveTab("new")}
          >
            New matches
            <span>{newMatches}</span>
          </button>
        </div>

        {/* Info */}
        <div className={styles.matchInfo}>
          <div className={styles.matchInfoIcon}>
            <FiShield aria-hidden="true" />
          </div>

          <div>
            <strong>
              Your matches are based on your preferences
            </strong>

            <p>
              Only profiles with a compatibility score of 50%
              or higher are shown. You&apos;re always in control
              of who you connect with.
            </p>
          </div>
        </div>

        {/* Results */}
        {filteredProfiles.length > 0 ? (
          <section className={styles.results}>
            <div className={styles.resultsHeader}>
              <div>
                <h2>
                  {activeTab === "high"
                    ? "Highly compatible"
                    : activeTab === "new"
                      ? "New matches"
                      : "Recommended for you"}
                </h2>

                <span>
                  {filteredProfiles.length} profiles
                </span>
              </div>
            </div>

            <div className={styles.profileGrid}>
              {filteredProfiles.map((profile) => {
                const isShortlisted = shortlisted.includes(
                  profile.id,
                );

                const cleanMobile = profile.mobile
                  ? String(profile.mobile).replace(/\D/g, "")
                  : "";

                return (
                  <article
                    key={profile.id}
                    className={styles.profileCard}
                  >
                    {/* Card Top */}
                    <div className={styles.cardTop}>
                      {profile.newMatch && (
                        <span className={styles.newBadge}>
                          New match
                        </span>
                      )}
                    </div>

                    {/* Photo */}
                    <div className={styles.photoWrapper}>
                      <Link
                        href={`/profile/${profile.id}`}
                        className={styles.profilePhoto}
                      >
                        {profile.photo ? (
                          <img
                            src={profile.photo}
                            alt={profile.name}
                          />
                        ) : (
                          <span>{profile.initials}</span>
                        )}

                        {profile.online && (
                          <span
                            className={styles.onlineDot}
                          />
                        )}
                      </Link>

                      <div className={styles.matchBadge}>
                        <FiHeart
                          aria-hidden="true"
                          fill="currentColor"
                        />

                        <strong>
                          {profile.compatibility}%
                        </strong>

                        <span>match</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={styles.cardContent}>
                      {/* Name */}
                      <div className={styles.nameRow}>
                        <Link
                          href={`/profile/${profile.id}`}
                        >
                          <h3>{profile.name}</h3>
                        </Link>

                        {profile.verified && (
                          <span
                            className={styles.verifiedIcon}
                            title="Verified profile"
                          >
                            <FiCheck aria-hidden="true" />
                          </span>
                        )}
                      </div>

                      {/* Basic Information */}
                      <div className={styles.basicInfo}>
                        <span>{profile.age} years</span>
                        <span>/</span>
                        {/* <span>{profile.height}</span> */}
                        {/* <span>•</span> */}
                        <span>
                          {profile.maritalStatus}
                        </span>
                      </div>

                      {/* Location */}
                      <div className={styles.location}>
                        <FiMapPin aria-hidden="true" />
                        <span>{profile.location}</span>
                      </div>

                      {/* Profession */}
                      <div className={styles.profession}>
                        <FiUser aria-hidden="true" />
                        <span>{profile.profession}</span>
                      </div>

                      {/* Education */}
                      <div className={styles.profileDetails}>
                        <span>{profile.education}</span>
                        <span>{profile.religionabout}</span>
                      </div>

                      {/* About */}
                      {/* <p className={styles.about}>
                        {profile.about}
                      </p> */}

                      {/* Actions */}
                      <div className={styles.cardActions}>
                        {/* Shortlist */}
                       

                        {/* View Profile */}
                        <Link
                          href={`/profile/${profile.id}`}
                          className={styles.viewProfile}
                        >
                          View profile
                        </Link>

                        {/* Message */}

                        <button
                          type="button"
                          className={`${styles.shortlistButton} ${
                            isShortlisted
                              ? styles.shortlisted
                              : ""
                          }`}
                          onClick={() =>
                            toggleShortlist(profile.id)
                          }
                          aria-label={
                            isShortlisted
                              ? `Remove ${profile.name} from shortlist`
                              : `Add ${profile.name} to shortlist`
                          }
                          title={
                            isShortlisted
                              ? "Remove from shortlist"
                              : "Add to shortlist"
                          }
                        >
                          <FiHeart
                            aria-hidden="true"
                            fill={
                              isShortlisted
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                        {/* Call */}
                        {cleanMobile && (
                          <a
                            href={`tel:${cleanMobile}`}
                            className={styles.callButton}
                            aria-label={`Call ${profile.name}`}
                            title={`Call ${profile.name}`}
                          >
                            <FiPhone aria-hidden="true" />
                          </a>
                        )}

                        {/* WhatsApp */}
                        {cleanMobile && (
                          <a
                            href={`https://wa.me/${cleanMobile}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.whatsappButton}
                            aria-label={`WhatsApp ${profile.name}`}
                            title={`WhatsApp ${profile.name}`}
                          >
                            <Image src="/public/images/logo/whatsapp.png" alt="WhatsApp" width={20} height={20} />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          /* Empty Results */
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FiUsers aria-hidden="true" />
            </div>

            <h2>No matches found</h2>

            <p>
              We couldn&apos;t find any profiles matching your
              preferences above 50%. Try updating your
              preferences.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveTab("all");
              }}
            >
              View all matches
            </button>
          </section>
        )}

        {/* Bottom CTA */}
        <section className={styles.preferenceCard}>
          <div className={styles.preferenceIcon}>
            <FiHeart aria-hidden="true" />
          </div>

          <div>
            <strong>Not finding the right matches?</strong>

            <p>
              Update your partner preferences to discover
              profiles that better match what you&apos;re
              looking for.
            </p>
          </div>

          <Link href="/dashboard/preferences">
            Update preferences
            <FiChevronDown aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}