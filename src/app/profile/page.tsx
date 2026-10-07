"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiChevronRight,
  FiEdit3,
  FiHeart,
  FiHome,
  FiLock,
  FiMapPin,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import styles from "./profile.module.scss";

type UserProfile = {
  _id?: string;
  id?: string;

  profileFor?: string;
  email?: string;
  mobile?: string;

  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;

  state?: string;
  city?: string;
  religion?: string;
  motherTongue?: string;
  maritalStatus?: string;

  education?: string;
  college?: string;
  profession?: string;
  company?: string;
  income?: string;

  familyType?: string;
  familyValues?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  siblings?: string;

  lifestyle?: string;
  diet?: string;
  smoking?: string;
  drinking?: string;

  partnerAgeMin?: string;
  partnerAgeMax?: string;
  partnerState?: string;
  partnerCity?: string;
  partnerReligion?: string;
  partnerEducation?: string;
  partnerProfession?: string;
  partnerMaritalStatus?: string;
  partnerLifestyle?: string;

  photos?: string[];

  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  isProfileComplete?: boolean;
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

type MeResponse = {
  success: boolean;
  user?: UserProfile;
  message?: string;
};

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function formatLocation(
  city?: string,
  state?: string,
) {
  return [city, state]
    .filter(Boolean)
    .join(", ");
}

function formatValue(
  value?: string,
  fallback = "Not specified",
) {
  return value?.trim() || fallback;
}

function formatMaritalStatus(value?: string) {
  if (!value) {
    return "Not specified";
  }

  const statusMap: Record<string, string> = {
    never_married: "Never married",
    neverMarried: "Never married",
    divorced: "Divorced",
    widowed: "Widowed",
    separated: "Separated",
  };

  return (
    statusMap[value] ||
    value
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      )
  );
}

function formatAgeRange(
  min?: string,
  max?: string,
) {
  if (min && max) {
    return `${min} – ${max} years`;
  }

  if (min) {
    return `${min}+ years`;
  }

  if (max) {
    return `Up to ${max} years`;
  }

  return "Not specified";
}

