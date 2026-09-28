"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiSearch,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import styles from "./matches.module.scss";

type MatchProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  profession: string;
  education: string;
  compatibility: number;
  initials: string;
  verified: boolean;
  online: boolean;
  height: string;
  maritalStatus: string;
  phone: string;
  newMatch: boolean;
  about: string;
};

const matchProfiles: MatchProfile[] = [
  {
    id: "ananya-sharma",
    name: "Ananya Sharma",
    age: 28,
    location: "Toronto, Canada",
    profession: "Product Designer",
    education: "Master's Degree",
    compatibility: 94,
    initials: "AS",
    verified: true,
    online: true,
    height: "5'5\"",
    maritalStatus: "Never married",
    phone: "+14165550123",
    newMatch: true,
    about:
      "Creative, positive and family-oriented. Enjoys meaningful conversations, travel, photography and discovering new places.",
  },
  {
    id: "priya-mehta",
    name: "Priya Mehta",
    age: 27,
    location: "Vancouver, Canada",
    profession: "Software Engineer",
    education: "Bachelor's Degree",
    compatibility: 91,
    initials: "PM",
    verified: true,
    online: false,
    height: "5'4\"",
    maritalStatus: "Never married",
    phone: "+16045550123",
    newMatch: true,
    about:
      "Calm, ambitious and caring. Loves technology, books, weekend trips and spending quality time with family.",
  },
  {
    id: "meera-kapoor",
    name: "Meera Kapoor",
    age: 29,
    location: "Brampton, Canada",
    profession: "Marketing Manager",
    education: "Master's Degree",
    compatibility: 88,
    initials: "MK",
    verified: true,
    online: true,
    height: "5'6\"",
    maritalStatus: "Never married",
    phone: "+19055550123",
    newMatch: false,
    about:
      "Warm, outgoing and thoughtful. Enjoys music, cooking, fitness and exploring different cultures.",
  },
  {
    id: "riya-patel",
    name: "Riya Patel",
    age: 26,
    location: "Mississauga, Canada",
    profession: "Financial Analyst",
    education: "Bachelor's Degree",
    compatibility: 86,
    initials: "RP",
    verified: false,
    online: false,
    height: "5'3\"",
    maritalStatus: "Never married",
    phone: "+19055550124",
    newMatch: true,
    about:
      "Friendly and practical with a positive outlook. Enjoys movies, travel, fitness and spending time with loved ones.",
  },
  {
    id: "neha-verma",
    name: "Neha Verma",
    age: 30,
    location: "Ottawa, Canada",
    profession: "HR Manager",
    education: "Master's Degree",
    compatibility: 84,
    initials: "NV",
    verified: true,
    online: true,
    height: "5'5\"",
    maritalStatus: "Never married",
    phone: "+16135550123",
    newMatch: false,
    about:
      "Kind, independent and family-focused. Loves reading, coffee, travelling and meaningful conversations.",
  },
  {
    id: "simran-kaur",
    name: "Simran Kaur",
    age: 28,
    location: "Calgary, Canada",
    profession: "Business Analyst",
    education: "Bachelor's Degree",
    compatibility: 82,
    initials: "SK",
    verified: true,
    online: false,
    height: "5'6\"",
    maritalStatus: "Never married",
    phone: "+14035550123",
    newMatch: false,
    about:
      "Easygoing and optimistic. Enjoys hiking, music, photography and building a balanced lifestyle.",
  },
];

