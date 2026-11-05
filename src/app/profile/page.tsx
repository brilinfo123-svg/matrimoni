"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  cast?: string;
  motherTongue?: string;
  maritalStatus?: string;

  education?: string;
  college?: string;
  profession?: string;
  company?: string;
  income?: string;

  fatherOccupation?: string;
  motherOccupation?: string;

  diet?: string;
  smoking?: string;
  drinking?: string;

  partnerAgeMin?: string;
  partnerAgeMax?: string;
  partnerState?: string;
  partnerCity?: string;
  partnerReligion?: string;
  partnerCast?: string;
  partnerEducation?: string;
  partnerProfession?: string;
  partnerMaritalStatus?: string;

  photos?: string[];

  isMobileVisible?: boolean;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isMobileVerified?: boolean;
  isProfileComplete?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

type MeResponse = {
  success: boolean;
  user?: UserProfile;
  message?: string;
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

type ContactBalanceResponse = {
  success: boolean;
  balance?: ContactBalance;
  message?: string;
};

type PremiumRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
}

function formatLocation(
  city?: string,
  state?: string,
) {
  return [city, state]
    .filter((value) => Boolean(value?.trim()))
    .join(", ");
}

function formatValue(
  value?: string,
  fallback = "Not specified",
) {
  return value?.trim() || fallback;
}

function formatProfileFor(value?: string) {
  if (!value) return "Not specified";

  const labels: Record<string, string> = {
    self: "Myself",
    son: "Son",
    daughter: "Daughter",
    brother: "Brother",
    sister: "Sister",
    friend: "Friend",
    relative: "Relative",
  };

  return (
    labels[value.toLowerCase()] ||
    value.replace(/[_-]/g, " ")
  );
}

function formatMaritalStatus(value?: string) {
  if (!value) return "Not specified";

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
  if (min && max) return `${min} – ${max} years`;
  if (min) return `${min}+ years`;
  if (max) return `Up to ${max} years`;

  return "Not specified";
}

function getInitials(
  firstName?: string,
  lastName?: string,
) {
  const first = firstName?.trim()?.[0] || "";
  const last = lastName?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase() || "U";
}

function calculateProfileCompletion(
  profile: UserProfile,
) {
  const checks = [
    Boolean(profile.firstName?.trim()),
    Boolean(profile.lastName?.trim()),
    Boolean(profile.gender?.trim()),
    Boolean(profile.dateOfBirth?.trim()),
    Boolean(profile.state?.trim()),
    Boolean(profile.city?.trim()),
    Boolean(profile.religion?.trim()),
    Boolean(profile.cast?.trim()),
    Boolean(profile.motherTongue?.trim()),
    Boolean(profile.maritalStatus?.trim()),
    Boolean(profile.education?.trim()),
    Boolean(profile.college?.trim()),
    Boolean(profile.profession?.trim()),
    Boolean(profile.company?.trim()),
    Boolean(profile.income?.trim()),
    Boolean(profile.fatherOccupation?.trim()),
    Boolean(profile.motherOccupation?.trim()),
    Boolean(profile.diet?.trim()),
    Boolean(profile.smoking?.trim()),
    Boolean(profile.drinking?.trim()),
    Boolean(profile.photos?.length),
  ];

  const completed = checks.filter(Boolean).length;

  return Math.round((completed / checks.length) * 100);
}

