"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiEdit3,
  FiHeart,
  FiHome,
  FiLock,
  FiMapPin,
  FiMoreHorizontal,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import styles from "./preview.module.scss";

const profileSections = [
  {
    id: "about",
    title: "About me",
    icon: FiUser,
  },
  {
    id: "education",
    title: "Education & career",
    icon: FiBriefcase,
  },
  {
    id: "family",
    title: "Family",
    icon: FiUsers,
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    icon: FiHeart,
  },
  {
    id: "preferences",
    title: "Partner preferences",
    icon: FiUsers,
  },
];

type ProfileData = {
  id: string;

  name: string;
  firstName: string;
  lastName: string;

  age: number | null;
  gender: string;

  location: string;
  city: string;
  state: string;

  about: string;

  height: string;
  maritalStatus: string;
  motherTongue: string;

  education: string;
  fieldOfStudy: string;
  institute: string;

  profession: string;
  employment: string;
  industry: string;
  company: string;

  familyType: string;
  familyLocation: string;
  siblings: string;

  diet: string;
  smoking: string;
  drinking: string;

  interests: string[];

  preferredAgeMin: string;
  preferredAgeMax: string;
  preferredLocation: string;
  preferredEducation: string;
  preferredProfession: string;
  preferredMaritalStatus: string;

  profileImage: string;
  photos: string[];

  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isProfileComplete: boolean;
  verified: boolean;

  completion: number;
};

function displayValue(value: string | number | null | undefined) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not added";
  }

  return String(value);
}

function getInitials(profile: ProfileData) {
  const first = profile.firstName?.charAt(0) || "";
  const last = profile.lastName?.charAt(0) || "";

  return `${first}${last}`.toUpperCase() || "U";
}

function getLocation(profile: ProfileData) {
  if (profile.location) {
    return profile.location;
  }

  if (profile.city && profile.state) {
    return `${profile.city}, ${profile.state}`;
  }

  return profile.city || profile.state || "Location not added";
}