type Tab = "all" | "high" | "new";

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("compatibility");

  const [shortlisted, setShortlisted] = useState<string[]>(
    [],
  );

  const [interestsSent, setInterestsSent] = useState<
    string[]
  >([]);

  const filteredProfiles = useMemo(() => {
    let profiles = [...matchProfiles];

    if (activeTab === "high") {
      profiles = profiles.filter(
        (profile) => profile.compatibility >= 90,
      );
    }

    if (activeTab === "new") {
      profiles = profiles.filter(
        (profile) => profile.newMatch,
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      profiles = profiles.filter((profile) =>
        [
          profile.name,
          profile.location,
          profile.profession,
          profile.education,
        ].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
    }

    profiles.sort((a, b) => {
      if (sortBy === "compatibility") {
        return b.compatibility - a.compatibility;
      }

      if (sortBy === "newest") {
        return Number(b.newMatch) - Number(a.newMatch);
      }

      return a.name.localeCompare(b.name);
    });

    return profiles;
  }, [activeTab, search, sortBy]);

  const toggleShortlist = (id: string) => {
    setShortlisted((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const sendInterest = (id: string) => {
    setInterestsSent((current) =>
      current.includes(id)
        ? current
        : [...current, id],
    );
  };

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
              Discover profiles that align with your
              preferences and what you&apos;re looking for.
            </p>
          </div>

          <div className={styles.headerStats}>
            <div>
              <strong>24</strong>
              <span>Total matches</span>
            </div>

            <div>
              <strong>8</strong>
              <span>New matches</span>
            </div>

            <div>
              <strong>5</strong>
              <span>90%+ compatible</span>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className={styles.controls}>
          <div className={styles.searchBox}>
            <FiSearch aria-hidden="true" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
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
            className={
              activeTab === "all" ? styles.activeTab : ""
            }
            onClick={() => setActiveTab("all")}
          >
            All matches
            <span>{matchProfiles.length}</span>
          </button>

          <button
            type="button"
            className={
              activeTab === "high" ? styles.activeTab : ""
            }
            onClick={() => setActiveTab("high")}
          >
            Highly compatible
            <span>5</span>
          </button>

          <button
            type="button"
            className={
              activeTab === "new" ? styles.activeTab : ""
            }
            onClick={() => setActiveTab("new")}
          >
            New matches
            <span>4</span>
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
              Compatibility is calculated from profile
              information and preferences. You&apos;re always
              in control of who you connect with.
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
                const isShortlisted =
                  shortlisted.includes(profile.id);

                const interestSent =
                  interestsSent.includes(profile.id);

                return (
                  <article
                    key={profile.id}
                    className={styles.profileCard}
                  >
                    <div className={styles.cardTop}>
                      {profile.newMatch && (
                        <span className={styles.newBadge}>
                          New match
                        </span>
                      )}

                      <button
                        type="button"
                        className={`${styles.starButton} ${
                          isShortlisted
                            ? styles.starred
                            : ""
                        }`}
                        onClick={() =>
                          toggleShortlist(profile.id)
                        }
                        aria-label={
                          isShortlisted
                            ? "Remove from shortlist"
                            : "Add to shortlist"
                        }
                      >
                        <FiStar
                          aria-hidden="true"
                          fill={
                            isShortlisted
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    </div>

                    <div className={styles.photoWrapper}>
                      <Link
                        href={`/profile/${profile.id}`}
                        className={styles.profilePhoto}
                      >
                        <span>{profile.initials}</span>

                        {profile.online && (
                          <span
                            className={
                              styles.onlineDot
                            }
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

                    <div className={styles.cardContent}>
                      <div className={styles.nameRow}>
                        <Link
                          href={`/profile/${profile.id}`}
                        >
                          <h3>{profile.name}</h3>
                        </Link>

                        {profile.verified && (
                          <span
                            className={
                              styles.verifiedIcon
                            }
                            title="Verified profile"
                          >
                            <FiCheck
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </div>

                      <div className={styles.basicInfo}>
                        <span>
                          {profile.age} years
                        </span>
                        <span>•</span>
                        <span>
                          {profile.height}
                        </span>
                        <span>•</span>
                        <span>
                          {profile.maritalStatus}
                        </span>
                      </div>

                      <div className={styles.location}>
                        <FiMapPin
                          aria-hidden="true"
                        />
                        <span>
                          {profile.location}
                        </span>
                      </div>

                      <div className={styles.profession}>
                        <FiUser
                          aria-hidden="true"
                        />
                        <span>
                          {profile.profession}
                        </span>
                      </div>

                      <div className={styles.education}>
                        <span>
                          {profile.education}
                        </span>
                      </div>

                      <p className={styles.about}>
                        {profile.about}
                      </p>

                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={`${
                            styles.interestButton
                          } ${
                            interestSent
                              ? styles.interestSent
                              : ""
                          }`}
                          onClick={() =>
                            sendInterest(profile.id)
                          }
                        >
                          <FiHeart
                            aria-hidden="true"
                            fill={
                              interestSent
                                ? "currentColor"
                                : "none"
                            }
                          />

                          <span>
                            {interestSent
                              ? "Sent"
                              : "Interest"}
                          </span>
                        </button>

                        <Link
                          href="/messages"
                          className={
                            styles.messageButton
                          }
                          aria-label={`Message ${profile.name}`}
                        >
                          <FiMessageCircle
                            aria-hidden="true"
                          />
                        </Link>

                        <a
                          href={`tel:${profile.phone}`}
                          className={styles.callButton}
                          aria-label={`Call ${profile.name}`}
                        >
                          <FiPhone
                            aria-hidden="true"
                          />
                        </a>

                        <a
                          href={`https://wa.me/${profile.phone.replace(
                            /\D/g,
                            "",
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={
                            styles.whatsappButton
                          }
                          aria-label={`WhatsApp ${profile.name}`}
                        >
                          <FiMessageCircle
                            aria-hidden="true"
                          />
                        </a>
                      </div>

                      <Link
                        href={`/profile/${profile.id}`}
                        className={styles.viewProfile}
                      >
                        <span>View full profile</span>
                        <FiChevronDown
                          aria-hidden="true"
                        />
                      </Link>
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
              Try changing your search or exploring all
              matches.
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
            <FiChevronDown
              aria-hidden="true"
            />
          </Link>
        </section>
      </div>
    </main>
  );
}
