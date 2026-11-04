"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFavorites } from "@/components/FavoritesProvider/FavoritesProvider";

import {
  FiCheck,
  FiChevronDown,
  FiHeart,
  FiMapPin,
  FiPhone,
  FiSearch,
  FiShield,
  FiUsers,
  FiMessageCircle,
  FiUnlock,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

import styles from "./matches.module.scss";

type MatchProfile = {
  religionabout: string;
  id: string;
  name: string;
  age: number;
  location: string;
  profession: string;
  cast?: string;
  education: string;
  compatibility: number;
  initials: string;
  photo?: string | null;
  verified: boolean;
  online: boolean;
  height: string;
  maritalStatus: string;
  newMatch: boolean;
  about: string;
};

type Tab = "all" | "high" | "new";

type ApiResponse = {
  success: boolean;
  message?: string;
  users: MatchProfile[];
};

type ContactBalance = {
  freeTotal: number;
  freeUsed: number;
  freeRemaining: number;
  contactCredits: number;
  premiumActive: boolean;
  premiumUntil: string | null;
  totalAvailable: number | "unlimited";
  unlockedCount: number;
};

type ContactUnlockResponse = {
  success: boolean;
  message?: string;
  mobile?: string;
  profile?: {
    mobile?: string;
    name?: string;
  };
  alreadyUnlocked?: boolean;
};

// Cache matches while navigating within the website.
let matchesCache: MatchProfile[] | null = null;
let matchesRequest: Promise<MatchProfile[]> | null = null;

async function getCachedMatches(
  forceRefresh = false,
): Promise<MatchProfile[]> {
  if (!forceRefresh && matchesCache !== null) {
    return matchesCache;
  }

  if (!forceRefresh && matchesRequest) {
    return matchesRequest;
  }

  const request = (async () => {
    const response = await fetch("/api/matches", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });

    const data = (await response.json()) as ApiResponse;

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load matches");
    }

    const users: MatchProfile[] = Array.isArray(data.users)
      ? data.users
      : [];

    matchesCache = users;
    return users;
  })();

  matchesRequest = request;

  try {
    return await request;
  } finally {
    if (matchesRequest === request) {
      matchesRequest = null;
    }
  }
}