export default function ProfilePreviewPage() {
  const [activeSection, setActiveSection] = useState("about");
  const [showMore, setShowMore] = useState(false);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/profiles", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load profile",
          );
        }

        setProfile(data.profile);
      } catch (err) {
        console.error("Profile preview error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className={styles.container}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner} />

            <h2>Loading your profile...</h2>

            <p>
              Please wait while we prepare your profile preview.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className={styles.container}>
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <FiUser />
            </div>

            <h1>Unable to load profile</h1>

            <p>
              {error ||
                "We could not load your profile information."}
            </p>

            <Link
              href="/edit"
              className={styles.backButton}
            >
              <FiEdit3 />
              <span>Edit profile</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const location = getLocation(profile);
  const initials = getInitials(profile);

  const primaryPhoto =
    profile.profileImage ||
    profile.photos?.[0] ||
    "";

  const aboutText =
    profile.about?.trim() ||
    [
      profile.profession &&
        `I work as ${profile.profession}.`,
      profile.education &&
        `I have studied ${profile.education}.`,
      profile.city &&
        `I am based in ${profile.city}.`,
    ]
      .filter(Boolean)
      .join(" ") ||
    "You have not added an about section yet.";

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        {/* TOP BAR */}
        <div className={styles.topBar}>
          <Link
            href="/dashboard"
            className={styles.backButton}
          >
            <FiArrowLeft aria-hidden="true" />
            <span>Back to dashboard</span>
          </Link>

          <div className={styles.previewLabel}>
            <span className={styles.previewDot} />
            <span>Profile preview</span>
          </div>

          <Link
            href="/edit"
            className={styles.editButton}
          >
            <FiEdit3 aria-hidden="true" />
            <span>Edit profile</span>
          </Link>
        </div>

        {/* PREVIEW NOTICE */}
        <div className={styles.previewNotice}>
          <div className={styles.noticeIcon}>
            <FiShield />
          </div>

          <div className={styles.noticeContent}>
            <strong>
              This is how your profile may appear to others.
            </strong>

            <span>
              Private information such as your email, phone
              number, documents and exact address is not shown
              here.
            </span>
          </div>

          <Link href="/settings">
            Privacy settings
          </Link>
        </div>

        {/* PROFILE HERO */}
        <section className={styles.heroCard}>
          <div className={styles.heroBackground}>
            <div className={styles.heroOrbOne} />
            <div className={styles.heroOrbTwo} />
          </div>

          <div className={styles.heroContent}>
            <div className={styles.profilePhotoArea}>
              <div className={styles.profilePhoto}>
                {primaryPhoto ? (
                  <img
                    src={primaryPhoto}
                    alt={`${profile.name} profile`}
                  />
                ) : (
                  <span>{initials}</span>
                )}

                <span className={styles.onlineDot} />
              </div>

              {profile.verified && (
                <div className={styles.verifiedBadge}>
                  <FiCheck aria-hidden="true" />
                  <span>Verified profile</span>
                </div>
              )}
            </div>

            <div className={styles.heroInfo}>
              <div className={styles.nameRow}>
                <div>
                  <div className={styles.eyebrow}>
                    Your public profile
                  </div>

                  <h1>
                    {displayValue(profile.name)}
                  </h1>

                  <p className={styles.basicLine}>
                    {profile.age !== null && (
                      <>
                        <span>{profile.age}</span>
                        <span>years</span>
                      </>
                    )}

                    {profile.age !== null && (
                      <span className={styles.separator}>
                        •
                      </span>
                    )}

                    <span>
                      <FiMapPin aria-hidden="true" />
                      {location}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.moreButton}
                  aria-label="More profile options"
                  onClick={() =>
                    setShowMore((value) => !value)
                  }
                >
                  <FiMoreHorizontal aria-hidden="true" />
                </button>
              </div>

              {showMore && (
                <div className={styles.moreMenu}>
                  <span>
                    <FiShield aria-hidden="true" />
                    Public profile preview
                  </span>

                  <span>
                    <FiLock aria-hidden="true" />
                    Private details protected
                  </span>
                </div>
              )}

              <div className={styles.profileHighlights}>
                <div>
                  <span>Profession</span>
                  <strong>
                    {displayValue(profile.profession)}
                  </strong>
                </div>

                <div>
                  <span>Education</span>
                  <strong>
                    {displayValue(profile.education)}
                  </strong>
                </div>

                <div>
                  <span>Marital status</span>
                  <strong>
                    {displayValue(profile.maritalStatus)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.heroFooter}>
            <div className={styles.profileStatus}>
              <span className={styles.statusIcon}>
                <FiShield aria-hidden="true" />
              </span>

              <div>
                <strong>Profile visibility</strong>

                <span>
                  Visible to members based on your settings
                </span>
              </div>
            </div>

            <Link
              href="/settings"
              className={styles.managePrivacy}
            >
              Manage privacy
            </Link>
          </div>
        </section>

        {/* QUICK NAVIGATION */}
        <nav
          className={styles.sectionNavigation}
          aria-label="Profile sections"
        >
          {profileSections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                type="button"
                key={section.id}
                className={
                  activeSection === section.id
                    ? styles.activeSectionButton
                    : styles.sectionButton
                }
                onClick={() =>
                  scrollToSection(section.id)
                }
              >
                <Icon aria-hidden="true" />
                <span>{section.title}</span>
              </button>
            );
          })}
        </nav>

        <div className={styles.mainLayout}>
          <div className={styles.contentColumn}>
            {/* ABOUT */}
            <section
              id="about"
              className={styles.card}
            >
              <SectionHeader
                icon={<FiUser />}
                title="About me"
                subtitle="A little about who you are"
              />

              <p className={styles.aboutText}>
                {aboutText}
              </p>

              <div className={styles.valueRow}>
                <div className={styles.valueItem}>
                  <span className={styles.valueIcon}>
                    <FiHeart />
                  </span>

                  <div>
                    <span>Looking for</span>

                    <strong>
                      A meaningful relationship
                    </strong>
                  </div>
                </div>

                <div className={styles.valueItem}>
                  <span className={styles.valueIcon}>
                    <FiMapPin />
                  </span>

                  <div>
                    <span>Based in</span>

                    <strong>{location}</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* EDUCATION & CAREER */}
            <section
              id="education"
              className={styles.card}
            >
              <SectionHeader
                icon={<FiBriefcase />}
                title="Education & career"
                subtitle="Your professional journey"
              />

              <div className={styles.detailGrid}>
                <DetailItem
                  label="Highest education"
                  value={profile.education}
                />

                <DetailItem
                  label="Field of study"
                  value={profile.fieldOfStudy}
                />

                <DetailItem
                  label="Institute"
                  value={profile.institute}
                />

                <DetailItem
                  label="Profession"
                  value={profile.profession}
                />

                <DetailItem
                  label="Employment"
                  value={profile.employment}
                />

                <DetailItem
                  label="Industry"
                  value={profile.industry}
                />

                <DetailItem
                  label="Company"
                  value={profile.company}
                />

                <DetailItem
                  label="Work location"
                  value={location}
                />
              </div>
            </section>

            {/* FAMILY */}
            <section
              id="family"
              className={styles.card}
            >
              <SectionHeader
                icon={<FiUsers />}
                title="Family"
                subtitle="Family background"
              />

              <div className={styles.detailGrid}>
                <DetailItem
                  label="Family type"
                  value={profile.familyType}
                />

                <DetailItem
                  label="Family location"
                  value={profile.familyLocation}
                />

                <DetailItem
                  label="Siblings"
                  value={profile.siblings}
                />
              </div>
            </section>

            {/* LIFESTYLE */}
            <section
              id="lifestyle"
              className={styles.card}
            >
              <SectionHeader
                icon={<FiHeart />}
                title="Lifestyle"
                subtitle="Everyday preferences and habits"
              />

              <div className={styles.lifestyleGrid}>
                <LifestyleItem
                  label="Diet"
                  value={profile.diet}
                />

                <LifestyleItem
                  label="Smoking"
                  value={profile.smoking}
                />

                <LifestyleItem
                  label="Drinking"
                  value={profile.drinking}
                />

                <LifestyleItem
                  label="Height"
                  value={profile.height}
                />
              </div>

              {profile.interests?.length > 0 && (
                <div className={styles.interestsBlock}>
                  <div className={styles.blockLabel}>
                    Interests & hobbies
                  </div>

                  <div className={styles.interestList}>
                    {profile.interests.map(
                      (interest) => (
                        <span
                          key={interest}
                          className={styles.interest}
                        >
                          {interest}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* PARTNER PREFERENCES */}
            <section
              id="preferences"
              className={styles.card}
            >
              <SectionHeader
                icon={<FiUsers />}
                title="Partner preferences"
                subtitle="The kind of connection you are looking for"
              />

              <div className={styles.preferenceList}>
                <PreferenceRow
                  label="Age"
                  value={
                    profile.preferredAgeMin &&
                    profile.preferredAgeMax
                      ? `${profile.preferredAgeMin} – ${profile.preferredAgeMax} years`
                      : ""
                  }
                />

                <PreferenceRow
                  label="Location"
                  value={profile.preferredLocation}
                />

                <PreferenceRow
                  label="Education"
                  value={profile.preferredEducation}
                />

                <PreferenceRow
                  label="Profession"
                  value={profile.preferredProfession}
                />

                <PreferenceRow
                  label="Marital status"
                  value={profile.preferredMaritalStatus}
                />
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className={styles.sidebar}>
            {/* VERIFICATION */}
            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}>
                <span className={styles.sideIcon}>
                  <FiShield />
                </span>

                <div>
                  <strong>Trust & verification</strong>

                  <span>
                    Visible profile signals
                  </span>
                </div>
              </div>

              <div className={styles.verificationList}>
                <VerificationRow
                  label="Email"
                  value={
                    profile.isEmailVerified
                      ? "Verified"
                      : "Not verified"
                  }
                  verified={
                    profile.isEmailVerified
                  }
                />

                <VerificationRow
                  label="Phone"
                  value={
                    profile.isMobileVerified
                      ? "Verified"
                      : "Not verified"
                  }
                  verified={
                    profile.isMobileVerified
                  }
                />

                <VerificationRow
                  label="Profile"
                  value={
                    profile.isProfileComplete
                      ? "Complete"
                      : "Incomplete"
                  }
                  verified={
                    profile.isProfileComplete
                  }
                />
              </div>

              <Link
                href="/settings"
                className={styles.sideLink}
              >
                Manage verification
              </Link>
            </div>

            {/* VISIBILITY */}
            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}>
                <span className={styles.sideIcon}>
                  <FiHome />
                </span>

                <div>
                  <strong>Profile visibility</strong>

                  <span>
                    Control what others can see
                  </span>
                </div>
              </div>

              <div className={styles.visibilityItem}>
                <span className={styles.visibilityDot} />

                <div>
                  <strong>
                    Profile is visible
                  </strong>

                  <span>
                    Your public profile can appear in
                    discovery.
                  </span>
                </div>
              </div>

              <Link
                href="/settings"
                className={styles.sideLink}
              >
                Privacy controls
              </Link>
            </div>

            {/* PRIVACY TIP */}
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>
                <FiLock />
              </span>

              <div>
                <strong>
                  Your private details stay private
                </strong>

                <p>
                  Contact details, government documents
                  and other sensitive information are not
                  part of this public preview.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM CTA */}
        <section className={styles.bottomCta}>
          <div className={styles.ctaIcon}>
            <FiHeart />
          </div>

          <div className={styles.ctaContent}>
            <span className={styles.ctaEyebrow}>
              Keep your profile fresh
            </span>

            <h2>
              Make your profile feel like you.
            </h2>

            <p>
              Add your personality, interests and
              preferences so people can get a better
              sense of who you are.
            </p>
          </div>

          <Link
            href="/edit"
            className={styles.ctaButton}
          >
            <FiEdit3 />
            <span>Edit profile</span>
          </Link>
        </section>
      </div>
    </main>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <span className={styles.sectionIcon}>
        {icon}
      </span>

      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className={styles.detailItem}>
      <span>{label}</span>

      <strong>
        {displayValue(value)}
      </strong>
    </div>
  );
}

function LifestyleItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className={styles.lifestyleItem}>
      <span>{label}</span>

      <strong>
        {displayValue(value)}
      </strong>
    </div>
  );
}

function PreferenceRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className={styles.preferenceRow}>
      <span>{label}</span>

      <strong>
        {displayValue(value)}
      </strong>
    </div>
  );
}

function VerificationRow({
  label,
  value,
  verified = false,
}: {
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div className={styles.verificationRow}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <span
        className={
          verified
            ? styles.verifiedStatus
            : styles.pendingStatus
        }
      >
        {verified && (
          <FiCheck aria-hidden="true" />
        )}

        {value}
      </span>
    </div>
  );
}