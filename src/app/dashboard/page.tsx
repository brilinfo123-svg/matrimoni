"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  FiArrowRight,
  FiBell,
  FiBriefcase,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
  FiMoreHorizontal,
  FiSearch,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import styles from "./dashboard.module.scss";

type Profile = {
  id: string;
  name: string;
  age: number;
  city: string;
  state?: string;
  profession: string;
  education?: string;
  compatibility: number;
  initials: string;
  verified: boolean;
  online: boolean;
  photo?: string;
  maritalStatus?: string;
};

type DashboardUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  mobile: string;
  initials: string;
  age: number;
  gender: string;
  city: string;
  state: string;
  religion: string;
  motherTongue: string;
  maritalStatus: string;
  education: string;
  profession: string;
  company: string;
  income: string;
  profileFor: string;
  photos: string[];
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isProfileComplete: boolean;
  completion: number;
};

type DashboardStats = {
  newInterests: number;
  shortlisted: number;
  unreadMessages: number;
  profileViews: number;
};

type InsightBar = {
  day: string;
  value: number;
};

type DashboardData = {
  user: DashboardUser;
  stats: DashboardStats;
  recommendedProfiles: Profile[];
  recentMessages: any[];
  insights: {
    profileViews: number;
    growth: number;
    bars: InsightBar[];
  };
};

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/dashboard",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const data =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load dashboard.",
          );
        }

        setDashboard(data);
      } catch (error) {
        console.error(
          "DASHBOARD_LOAD_ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />

        <div className={styles.container}>
          <div className={styles.dashboardHeader}>
            <div>
              <span
                className={styles.eyebrow}
              >
                Your matrimonial journey
              </span>

              <h1>
                Loading your dashboard...
              </h1>

              <p>
                Please wait while we load
                your profile.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !dashboard) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />

        <div className={styles.container}>
          <section
            className={styles.privacyNote}
          >
            <div
              className={styles.privacyIcon}
            >
              <FiShield aria-hidden="true" />
            </div>

            <div>
              <strong>
                Unable to load dashboard
              </strong>

              <p>
                {error ||
                  "Something went wrong."}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className={
                styles.completionButton
              }
            >
              Try again
              <FiArrowRight
                aria-hidden="true"
              />
            </button>
          </section>
        </div>
      </main>
    );
  }

  const { user, stats, recommendedProfiles, insights } =
    dashboard;

  const firstName =
    user.firstName || "there";

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <div className={styles.container}>
        {/* =========================================
            TOP HEADER
        ========================================= */}

        <header
          className={
            styles.dashboardHeader
          }
        >
          <div>
            <span
              className={styles.eyebrow}
            >
              Your matrimonial journey
            </span>

            <h1>
              Good morning,
              <span> {firstName}.</span>
            </h1>

            <p>
              Here&apos;s what&apos;s happening
              with your profile today.
            </p>
          </div>

          <div
            className={styles.headerActions}
          >
            <Link
              href="/search"
              className={
                styles.searchButton
              }
            >
              <FiSearch aria-hidden="true" />
              <span>Discover</span>
            </Link>

            <button
              type="button"
              className={
                styles.notificationButton
              }
              aria-label="Notifications"
            >
              <FiBell aria-hidden="true" />

              {stats.unreadMessages > 0 && (
                <span
                  className={
                    styles.notificationDot
                  }
                />
              )}
            </button>

            <Link
              href={`/profile/${user.id}`}
              className={styles.avatar}
              aria-label="Open profile"
            >
              {user.initials}
            </Link>
          </div>
        </header>

        {/* =========================================
            PROFILE COMPLETION
        ========================================= */}

        <section
          className={
            styles.completionCard
          }
        >
          <div
            className={
              styles.completionMain
            }
          >
            <div
              className={
                styles.completionIcon
              }
            >
              <FiUser aria-hidden="true" />
            </div>

            <div
              className={
                styles.completionText
              }
            >
              <div
                className={
                  styles.completionTitleRow
                }
              >
                <h2>
                  Complete your profile
                </h2>

                <strong>
                  {user.completion}%
                </strong>
              </div>

              <p>
                A complete profile gives
                people more context about you
                and helps personalize your
                recommendations.
              </p>

              <div
                className={
                  styles.completionTrack
                }
              >
                <span
                  style={{
                    width: `${user.completion}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <Link
            href="/profile/edit"
            className={
              styles.completionButton
            }
          >
            {user.completion >= 100
              ? "View profile"
              : "Complete profile"}

            <FiArrowRight
              aria-hidden="true"
            />
          </Link>
        </section>

        {/* =========================================
            QUICK STATS
        ========================================= */}

        <section
          className={styles.statsGrid}
        >
          <StatCard
            icon={
              <FiHeart aria-hidden="true" />
            }
            label="New interests"
            value={String(
              stats.newInterests,
            )}
            detail="Connection requests"
            href="/interests"
          />

          <StatCard
            icon={
              <FiStar aria-hidden="true" />
            }
            label="Shortlisted"
            value={String(
              stats.shortlisted,
            )}
            detail="Profiles saved"
            href="/shortlist"
          />

          <StatCard
            icon={
              <FiMessageCircle aria-hidden="true" />
            }
            label="Unread messages"
            value={String(
              stats.unreadMessages,
            )}
            detail="Unread conversations"
            href="/messages"
          />

          <StatCard
            icon={
              <FiUsers aria-hidden="true" />
            }
            label="Profile views"
            value={String(
              stats.profileViews,
            )}
            detail="People viewed you"
            href={`/profile/${user.id}`}
          />
        </section>

        {/* =========================================
            VERIFICATION + QUICK ACTIONS
        ========================================= */}

        <section
          className={styles.actionGrid}
        >
          <div
            className={
              styles.verificationCard
            }
          >
            <div
              className={styles.cardHeader}
            >
              <div>
                <span
                  className={
                    styles.cardEyebrow
                  }
                >
                  Trust & safety
                </span>

                <h2>
                  Verify your profile
                </h2>
              </div>

              <div
                className={
                  styles.verifiedIcon
                }
              >
                <FiShield aria-hidden="true" />
              </div>
            </div>

            <p>
              Verification can help people
              understand that your profile
              information has been reviewed.
            </p>

            <div
              className={
                styles.verificationSteps
              }
            >
              <VerificationItem
                completed={
                  user.isEmailVerified
                }
                label="Email verified"
              />

              <VerificationItem
                completed={
                  user.isMobileVerified
                }
                label="Phone verified"
              />

              <VerificationItem
                label="Identity verification"
              />
            </div>

            <Link
              href="/verification"
              className={
                styles.outlineButton
              }
            >
              <span>
                View verification
              </span>

              <FiArrowRight
                aria-hidden="true"
              />
            </Link>
          </div>

          <div
            className={styles.quickCard}
          >
            <div
              className={styles.cardHeader}
            >
              <div>
                <span
                  className={
                    styles.cardEyebrow
                  }
                >
                  Quick actions
                </span>

                <h2>
                  Keep exploring
                </h2>
              </div>

              <FiMoreHorizontal
                className={
                  styles.moreIcon
                }
                aria-hidden="true"
              />
            </div>

            <div
              className={
                styles.quickActions
              }
            >
              <QuickAction
                href="/search"
                icon={
                  <FiSearch aria-hidden="true" />
                }
                title="Discover"
                description="Find new profiles"
              />

              <QuickAction
                href="/matches"
                icon={
                  <FiHeart aria-hidden="true" />
                }
                title="Matches"
                description="See compatible profiles"
              />

              <QuickAction
                href="/interests"
                icon={
                  <FiUsers aria-hidden="true" />
                }
                title="Interests"
                description="Manage connections"
              />

              <QuickAction
                href="/profile/edit"
                icon={
                  <FiUser aria-hidden="true" />
                }
                title="Edit profile"
                description="Update your details"
              />
            </div>
          </div>
        </section>

        {/* =========================================
            MY PROFILE SUMMARY
        ========================================= */}

        <section
          className={styles.section}
        >
          <div
            className={styles.sectionHeader}
          >
            <div>
              <span
                className={
                  styles.cardEyebrow
                }
              >
                Your profile
              </span>

              <h2>
                {user.name}
              </h2>

              <p>
                {user.age > 0
                  ? `${user.age} years old`
                  : "Age not added"}
                {user.city
                  ? ` • ${user.city}`
                  : ""}
                {user.profession
                  ? ` • ${user.profession}`
                  : ""}
              </p>
            </div>

            <Link
              href={`/profile/${user.id}`}
              className={styles.viewAll}
            >
              View profile
              <FiArrowRight
                aria-hidden="true"
              />
            </Link>
          </div>

          <div
            className={styles.profileGrid}
          >
            <MyProfileCard
              user={user}
            />
          </div>
        </section>

        {/* =========================================
            RECOMMENDED PROFILES
        ========================================= */}

        <section
          className={styles.section}
        >
          <div
            className={styles.sectionHeader}
          >
            <div>
              <span
                className={
                  styles.cardEyebrow
                }
              >
                Personalized for you
              </span>

              <h2>
                Recommended profiles
              </h2>

              <p>
                Based on your profile and
                current preferences.
              </p>
            </div>

            <Link
              href="/matches"
              className={styles.viewAll}
            >
              View all
              <FiArrowRight
                aria-hidden="true"
              />
            </Link>
          </div>

          {recommendedProfiles.length >
          0 ? (
            <div
              className={
                styles.profileGrid
              }
            >
              {recommendedProfiles.map(
                (profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                  />
                ),
              )}
            </div>
          ) : (
            <div
              className={
                styles.privacyNote
              }
            >
              <div
                className={
                  styles.privacyIcon
                }
              >
                <FiUsers
                  aria-hidden="true"
                />
              </div>

              <div>
                <strong>
                  No recommendations yet
                </strong>

                <p>
                  Complete your profile and
                  partner preferences to get
                  personalized matches.
                </p>
              </div>

              <Link
                href="/profile/edit"
              >
                Update profile
                <FiArrowRight
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}
        </section>

        {/* =========================================
            BOTTOM GRID
        ========================================= */}

        <section
          className={styles.bottomGrid}
        >
          {/* Messages */}

          <div
            className={
              styles.messagesCard
            }
          >
            <div
              className={styles.sectionHeader}
            >
              <div>
                <span
                  className={
                    styles.cardEyebrow
                  }
                >
                  Stay connected
                </span>

                <h2>
                  Recent messages
                </h2>
              </div>

              <Link
                href="/messages"
                className={styles.viewAll}
              >
                See all
                <FiChevronRight
                  aria-hidden="true"
                />
              </Link>
            </div>

            {dashboard.recentMessages
              .length > 0 ? (
              <div
                className={
                  styles.messageList
                }
              >
                {dashboard.recentMessages.map(
                  (message) => (
                    <Link
                      href={`/messages/${message.id}`}
                      className={
                        styles.messageItem
                      }
                      key={message.id}
                    >
                      <div
                        className={
                          styles.messageAvatar
                        }
                      >
                        {message.initials}
                      </div>

                      <div
                        className={
                          styles.messageContent
                        }
                      >
                        <div
                          className={
                            styles.messageTop
                          }
                        >
                          <strong>
                            {message.name}
                          </strong>

                          <span>
                            {message.time}
                          </span>
                        </div>

                        <p>
                          {message.message}
                        </p>
                      </div>

                      {message.unread && (
                        <span
                          className={
                            styles.unreadDot
                          }
                        />
                      )}
                    </Link>
                  ),
                )}
              </div>
            ) : (
              <div
                className={
                  styles.messageList
                }
              >
                <div
                  className={
                    styles.messageItem
                  }
                >
                  <div
                    className={
                      styles.messageAvatar
                    }
                  >
                    <FiMessageCircle />
                  </div>

                  <div
                    className={
                      styles.messageContent
                    }
                  >
                    <div
                      className={
                        styles.messageTop
                      }
                    >
                      <strong>
                        No messages yet
                      </strong>
                    </div>

                    <p>
                      Your conversations will
                      appear here.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/messages"
              className={
                styles.messagesButton
              }
            >
              Open messages
              <FiMessageCircle
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Profile insights */}

          <div
            className={
              styles.insightsCard
            }
          >
            <div
              className={styles.sectionHeader}
            >
              <div>
                <span
                  className={
                    styles.cardEyebrow
                  }
                >
                  Profile insights
                </span>

                <h2>
                  This week
                </h2>
              </div>

              <FiBriefcase
                className={
                  styles.insightIcon
                }
                aria-hidden="true"
              />
            </div>

            <div
              className={
                styles.insightHighlight
              }
            >
              <strong>
                {insights.profileViews}
              </strong>

              <span>
                profile views
              </span>

              {insights.growth > 0 && (
                <div
                  className={
                    styles.growth
                  }
                >
                  <FiArrowRight
                    aria-hidden="true"
                  />

                  <span>
                    {insights.growth}%
                  </span>
                </div>
              )}
            </div>

            <div
              className={
                styles.insightBars
              }
            >
              {insights.bars.map(
                (bar) => (
                  <InsightBar
                    key={bar.day}
                    day={bar.day}
                    value={bar.value}
                  />
                ),
              )}
            </div>

            <Link
              href={`/profile/${user.id}`}
              className={
                styles.insightLink
              }
            >
              View my profile
              <FiArrowRight
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>

        {/* =========================================
            PRIVACY NOTE
        ========================================= */}

        <section
          className={styles.privacyNote}
        >
          <div
            className={styles.privacyIcon}
          >
            <FiShield aria-hidden="true" />
          </div>

          <div>
            <strong>
              Your privacy stays in your
              hands
            </strong>

            <p>
              Manage profile visibility,
              contact preferences and privacy
              controls whenever you want.
            </p>
          </div>

          <Link href="/settings">
            Privacy settings
            <FiArrowRight
              aria-hidden="true"
            />
          </Link>
        </section>
      </div>
    </main>
  );
}

/* =========================================
   MY PROFILE CARD
========================================= */

function MyProfileCard({
  user,
}: {
  user: DashboardUser;
}) {
  return (
    <article
      className={styles.profileCard}
    >
      <Link
        href={`/profile/${user.id}`}
        className={styles.profileVisual}
      >
        {user.photos?.length > 0 ? (
          <img
            src={user.photos[0]}
            alt={user.name}
            className={styles.profileImage}
          />
        ) : (
          <div
            className={
              styles.profileInitials
            }
          >
            {user.initials}
          </div>
        )}

        <div
          className={
            styles.profileGradient
          }
        />

        {user.isEmailVerified &&
          user.isMobileVerified && (
            <span
              className={
                styles.profileVerified
              }
            >
              <FiCheck aria-hidden="true" />
              Verified
            </span>
          )}

        <span
          className={
            styles.compatibility
          }
        >
          <strong>
            {user.completion}%
          </strong>

          <small>
            profile
          </small>
        </span>
      </Link>

      <div
        className={styles.profileInfo}
      >
        <div
          className={
            styles.profileNameRow
          }
        >
          <Link
            href={`/profile/${user.id}`}
            className={
              styles.profileName
            }
          >
            {user.name}
          </Link>

          <Link
            href="/profile/edit"
            className={
              styles.favoriteButton
            }
            aria-label="Edit profile"
          >
            <FiUser aria-hidden="true" />
          </Link>
        </div>

        {user.age > 0 && (
          <span
            className={
              styles.profileDetails
            }
          >
            {user.age} years old
          </span>
        )}

        {(user.city || user.state) && (
          <span
            className={
              styles.profileMeta
            }
          >
            <FiMapPin aria-hidden="true" />

            {[
              user.city,
              user.state,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        )}

        {user.profession && (
          <span
            className={
              styles.profileMeta
            }
          >
            <FiBriefcase
              aria-hidden="true"
            />

            {user.profession}
          </span>
        )}

        <Link
          href={`/profile/${user.id}`}
          className={
            styles.profileButton
          }
        >
          View profile
          <FiArrowRight
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

/* =========================================
   STAT CARD
========================================= */

function StatCard({
  icon,
  label,
  value,
  detail,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={styles.statCard}
    >
      <div
        className={styles.statIcon}
      >
        {icon}
      </div>

      <div
        className={styles.statContent}
      >
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>

      <FiChevronRight
        className={
          styles.statArrow
        }
        aria-hidden="true"
      />
    </Link>
  );
}

/* =========================================
   VERIFICATION ITEM
========================================= */

function VerificationItem({
  completed = false,
  label,
}: {
  completed?: boolean;
  label: string;
}) {
  return (
    <div
      className={
        styles.verificationItem
      }
    >
      <span
        className={
          completed
            ? styles.checkCompleted
            : styles.checkPending
        }
      >
        {completed ? (
          <FiCheck aria-hidden="true" />
        ) : (
          <FiClock aria-hidden="true" />
        )}
      </span>

      <span>{label}</span>

      {completed && (
        <small>
          Verified
        </small>
      )}
    </div>
  );
}

/* =========================================
   QUICK ACTION
========================================= */

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={styles.quickAction}
    >
      <span
        className={styles.quickIcon}
      >
        {icon}
      </span>

      <span
        className={styles.quickText}
      >
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <FiChevronRight
        className={
          styles.quickArrow
        }
        aria-hidden="true"
      />
    </Link>
  );
}

/* =========================================
   PROFILE CARD
========================================= */

function ProfileCard({
  profile,
}: {
  profile: Profile;
}) {
  return (
    <article
      className={styles.profileCard}
    >
      <Link
        href={`/profile/${profile.id}`}
        className={styles.profileVisual}
      >
        {profile.photo ? (
          <img
            src={profile.photo}
            alt={profile.name}
            className={
              styles.profileImage
            }
          />
        ) : (
          <div
            className={
              styles.profileInitials
            }
          >
            {profile.initials}
          </div>
        )}

        <div
          className={
            styles.profileGradient
          }
        />

        {profile.online && (
          <span
            className={
              styles.onlineBadge
            }
          >
            <span />
            Online
          </span>
        )}

        {profile.verified && (
          <span
            className={
              styles.profileVerified
            }
          >
            <FiCheck aria-hidden="true" />
            Verified
          </span>
        )}

        <span
          className={
            styles.compatibility
          }
        >
          <strong>
            {profile.compatibility}%
          </strong>

          <small>
            match
          </small>
        </span>
      </Link>

      <div
        className={styles.profileInfo}
      >
        <div
          className={
            styles.profileNameRow
          }
        >
          <Link
            href={`/profile/${profile.id}`}
            className={
              styles.profileName
            }
          >
            {profile.name}
          </Link>

          <button
            type="button"
            className={
              styles.favoriteButton
            }
            aria-label={`Shortlist ${profile.name}`}
          >
            <FiHeart
              aria-hidden="true"
            />
          </button>
        </div>

        {profile.age > 0 && (
          <span
            className={
              styles.profileDetails
            }
          >
            {profile.age} years old
          </span>
        )}

        <span
          className={
            styles.profileMeta
          }
        >
          <FiMapPin aria-hidden="true" />

          {profile.city}
          {profile.state
            ? `, ${profile.state}`
            : ""}
        </span>

        <span
          className={
            styles.profileMeta
          }
        >
          <FiBriefcase
            aria-hidden="true"
          />

          {profile.profession}
        </span>

        <Link
          href={`/profile/${profile.id}`}
          className={
            styles.profileButton
          }
        >
          View profile
          <FiArrowRight
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

/* =========================================
   INSIGHT BAR
========================================= */

function InsightBar({
  day,
  value,
}: {
  day: string;
  value: number;
}) {
  return (
    <div
      className={
        styles.insightBarItem
      }
    >
      <div
        className={
          styles.barTrack
        }
      >
        <span
          style={{
            height: `${value}%`,
          }}
        />
      </div>

      <small>{day}</small>
    </div>
  );
}