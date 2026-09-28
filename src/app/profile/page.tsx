"use client";

import Link from "next/link";
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

const profile = {
name: "Akash Verma",
age: 29,
location: "Toronto, Canada",
profession: "Web Developer",
education: "Bachelor's Degree",
completion: 78,
verified: true,
initials: "AV",
about:
"I’m someone who values meaningful conversations, personal growth, and building a balanced life. I enjoy exploring new places, learning new things, and spending quality time with the people who matter to me.",
};

const basicDetails = [
{ label: "Age", value: "29 years" },
{ label: "Height", value: "5'10" },
{ label: "Marital status", value: "Never married" },
{ label: "Mother tongue", value: "Hindi" },
];

const educationDetails = [
{ label: "Highest education", value: "Bachelor's Degree" },
{ label: "Field of study", value: "Computer Science" },
{ label: "Institute", value: "University" },
];

const careerDetails = [
{ label: "Profession", value: "Web Developer" },
{ label: "Employment", value: "Full-time" },
{ label: "Industry", value: "Technology" },
];

const familyDetails = [
{ label: "Family type", value: "Nuclear family" },
{ label: "Family location", value: "Canada" },
{ label: "Siblings", value: "1 sibling" },
];

const lifestyleDetails = [
{ label: "Diet", value: "Vegetarian" },
{ label: "Smoking", value: "Never" },
{ label: "Drinking", value: "Occasionally" },
];

const interests = [
"Travel",
"Technology",
"Photography",
"Music",
"Movies",
"Fitness",
];

const partnerPreferences = [
{ label: "Age", value: "25 – 32 years" },
{ label: "Location", value: "Canada" },
{ label: "Education", value: "Bachelor's or above" },
{ label: "Marital status", value: "Never married" },
];

function DetailItem({
label,
value,
}: {
label: string;
value: string;
}) {
return ( <div className={styles.detailItem}> <span>{label}</span> <strong>{value}</strong> </div>
);
}

function SectionHeader({
icon,
title,
action,
}: {
icon: React.ReactNode;
title: string;
action?: boolean;
}) {
return ( <div className={styles.sectionHeader}> <div className={styles.sectionTitle}> <span className={styles.sectionIcon}>{icon}</span> <h2>{title}</h2> </div>


  {action && (
    <Link
      href="/dashboard/profile/edit"
      className={styles.editLink}
    >
      <FiEdit3 aria-hidden="true" />
      <span>Edit</span>
    </Link>
  )}
</div>


);
}

export default function ProfilePage() {
return ( <div className={styles.page}> <div className={styles.backgroundGlow} /> <div className={styles.backgroundGlowTwo} />

  <div className={styles.container}>
    <header className={styles.pageHeader}>
      <div>
        <span className={styles.eyebrow}>My profile</span>
        <h1>Your profile</h1>
        <p>
          This is how your profile appears to people you
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

    <section className={styles.profileHero}>
      <div className={styles.profileMain}>
        <div className={styles.photoWrapper}>
          <div className={styles.profilePhoto}>
            <span>{profile.initials}</span>
          </div>

          {profile.verified && (
            <span
              className={styles.verifiedBadge}
              title="Verified profile"
            >
              <FiCheck aria-hidden="true" />
            </span>
          )}

          <span className={styles.onlineDot} />
        </div>

        <div className={styles.profileIdentity}>
          <div className={styles.nameRow}>
            <h2>{profile.name}</h2>

            {profile.verified && (
              <span className={styles.verifiedText}>
                <FiShield aria-hidden="true" />
                Verified
              </span>
            )}
          </div>

          <p className={styles.profileMeta}>
            {profile.age} years
            <span>•</span>
            {profile.profession}
          </p>

          <div className={styles.location}>
            <FiMapPin aria-hidden="true" />
            <span>{profile.location}</span>
          </div>

          <div className={styles.profileTags}>
            <span>
              <FiHeart aria-hidden="true" />
              Looking for a meaningful relationship
            </span>
          </div>
        </div>
      </div>

      <div className={styles.completion}>
        <div className={styles.completionTop}>
          <div>
            <span>Profile completion</span>
            <strong>{profile.completion}%</strong>
          </div>

          <span className={styles.completionIcon}>
            <FiStar aria-hidden="true" />
          </span>
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ width: `${profile.completion}%` }}
          />
        </div>

        <Link
          href="/edit"
          className={styles.completeLink}
        >
          Complete your profile
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>

    <div className={styles.layout}>
      <main className={styles.mainContent}>
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

        <section className={styles.card}>
          <SectionHeader
            icon={<FiHeart aria-hidden="true" />}
            title="About me"
            action
          />

          <p className={styles.aboutText}>{profile.about}</p>
        </section>

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

        <section className={styles.card}>
          <SectionHeader
            icon={<FiStar aria-hidden="true" />}
            title="Interests & hobbies"
            action
          />

          <div className={styles.interests}>
            {interests.map((interest) => (
              <span key={interest}>{interest}</span>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <SectionHeader
            icon={<FiHeart aria-hidden="true" />}
            title="Partner preferences"
            action
          />

          <p className={styles.preferenceIntro}>
            The kind of person you would like to connect
            with.
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
            href="/dashboard/preferences"
            className={styles.preferenceButton}
          >
            Manage partner preferences
            <FiChevronRight aria-hidden="true" />
          </Link>
        </section>
      </main>

      <aside className={styles.sidebar}>
        <section className={styles.sideCard}>
          <div className={styles.sideIcon}>
            <FiShield aria-hidden="true" />
          </div>

          <span className={styles.sideEyebrow}>
            Profile trust
          </span>

          <h3>Build confidence with verification</h3>

          <p>
            Verified information can help other members
            understand that your profile is genuine.
          </p>

          <div className={styles.verificationList}>
            <div className={styles.verificationItem}>
              <span className={styles.done}>
                <FiCheck aria-hidden="true" />
              </span>

              <div>
                <strong>Email</strong>
                <span>Verified</span>
              </div>
            </div>

            <div className={styles.verificationItem}>
              <span className={styles.done}>
                <FiCheck aria-hidden="true" />
              </span>

              <div>
                <strong>Phone</strong>
                <span>Verified</span>
              </div>
            </div>

            <div className={styles.verificationItem}>
              <span className={styles.pending}>
                <FiShield aria-hidden="true" />
              </span>

              <div>
                <strong>Identity</strong>
                <span>Not verified</span>
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

        <section className={styles.privacyCard}>
          <span className={styles.privacyIcon}>
            <FiLock aria-hidden="true" />
          </span>

          <div>
            <strong>Your privacy, your choice.</strong>
            <p>
              Control who can discover your profile and what
              information you share.
            </p>
          </div>

          <Link href="/dashboard/settings/privacy">
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