function getPremiumRemaining(
  premiumUntil?: string | null,
  currentTime = Date.now(),
): PremiumRemaining | null {
  if (!premiumUntil) return null;

  const expiryTime = new Date(premiumUntil).getTime();

  if (Number.isNaN(expiryTime)) return null;

  const difference = expiryTime - currentTime;

  if (difference <= 0) return null;

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24),
  );

  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) /
      (1000 * 60 * 60),
  );

  const minutes = Math.floor(
    (difference % (1000 * 60 * 60)) /
      (1000 * 60),
  );

  const seconds = Math.floor(
    (difference % (1000 * 60)) / 1000,
  );

  return {
    days,
    hours,
    minutes,
    seconds,
  };
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
  icon: ReactNode;
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
          <div className={styles.skeletonHeader} />
          <div className={styles.skeletonHero} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [contactBalance, setContactBalance] =
    useState<ContactBalance | null>(null);

  const [currentTime, setCurrentTime] =
    useState(Date.now());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD PROFILE
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

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
      } catch (err) {
        console.error("PROFILE_LOAD_ERROR:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
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

  // LOAD CONTACT BALANCE
  useEffect(() => {
    let cancelled = false;

    async function loadContactBalance() {
      try {
        const response = await fetch(
          "/api/contacts/balance",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        const data: ContactBalanceResponse =
          await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.balance
        ) {
          return;
        }

        if (!cancelled) {
          setContactBalance(data.balance);
        }
      } catch (err) {
        console.error(
          "CONTACT_BALANCE_ERROR:",
          err,
        );
      }
    }

    loadContactBalance();

    return () => {
      cancelled = true;
    };
  }, []);

  // LIVE PREMIUM COUNTDOWN
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const age = useMemo(
    () => calculateAge(profile?.dateOfBirth),
    [profile?.dateOfBirth],
  );

  const initials = useMemo(
    () =>
      getInitials(
        profile?.firstName,
        profile?.lastName,
      ),
    [profile?.firstName, profile?.lastName],
  );

  const location = useMemo(
    () =>
      formatLocation(
        profile?.city,
        profile?.state,
      ),
    [profile?.city, profile?.state],
  );

  const premiumRemaining = useMemo(
    () =>
      getPremiumRemaining(
        contactBalance?.premiumUntil,
        currentTime,
      ),
    [contactBalance?.premiumUntil, currentTime],
  );

  const premiumIsActive = Boolean(
    contactBalance?.premiumActive &&
      premiumRemaining,
  );

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.errorCard}>
            <FiShield />

            <h2>Unable to load profile</h2>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
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

            <h2>Profile not found</h2>

            <p>
              We couldn't find your profile information.
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

  const verified = Boolean(
    profile.isEmailVerified ||
      profile.isMobileVerified,
  );

  const completion =
    calculateProfileCompletion(profile);

  const basicDetails = [
    {
      label: "Profile created for",
      value: formatProfileFor(profile.profileFor),
    },
    {
      label: "Age",
      value:
        age !== null
          ? `${age} years`
          : "Not specified",
    },
    {
      label: "Gender",
      value: formatValue(profile.gender),
    },
    {
      label: "Date of birth",
      value: formatValue(profile.dateOfBirth),
    },
    {
      label: "Marital status",
      value: formatMaritalStatus(
        profile.maritalStatus,
      ),
    },
    {
      label: "Religion",
      value: formatValue(profile.religion),
    },
    {
      label: "Caste / Community",
      value: formatValue(profile.cast),
    },
    {
      label: "Mother tongue",
      value: formatValue(profile.motherTongue),
    },
    {
      label: "Email",
      value: formatValue(profile.email),
    },
    {
      label: "Mobile",
      value: formatValue(profile.mobile),
    },
  ];

  const educationDetails = [
    {
      label: "Highest education",
      value: formatValue(profile.education),
    },
    {
      label: "College / Institute",
      value: formatValue(profile.college),
    },
  ];

  const careerDetails = [
    {
      label: "Profession",
      value: formatValue(profile.profession),
    },
    {
      label: "Company",
      value: formatValue(profile.company),
    },
    {
      label: "Annual income",
      value: formatValue(profile.income),
    },
  ];

  const familyDetails = [
    {
      label: "Father's occupation",
      value: formatValue(profile.fatherOccupation),
    },
    {
      label: "Mother's occupation",
      value: formatValue(profile.motherOccupation),
    },
    {
      label: "Family location",
      value: location || "Not specified",
    },
  ];

  const lifestyleDetails = [
    {
      label: "Diet",
      value: formatValue(profile.diet),
    },
    {
      label: "Smoking",
      value: formatValue(profile.smoking),
    },
    {
      label: "Drinking",
      value: formatValue(profile.drinking),
    },
  ];

  const partnerPreferences = [
    {
      label: "Preferred age",
      value: formatAgeRange(
        profile.partnerAgeMin,
        profile.partnerAgeMax,
      ),
    },
    {
      label: "Preferred state",
      value: formatValue(profile.partnerState),
    },
    {
      label: "Preferred city",
      value: formatValue(profile.partnerCity),
    },
    {
      label: "Preferred religion",
      value: formatValue(profile.partnerReligion),
    },
    {
      label: "Preferred caste / community",
      value: formatValue(profile.partnerCast),
    },
    {
      label: "Preferred education",
      value: formatValue(profile.partnerEducation),
    },
    {
      label: "Preferred profession",
      value: formatValue(profile.partnerProfession),
    },
    {
      label: "Preferred marital status",
      value: formatMaritalStatus(
        profile.partnerMaritalStatus,
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        {/* HEADER */}

        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>
              My profile
            </span>

            <h1>Your profile</h1>

            <p>
              Review your personal details and partner
              preferences.
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

        {/* PROFILE HERO */}

        <section className={styles.profileHero}>
          <div className={styles.profileMain}>
            <div className={styles.photoWrapper}>
              <div className={styles.profilePhoto}>
                {profile.photos?.[0] ? (
                  <img
                    src={profile.photos[0]}
                    alt={fullName}
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {verified && (
                <span
                  className={styles.verifiedBadge}
                  title="Email or phone verified"
                >
                  <FiCheck aria-hidden="true" />
                </span>
              )}
            </div>

            <div className={styles.profileIdentity}>
              <div className={styles.nameRow}>
                <h2>{fullName}</h2>

                {verified && (
                  <span className={styles.verifiedText}>
                    <FiShield aria-hidden="true" />
                    Verified
                  </span>
                )}
              </div>

              <p className={styles.profileMeta}>
                {age !== null
                  ? `${age} years`
                  : "Age not specified"}

                <span>•</span>

                {formatValue(profile.profession)}
              </p>

              <div className={styles.location}>
                <FiMapPin aria-hidden="true" />

                <span>
                  {location || "Location not specified"}
                </span>
              </div>

              <div className={styles.profileTags}>
                <span>
                  <FiHeart aria-hidden="true" />
                  {formatValue(profile.religion)}
                  {profile.cast
                    ? ` · ${profile.cast}`
                    : ""}
                </span>
              </div>
            </div>
          </div>

          {/* PROFILE COMPLETION */}

          <div className={styles.completion}>
            <div className={styles.completionTop}>
              <div>
                <span>Profile completion</span>
                <strong>{completion}%</strong>
              </div>

              <span className={styles.completionIcon}>
                <FiStar aria-hidden="true" />
              </span>
            </div>

            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${completion}%` }}
              />
            </div>

            {completion < 100 && (
              <Link
                href="/edit"
                className={styles.completeLink}
              >
                Complete your profile
                <FiArrowRight aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>

        {/* CONTENT */}

        <div className={styles.layout}>
          <main className={styles.mainContent}>

            {/* ACTIVE PLAN */}

            {contactBalance && (
              <section className={styles.card}>
                <SectionHeader
                  icon={<FiStar aria-hidden="true" />}
                  title="My Active Plan"
                />

                {/* MONTHLY PREMIUM */}

                {premiumIsActive &&
                premiumRemaining ? (
                  <div className={styles.premiumPlan}>
                    <div className={styles.planTitleRow}>
                      <div>
                        <span className={styles.planType}>
                          MONTHLY PREMIUM
                        </span>

                        <h3>Premium Membership</h3>
                      </div>

                      <span className={styles.activeStatus}>
                      <span className={styles.activeDot} />
                      Active
                    </span>
                    </div>

                    <p className={styles.planDescription}>
                      Enjoy unlimited contact unlocks while
                      your Premium plan is active.
                    </p>

                    <div className={styles.countdownGrid}>
                      <div>
                        <strong>
                          {premiumRemaining.days}
                        </strong>
                        <span>Days</span>
                      </div>

                      <div>
                        <strong>
                          {premiumRemaining.hours}
                        </strong>
                        <span>Hours</span>
                      </div>

                      <div>
                        <strong>
                          {premiumRemaining.minutes}
                        </strong>
                        <span>Minutes</span>
                      </div>

                      <div>
                        <strong>
                          {premiumRemaining.seconds}
                        </strong>
                        <span>Seconds</span>
                      </div>
                    </div>

                    <p className={styles.expiryText}>
                      Expires on:{" "}
                      {new Date(
                        contactBalance.premiumUntil!,
                      ).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                ) : (
                  <div className={styles.noPremiumPlan}>
                    <h3>No Active Monthly Premium</h3>

                    <p>
                      You are currently using your
                      available contact unlock balance.
                    </p>
                  </div>
                )}

                {/* CONTACT PACK CREDITS */}

                <div className={styles.creditPlan}>
                  <div>
                    <span className={styles.planType}>
                      CONTACT PACK
                    </span>

                    <h3>Available Contact Credits</h3>
                  </div>

                  <strong className={styles.creditCount}>
                    {contactBalance.contactCredits}
                    <span> Credits</span>
                  </strong>
                </div>

                {/* FREE UNLOCK BALANCE */}

                <div className={styles.freeBalance}>
                  <span>Free Unlocks</span>

                  <strong>
                    {contactBalance.freeRemaining} /{" "}
                    {contactBalance.freeTotal}
                  </strong>
                </div>

                {/* UNLOCKED PROFILES */}

              <div className={styles.unlockStats}>
              <Link
                  href="/unlocked-profiles"
                  className={styles.unlockedProfilesLink}
                >
                  View unlocked profiles
                  <FiArrowRight aria-hidden="true" />
                </Link>
                

                <strong>
                  <span>Profiles Unlocked</span>
                  <b>{contactBalance.unlockedCount}</b>
                </strong>

                
              </div>

                <Link
                  href="/contact-plans"
                  className={styles.preferenceButton}
                >
                  View contact plans
                  <FiChevronRight aria-hidden="true" />
                </Link>
              </section>
            )}

            {/* BASIC DETAILS */}

            <section className={styles.card}>
              <SectionHeader
                icon={<FiUser aria-hidden="true" />}
                title="Basic details"
                action
              />

              <div className={styles.detailsGrid}>
                {basicDetails.map((item) => (
                  <DetailItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </section>

            {/* EDUCATION AND CAREER */}

            <section className={styles.card}>
              <SectionHeader
                icon={<FiBriefcase aria-hidden="true" />}
                title="Education & career"
                action
              />

              <div className={styles.subsection}>
                <h3>Education</h3>

                <div className={styles.detailsGrid}>
                  {educationDetails.map((item) => (
                    <DetailItem
                      key={item.label}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.subsection}>
                <h3>Career</h3>

                <div className={styles.detailsGrid}>
                  {careerDetails.map((item) => (
                    <DetailItem
                      key={item.label}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* FAMILY */}

            <section className={styles.card}>
              <SectionHeader
                icon={<FiUsers aria-hidden="true" />}
                title="Family"
                action
              />

              <div className={styles.detailsGrid}>
                {familyDetails.map((item) => (
                  <DetailItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </section>

            {/* LIFESTYLE */}

            <section className={styles.card}>
              <SectionHeader
                icon={<FiHome aria-hidden="true" />}
                title="Lifestyle"
                action
              />

              <div className={styles.detailsGrid}>
                {lifestyleDetails.map((item) => (
                  <DetailItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </section>

            {/* PARTNER PREFERENCES */}

            <section className={styles.card}>
              <SectionHeader
                icon={<FiHeart aria-hidden="true" />}
                title="Partner preferences"
                action
              />

              <p className={styles.preferenceIntro}>
                Your saved preferences for a potential
                life partner.
              </p>

              <div className={styles.detailsGrid}>
                {partnerPreferences.map((item) => (
                  <DetailItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>

              <Link
                href="/edit"
                className={styles.preferenceButton}
              >
                Manage partner preferences
                <FiChevronRight aria-hidden="true" />
              </Link>
            </section>
          </main>

          {/* SIDEBAR */}

          <aside className={styles.sidebar}>
            {/* VERIFICATION */}

            <section className={styles.sideCard}>
              <div className={styles.sideIcon}>
                <FiShield aria-hidden="true" />
              </div>

              <span className={styles.sideEyebrow}>
                Profile trust
              </span>

              <h3>
                Your verification status
              </h3>

              <p>
                Your verification indicators reflect the
                information saved on your account.
              </p>

              <div className={styles.verificationList}>
                {/* EMAIL */}

                <div className={styles.verificationItem}>
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
                    <strong>Email</strong>
                    <span>
                      {profile.isEmailVerified
                        ? "Verified"
                        : "Not verified"}
                    </span>
                  </div>
                </div>

                {/* PHONE */}

                <div className={styles.verificationItem}>
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
                    <strong>Phone</strong>
                    <span>
                      {profile.isMobileVerified
                        ? "Verified"
                        : "Not verified"}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/dashboard/verification"
                className={styles.sideButton}
              >
                Manage verification
                <FiArrowRight aria-hidden="true" />
              </Link>
            </section>

            {/* PRIVACY */}

            <section className={styles.privacyCard}>
              <span className={styles.privacyIcon}>
                <FiLock aria-hidden="true" />
              </span>

              <div>
                <strong>
                  Your privacy, your choice.
                </strong>

                <p>
                  Control who can discover your profile
                  and what information you share.
                </p>
              </div>

              <Link href="/settings">
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