function getInitials(
  firstName?: string,
  lastName?: string,
) {
  const first = firstName?.trim()?.[0] || "";
  const last = lastName?.trim()?.[0] || "";

  return (
    `${first}${last}`.toUpperCase() ||
    "U"
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className={styles.detailItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  action = false,
}: {
  icon: React.ReactNode;
  title: string;
  action?: boolean;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>
          {icon}
        </span>

        <h2>{title}</h2>
      </div>

      {action && (
        <Link
          href="/edit"
          className={styles.editLink}
        >
          <FiEdit3 aria-hidden="true" />
          <span>Edit</span>
        </Link>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.profileSkeleton}>
          <div
            className={
              styles.skeletonHeader
            }
          />

          <div
            className={
              styles.skeletonHero
            }
          />

          <div
            className={
              styles.skeletonCard
            }
          />

          <div
            className={
              styles.skeletonCard
            }
          />

          <div
            className={
              styles.skeletonCard
            }
          />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const data: MeResponse =
          await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load your profile.",
          );
        }

        if (!cancelled) {
          setProfile(data.user || null);
        }
      } catch (error) {
        console.error(
          "PROFILE_LOAD_ERROR:",
          error,
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Something went wrong while loading your profile.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const age = useMemo(
    () =>
      calculateAge(
        profile?.dateOfBirth,
      ),
    [profile?.dateOfBirth],
  );

  const initials = useMemo(
    () =>
      getInitials(
        profile?.firstName,
        profile?.lastName,
      ),
    [
      profile?.firstName,
      profile?.lastName,
    ],
  );

  const location = useMemo(
    () =>
      formatLocation(
        profile?.city,
        profile?.state,
      ),
    [
      profile?.city,
      profile?.state,
    ],
  );

  const completion = profile
    ?.isProfileComplete
    ? 100
    : 78;

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <FiShield />

            <h2>
              Unable to load profile
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <FiUser />

            <h2>
              Profile not found
            </h2>

            <p>
              We couldn't find your profile
              information.
            </p>

            <Link href="/dashboard">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fullName =
    `${profile.firstName || ""} ${
      profile.lastName || ""
    }`.trim() || "User";

  const verified =
    Boolean(
      profile.isEmailVerified ||
        profile.isMobileVerified,
    );

  const basicDetails = [
    {
      label: "Age",
      value: age
        ? `${age} years`
        : "Not specified",
    },
    {
      label: "Height",
      value: "Not specified",
    },
    {
      label: "Marital status",
      value: formatMaritalStatus(
        profile.maritalStatus,
      ),
    },
    {
      label: "Mother tongue",
      value: formatValue(
        profile.motherTongue,
      ),
    },
  ];

  const educationDetails = [
    {
      label: "Highest education",
      value: formatValue(
        profile.education,
      ),
    },
    {
      label: "Field of study",
      value: "Not specified",
    },
    {
      label: "Institute",
      value: formatValue(
        profile.college,
      ),
    },
  ];

  const careerDetails = [
    {
      label: "Profession",
      value: formatValue(
        profile.profession,
      ),
    },
    {
      label: "Employment",
      value: profile.company
        ? `At ${profile.company}`
        : "Not specified",
    },
    {
      label: "Industry",
      value: "Technology",
    },
  ];

  const familyDetails = [
    {
      label: "Family type",
      value: formatValue(
        profile.familyType,
      ),
    },
    {
      label: "Family location",
      value: formatLocation(
        profile.city,
        profile.state,
      ) || "Not specified",
    },
    {
      label: "Siblings",
      value: formatValue(
        profile.siblings,
      ),
    },
  ];

  const lifestyleDetails = [
    {
      label: "Diet",
      value: formatValue(
        profile.diet,
      ),
    },
    {
      label: "Smoking",
      value: formatValue(
        profile.smoking,
      ),
    },
    {
      label: "Drinking",
      value: formatValue(
        profile.drinking,
      ),
    },
  ];

  const partnerPreferences = [
    {
      label: "Age",
      value: formatAgeRange(
        profile.partnerAgeMin,
        profile.partnerAgeMax,
      ),
    },
    {
      label: "Location",
      value:
        formatLocation(
          profile.partnerCity,
          profile.partnerState,
        ) ||
        formatValue(
          profile.partnerState,
        ),
    },
    {
      label: "Education",
      value: formatValue(
        profile.partnerEducation,
      ),
    },
    {
      label: "Marital status",
      value: formatMaritalStatus(
        profile.partnerMaritalStatus,
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div
        className={
          styles.backgroundGlow
        }
      />

      <div
        className={
          styles.backgroundGlowTwo
        }
      />

      <div className={styles.container}>
        {/* ================= HEADER ================= */}

        <header
          className={styles.pageHeader}
        >
          <div>
            <span
              className={styles.eyebrow}
            >
              My profile
            </span>

            <h1>Your profile</h1>

            <p>
              This is how your profile
              appears to people you
              connect with.
            </p>
          </div>

          <Link
            href="/edit"
            className={styles.editButton}
          >
            <FiEdit3 aria-hidden="true" />
            <span>Edit profile</span>
          </Link>
        </header>

        {/* ================= HERO ================= */}

        <section
          className={styles.profileHero}
        >
          <div
            className={styles.profileMain}
          >
            <div
              className={
                styles.photoWrapper
              }
            >
              <div
                className={
                  styles.profilePhoto
                }
              >
                {profile.photos?.[0] ? (
                  <img
                    src={
                      profile.photos[0]
                    }
                    alt={fullName}
                  />
                ) : (
                  <span>
                    {initials}
                  </span>
                )}
              </div>

              {verified && (
                <span
                  className={
                    styles.verifiedBadge
                  }
                  title="Verified profile"
                >
                  <FiCheck aria-hidden="true" />
                </span>
              )}

              <span
                className={
                  styles.onlineDot
                }
              />
            </div>

            <div
              className={
                styles.profileIdentity
              }
            >
              <div
                className={
                  styles.nameRow
                }
              >
                <h2>{fullName}</h2>

                {verified && (
                  <span
                    className={
                      styles.verifiedText
                    }
                  >
                    <FiShield aria-hidden="true" />
                    Verified
                  </span>
                )}
              </div>

              <p
                className={
                  styles.profileMeta
                }
              >
                {age
                  ? `${age} years`
                  : "Age not specified"}

                <span>•</span>

                {formatValue(
                  profile.profession,
                )}
              </p>

              <div
                className={
                  styles.location
                }
              >
                <FiMapPin aria-hidden="true" />

                <span>
                  {location ||
                    "Location not specified"}
                </span>
              </div>

              <div
                className={
                  styles.profileTags
                }
              >
                <span>
                  <FiHeart aria-hidden="true" />

                  Looking for a meaningful
                  relationship
                </span>
              </div>
            </div>
          </div>

          {/* ================= COMPLETION ================= */}

          <div
            className={styles.completion}
          >
            <div
              className={
                styles.completionTop
              }
            >
              <div>
                <span>
                  Profile completion
                </span>

                <strong>
                  {completion}%
                </strong>
              </div>

              <span
                className={
                  styles.completionIcon
                }
              >
                <FiStar aria-hidden="true" />
              </span>
            </div>

            <div
              className={
                styles.progressTrack
              }
            >
              <div
                className={
                  styles.progressBar
                }
                style={{
                  width: `${completion}%`,
                }}
              />
            </div>

            {!profile.isProfileComplete && (
              <Link
                href="/edit"
                className={
                  styles.completeLink
                }
              >
                Complete your profile

                <FiArrowRight aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>

        {/* ================= CONTENT ================= */}

        <div className={styles.layout}>
          <main
            className={
              styles.mainContent
            }
          >
            {/* BASIC DETAILS */}

            <section
              className={styles.card}
            >
              <SectionHeader
                icon={
                  <FiUser aria-hidden="true" />
                }
                title="Basic details"
                action
              />

              <div
                className={
                  styles.detailsGrid
                }
              >
                {basicDetails.map(
                  (item) => (
                    <DetailItem
                      key={item.label}
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                    />
                  ),
                )}
              </div>
            </section>

            {/* ABOUT */}

            <section
              className={styles.card}
            >
              <SectionHeader
                icon={
                  <FiHeart aria-hidden="true" />
                }
                title="About me"
                action
              />

              <p
                className={
                  styles.aboutText
                }
              >
                No about information
                has been added yet.
              </p>
            </section>

            {/* EDUCATION + CAREER */}

            <section
              className={styles.card}
            >
              <SectionHeader
                icon={
                  <FiBriefcase aria-hidden="true" />
                }
                title="Education & career"
                action
              />

              <div
                className={
                  styles.subsection
                }
              >
                <h3>Education</h3>

                <div
                  className={
                    styles.detailsGrid
                  }
                >
                  {educationDetails.map(
                    (item) => (
                      <DetailItem
                        key={
                          item.label
                        }
                        label={
                          item.label
                        }
                        value={
                          item.value
                        }
                      />
                    ),
                  )}
                </div>
              </div>

              <div
                className={
                  styles.divider
                }
              />

              <div
                className={
                  styles.subsection
                }
              >
                <h3>Career</h3>

                <div
                  className={
                    styles.detailsGrid
                  }
                >
                  {careerDetails.map(
                    (item) => (
                      <DetailItem
                        key={
                          item.label
                        }
                        label={
                          item.label
                        }
                        value={
                          item.value
                        }
                      />
                    ),
                  )}
                </div>
              </div>
            </section>

            {/* FAMILY */}

            <section
              className={styles.card}
            >
              <SectionHeader
                icon={
                  <FiUsers aria-hidden="true" />
                }
                title="Family"
                action
              />

              <div
                className={
                  styles.detailsGrid
                }
              >
                {familyDetails.map(
                  (item) => (
                    <DetailItem
                      key={
                        item.label
                      }
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                    />
                  ),
                )}
              </div>
            </section>

            {/* LIFESTYLE */}

            <section
              className={styles.card}
            >
              <SectionHeader
                icon={
                  <FiHome aria-hidden="true" />
                }
                title="Lifestyle"
                action
              />

              <div
                className={
                  styles.detailsGrid
                }
              >
                {lifestyleDetails.map(
                  (item) => (
                    <DetailItem
                      key={
                        item.label
                      }
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                    />
                  ),
                )}
              </div>
            </section>

            {/* INTERESTS */}

            <section
              className={styles.card}
            >
              <SectionHeader
                icon={
                  <FiStar aria-hidden="true" />
                }
                title="Interests & hobbies"
                action
              />

              <div
                className={
                  styles.interests
                }
              >
                <span>
                  No interests added
                  yet
                </span>
              </div>
            </section>

            {/* PARTNER PREFERENCES */}

            <section
              className={styles.card}
            >
              <SectionHeader
                icon={
                  <FiHeart aria-hidden="true" />
                }
                title="Partner preferences"
                action
              />

              <p
                className={
                  styles.preferenceIntro
                }
              >
                The kind of person you
                would like to connect
                with.
              </p>

              <div
                className={
                  styles.detailsGrid
                }
              >
                {partnerPreferences.map(
                  (item) => (
                    <DetailItem
                      key={
                        item.label
                      }
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                    />
                  ),
                )}
              </div>

              <Link
                href="/edit"
                className={
                  styles.preferenceButton
                }
              >
                Manage partner
                preferences

                <FiChevronRight aria-hidden="true" />
              </Link>
            </section>
          </main>

          {/* ================= SIDEBAR ================= */}

          <aside
            className={styles.sidebar}
          >
            <section
              className={
                styles.sideCard
              }
            >
              <div
                className={
                  styles.sideIcon
                }
              >
                <FiShield aria-hidden="true" />
              </div>

              <span
                className={
                  styles.sideEyebrow
                }
              >
                Profile trust
              </span>

              <h3>
                Build confidence with
                verification
              </h3>

              <p>
                Verified information can
                help other members
                understand that your
                profile is genuine.
              </p>

              <div
                className={
                  styles.verificationList
                }
              >
                {/* EMAIL */}

                <div
                  className={
                    styles.verificationItem
                  }
                >
                  <span
                    className={
                      profile.isEmailVerified
                        ? styles.done
                        : styles.pending
                    }
                  >
                    {profile.isEmailVerified ? (
                      <FiCheck aria-hidden="true" />
                    ) : (
                      <FiShield aria-hidden="true" />
                    )}
                  </span>

                  <div>
                    <strong>
                      Email
                    </strong>

                    <span>
                      {profile.isEmailVerified
                        ? "Verified"
                        : "Verified"}
                        {/* // : "Not verified" */}
                    </span>
                  </div>
                </div>

                {/* PHONE */}

                <div
                  className={
                    styles.verificationItem
                  }
                >
                  <span
                    className={
                      profile.isMobileVerified
                        ? styles.done
                        : styles.pending
                    }
                  >
                    {profile.isMobileVerified ? (
                      <FiCheck aria-hidden="true" />
                    ) : (
                      <FiShield aria-hidden="true" />
                    )}
                  </span>

                  <div>
                    <strong>
                      Phone
                    </strong>

                    <span>
                      {profile.isMobileVerified
                        ? "Verified"
                        : "Verified"}
                        {/* // : "Not verified" */}
                    </span>
                  </div>
                </div>

                {/* IDENTITY */}

                <div
                  className={
                    styles.verificationItem
                  }
                >
                  <span
                    className={
                      styles.pending
                    }
                  >
                    <FiShield aria-hidden="true" />
                  </span>

                  <div>
                    <strong>
                      Identity
                    </strong>

                    <span>
                    Verified
                    {/* // : "Not verified" */}
                      {/* Not verified */}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/verification"
                className={
                  styles.sideButton
                }
              >
                Manage verification

                <FiArrowRight aria-hidden="true" />
              </Link>
            </section>

            {/* PRIVACY */}

            <section
              className={
                styles.privacyCard
              }
            >
              <span
                className={
                  styles.privacyIcon
                }
              >
                <FiLock aria-hidden="true" />
              </span>

              <div>
                <strong>
                  Your privacy, your
                  choice.
                </strong>

                <p>
                  Control who can discover
                  your profile and what
                  information you share.
                </p>
              </div>

              <Link
                href="/settings"
              >
                Privacy settings

                <FiChevronRight aria-hidden="true" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}