export default function MatchesPage() {
  const [profiles, setProfiles] = useState<MatchProfile[]>(
    () => matchesCache ?? [],
  );

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("compatibility");

  const { isFavorite, toggleFavorite } = useFavorites();

  const [loading, setLoading] = useState(
    () => matchesCache === null,
  );

  const [error, setError] = useState("");

  // Contact unlock states
  const [contactBalance, setContactBalance] =
    useState<ContactBalance | null>(null);

  const [contactLoading, setContactLoading] = useState(false);
  const [unlockingProfileId, setUnlockingProfileId] = useState("");

  const [contactError, setContactError] = useState("");

  const [contactDialog, setContactDialog] = useState(false);
  const [plansDialog, setPlansDialog] = useState(false);

  const [selectedContact, setSelectedContact] = useState<{
    name: string;
    mobile: string;
  } | null>(null);

  /*
   * Load matches
   */
  useEffect(() => {
    let mounted = true;

    async function loadMatches() {
      try {
        setError("");

        if (matchesCache !== null) {
          setProfiles(matchesCache);
          setLoading(false);
          return;
        }

        setLoading(true);

        const users = await getCachedMatches();

        if (mounted) {
          setProfiles(users);
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

    void loadMatches();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Load contact balance
   */
  useEffect(() => {
    let mounted = true;

    async function loadContactBalance() {
      try {
        const response = await fetch("/api/contacts/balance", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (mounted && response.ok && data.success) {
          setContactBalance(data.balance);
        }
      } catch (err) {
        console.error("CONTACT_BALANCE_ERROR:", err);
      }
    }

    void loadContactBalance();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Refresh contact balance
   */
  const refreshContactBalance = async () => {
    try {
      const response = await fetch("/api/contacts/balance", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setContactBalance(data.balance);
      }
    } catch (err) {
      console.error("CONTACT_BALANCE_REFRESH_ERROR:", err);
    }
  };

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
          String(value ?? "").toLowerCase().includes(query),
        ),
      );
    }

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
   * Retry
   */
  const handleRetry = async () => {
    try {
      setLoading(true);
      setError("");

      const users = await getCachedMatches(true);
      setProfiles(users);
    } catch (err) {
      console.error("MATCHES_RETRY_ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load matches. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Favorite
   */
  const handleFavoriteToggle = async (id: string) => {
    try {
      await toggleFavorite(id);
    } catch (err) {
      console.error("MATCHES_FAVORITE_ERROR:", err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update favorites. Please try again.",
      );
    }
  };

  /*
   * Contact unlock
   */

  const handleUnlockContact = async (profile: MatchProfile) => {
    if (unlockingProfileId) return;
  
    setContactError("");
    setSelectedContact(null);
    setUnlockingProfileId(profile.id);
  
    let showLoaderForTwoSeconds = false;
    let unlockStartedAt = 0;
  
    try {
      const response = await fetch("/api/contacts/unlock", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: profile.id,
        }),
      });
  
      const data =
        (await response.json()) as ContactUnlockResponse;
  
      // Credits khatam hone par loader nahi dikhana.
      if (response.status === 402) {
        await refreshContactBalance();
        setPlansDialog(true);
        return;
      }
  
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to unlock this contact.",
        );
      }
  
      const mobile = String(
        data.profile?.mobile || data.mobile || "",
      ).replace(/\D/g, "");
  
      if (!mobile) {
        throw new Error(
          "Contact unlocked, but mobile number was not returned by the API.",
        );
      }
  
      // Successful unlock ke baad 2-second loader start hoga.
      unlockStartedAt = Date.now();
      showLoaderForTwoSeconds = true;
  
      setSelectedContact({
        name: data.profile?.name || profile.name,
        mobile,
      });
  
      await refreshContactBalance();
  
    } catch (err) {
      console.error("MATCHES_CONTACT_UNLOCK_ERROR:", err);
  
      setContactError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      if (showLoaderForTwoSeconds) {
        const elapsed = Date.now() - unlockStartedAt;
        const remainingTime = Math.max(0, 1000 - elapsed);
  
        await new Promise((resolve) =>
          setTimeout(resolve, remainingTime),
        );
      }
  
      setUnlockingProfileId("");
  
      if (showLoaderForTwoSeconds) {
        setContactDialog(true);
      }
    }
  };
  

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className={styles.container}>
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

        <div className={styles.container}>
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FiUsers aria-hidden="true" />
            </div>

            <h2>Unable to load matches</h2>
            <p>{error}</p>

            <button type="button" onClick={handleRetry}>
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
              Matches made for you
            </span>

            <h1>Matches made for you</h1>

            <p>
              Discover profiles that align with your preferences
              and what you&apos;re looking for.
            </p>
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
                onChange={(event) => setSortBy(event.target.value)}
                aria-label="Sort matches"
              >
                <option value="compatibility">Compatibility</option>
                <option value="newest">New matches</option>
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
            className={activeTab === "all" ? styles.activeTab : ""}
            onClick={() => setActiveTab("all")}
          >
            All matches <span>{totalMatches}</span>
          </button>

          <button
            type="button"
            className={activeTab === "high" ? styles.activeTab : ""}
            onClick={() => setActiveTab("high")}
          >
            Highly compatible <span>{highMatches}</span>
          </button>

          <button
            type="button"
            className={activeTab === "new" ? styles.activeTab : ""}
            onClick={() => setActiveTab("new")}
          >
            New matches <span>{newMatches}</span>
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

        {/* Contact balance */}
        {contactBalance && (
          <div className={styles.contactBalanceBar}>
            <div>
              <FiUnlock aria-hidden="true" />
              <span>
                {contactBalance.premiumActive
                  ? "Unlimited contact unlocks active"
                  : `${contactBalance.freeRemaining} free + ${contactBalance.contactCredits} pack credits`}
              </span>
            </div>

            <Link href="/contact-plans">
              View plans
            </Link>
          </div>
        )}

        {contactError && (
          <div className={styles.contactError}>
            <FiAlertCircle />
            <span>{contactError}</span>
            <button
              type="button"
              onClick={() => setContactError("")}
              aria-label="Dismiss error"
            >
              <FiX />
            </button>
          </div>
        )}

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

                <span>{filteredProfiles.length} profiles</span>
              </div>
            </div>

            <div className={styles.profileGrid}>
              {filteredProfiles.map((profile) => {
                const isShortlisted = isFavorite(profile.id);
                const isUnlocking = unlockingProfileId === profile.id;

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
                          <span className={styles.onlineDot} />
                        )}
                      </Link>

                      <div className={styles.matchBadge}>
                        <FiHeart
                          aria-hidden="true"
                          fill="currentColor"
                        />

                        <strong>{profile.compatibility}%</strong>
                        <span>match</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={styles.cardContent}>
                      {/* Name */}
                      <div className={styles.nameRow}>
                        <Link href={`/profile/${profile.id}`}>
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

                        {profile.cast?.trim() && (
                          <>
                            <span>•</span>
                            <span>{profile.cast}</span>
                          </>
                        )}
                      </div>

                      {/* Location */}
                      <div className={styles.location}>
                        <FiMapPin aria-hidden="true" />
                        <span>{profile.location}</span>
                      </div>

                      {/* Education & Religion */}
                      {(profile.education?.trim() ||
                        profile.religionabout?.trim()) && (
                        <div className={styles.profileDetails}>
                          {profile.education?.trim() && (
                            <span>{profile.education}</span>
                          )}

                          {profile.religionabout?.trim() && (
                            <span>{profile.religionabout}</span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className={styles.cardActions}>
                        <Link
                          href={`/profile/${profile.id}`}
                          className={styles.viewProfile}
                        >
                          View profile
                        </Link>

                        <button
                          type="button"
                          className={`${styles.shortlistButton} ${
                            isShortlisted ? styles.shortlisted : ""
                          }`}
                          onClick={() => handleFavoriteToggle(profile.id)}
                          aria-label={
                            isShortlisted
                              ? `Remove ${profile.name} from favorites`
                              : `Add ${profile.name} to favorites`
                          }
                          title={
                            isShortlisted
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                        >
                          <FiHeart
                            aria-hidden="true"
                            fill={isShortlisted ? "currentColor" : "none"}
                          />
                        </button>

                        {/* Contact unlock */}
                        <button
                          type="button"
                          className={styles.callButton}
                          disabled={Boolean(unlockingProfileId)}
                          onClick={() => handleUnlockContact(profile)}
                          aria-label={`Unlock contact of ${profile.name}`}
                          title={`Unlock contact of ${profile.name}`}
                        >
                          {isUnlocking ? (
                            <span className={styles.buttonSpinner} />
                          ) : (
                            <FiPhone aria-hidden="true" />
                          )}
                        </button>

                        <button
                          type="button"
                          className={styles.whatsappButton}
                          disabled={Boolean(unlockingProfileId)}
                          onClick={() => handleUnlockContact(profile)}
                          aria-label={`Unlock WhatsApp of ${profile.name}`}
                          title={`Unlock WhatsApp of ${profile.name}`}
                        >
                          <FiMessageCircle aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FiUsers aria-hidden="true" />
            </div>

            <h2>No matches found</h2>

            <p>
              We couldn&apos;t find any profiles matching your
              preferences above 50%. Try updating your preferences.
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
      </div>

      {/* Unlock loader */}
      {unlockingProfileId && (
        <div className={styles.contactOverlay}>
          <div className={styles.contactLoader}>
            <div className={styles.loaderSpinner} />
            <h3>Unlocking contact...</h3>
            <p>Please wait while we securely retrieve the contact details.</p>
          </div>
        </div>
      )}

      {/* Contact success dialog */}
      {contactDialog && selectedContact && (
        <div
          className={styles.contactOverlay}
          onClick={() => setContactDialog(false)}
        >
          <section
            className={styles.contactDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.dialogClose}
              onClick={() => setContactDialog(false)}
              aria-label="Close dialog"
            >
              <FiX />
            </button>

            <div className={styles.contactSuccessIcon}>
              <FiCheck />
            </div>

            <span className={styles.contactEyebrow}>
              CONTACT UNLOCKED
            </span>

            <h2 id="contact-dialog-title">
              {selectedContact.name}
            </h2>

            <p>
              Contact details are now available. Start a conversation
              and take the next step.
            </p>

            <div className={styles.mobileNumber}>
              <FiPhone />
              <strong>{selectedContact.mobile}</strong>
            </div>

            <div className={styles.contactActions}>
              <a
                href={`tel:${selectedContact.mobile}`}
                className={styles.dialogCallButton}
              >
                <FiPhone />
                Call Now
              </a>

              <a
                href={`https://wa.me/${selectedContact.mobile}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.dialogWhatsAppButton}
              >
                <FiMessageCircle />
                WhatsApp
              </a>
            </div>

            <button
              type="button"
              className={styles.dialogSecondaryButton}
              onClick={() => setContactDialog(false)}
            >
              Done
            </button>
          </section>
        </div>
      )}

      {/* Plans dialog */}
      {plansDialog && (
        <div
          className={styles.contactOverlay}
          onClick={() => setPlansDialog(false)}
        >
          <section
            className={styles.contactDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="plans-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.dialogClose}
              onClick={() => setPlansDialog(false)}
              aria-label="Close dialog"
            >
              <FiX />
            </button>

            <div className={styles.contactPlanIcon}>
              <FiUnlock />
            </div>

            <span className={styles.contactEyebrow}>
              CONTACT LIMIT REACHED
            </span>

            <h2 id="plans-dialog-title">
              Continue connecting
            </h2>

            <p>
              You have used your available contact unlocks.
              Choose a plan to unlock more profiles.
            </p>

            <div className={styles.planOptions}>
              <div>
                <strong>Contact Pack · ₹50</strong>
                <span>Get 20 additional contact unlocks.</span>
              </div>

              <div>
                <strong>Monthly Premium · ₹100</strong>
                <span>Unlimited contact unlocks for 30 days.</span>
              </div>
            </div>

            <Link
              href="/contact-plans"
              className={styles.dialogPrimaryButton}
            >
              View Contact Plans
            </Link>

            <button
              type="button"
              className={styles.dialogSecondaryButton}
              onClick={() => setPlansDialog(false)}
            >
              Maybe later
            </button>
          </section>
        </div>
      )}
    </main>
  );
}