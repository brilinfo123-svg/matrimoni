"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiChevronRight,
  FiFlag,
  FiHeart,
  FiHome,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiMoreHorizontal,
  FiPhone,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import styles from "./profile.module.scss";

const userProfile = {
name: "Ananya Sharma",
age: 28,
location: "Toronto, Canada",
profession: "Product Designer",
education: "Master's Degree",
height: "5'5",
maritalStatus: "Never married",
motherTongue: "Hindi",
compatibility: 94,
initials: "AS",
verified: true,
online: true,
phone: "+14165550123",
about:
"I’m a creative and positive person who enjoys meaningful conversations, exploring new places, and learning something new every day. I value honesty, kindness, family, and having a balanced life. I’m looking for someone with whom I can build a genuine and supportive relationship.",
};

const basicDetails = [
["Age", "28 years"],
["Height", "5'5"],
["Marital status", "Never married"],
["Mother tongue", "Hindi"],
];

const educationDetails = [
["Highest education", "Master's Degree"],
["Field of study", "Design & Technology"],
["Institute", "University"],
];

const careerDetails = [
["Profession", "Product Designer"],
["Employment", "Full-time"],
["Industry", "Technology"],
];

const familyDetails = [
["Family type", "Nuclear family"],
["Family location", "Toronto, Canada"],
["Siblings", "1 sibling"],
];

const lifestyleDetails = [
["Diet", "Vegetarian"],
["Smoking", "Never"],
["Drinking", "Occasionally"],
];

const interests = [
"Travel",
"Photography",
"Design",
"Music",
"Movies",
"Cooking",
"Fitness",
"Reading",
];

const preferences = [
["Age", "26 – 33 years"],
["Location", "Canada"],
["Education", "Bachelor's or above"],
["Marital status", "Never married"],
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
}: {
icon: React.ReactNode;
title: string;
}) {
return ( <div className={styles.sectionHeader}> <div className={styles.sectionTitle}> <span className={styles.sectionIcon}>{icon}</span> <h2>{title}</h2> </div> </div>
);
}

export default function UserProfilePage() {
const [isShortlisted, setIsShortlisted] =
useState(false);

const [interestSent, setInterestSent] =
useState(false);

return ( <div className={styles.page}> <div className={styles.backgroundGlow} /> <div className={styles.backgroundGlowTwo} />

```
  <div className={styles.container}>
    <div className={styles.topBar}>
      <Link href="/search" className={styles.backButton}>
        <FiArrowLeft aria-hidden="true" />
        <span>Back to discover</span>
      </Link>

      <button
        type="button"
        className={styles.moreButton}
        aria-label="More profile options"
      >
        <FiMoreHorizontal aria-hidden="true" />
      </button>
    </div>

    <section className={styles.profileHero}>
      <div className={styles.photoSection}>
        <div className={styles.profilePhoto}>
          <span>{userProfile.initials}</span>

          {userProfile.online && (
            <div className={styles.onlineBadge}>
              <span />
              Online now
            </div>
          )}
        </div>

        <div className={styles.photoCount}>
          <span>1</span>
          <span>profile photo</span>
        </div>
      </div>

      <div className={styles.profileInfo}>
        <div className={styles.statusRow}>
          {userProfile.verified && (
            <span className={styles.verifiedBadge}>
              <FiCheck aria-hidden="true" />
              Verified profile
            </span>
          )}

          {userProfile.online && (
            <span className={styles.onlineText}>
              <span />
              Online
            </span>
          )}
        </div>

        <h1>{userProfile.name}</h1>

        <p className={styles.subtitle}>
          {userProfile.age} years
          <span>•</span>
          {userProfile.profession}
        </p>

        <div className={styles.location}>
          <FiMapPin aria-hidden="true" />
          <span>{userProfile.location}</span>
        </div>

        <div className={styles.compatibilityCard}>
          <div className={styles.matchCircle}>
            <strong>{userProfile.compatibility}%</strong>
            <span>match</span>
          </div>

          <div>
            <strong>Strong compatibility</strong>
            <p>
              Based on your preferences and shared
              profile information.
            </p>
          </div>

          <FiChevronRight
            className={styles.compatibilityArrow}
            aria-hidden="true"
          />
        </div>

 
        <div className={styles.actions}>
        <button
            type="button"
            className={`${styles.interestButton} ${
            interestSent ? styles.interestSent : ""
            }`}
            onClick={() => setInterestSent(true)}
        >
            <FiHeart
            aria-hidden="true"
            fill={interestSent ? "currentColor" : "none"}
            />

            <span>
            {interestSent
                ? "Interest sent"
                : "Send interest"}
            </span>
        </button>

        <Link
            href="/messages"
            className={styles.messageButton}
        >
            <FiMessageCircle aria-hidden="true" />
            <span>Message</span>
        </Link>

        <a
            href={`tel:${userProfile.phone}`}
            className={styles.callButton}
            aria-label={`Call ${userProfile.name}`}
        >
            <FiPhone aria-hidden="true" />
            <span>Call</span>
        </a>

        <a
            href={`https://wa.me/${userProfile.phone.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappButton}
            aria-label={`WhatsApp ${userProfile.name}`}
        >
            <FiMessageCircle aria-hidden="true" />
            <span>WhatsApp</span>
        </a>

        <button
            type="button"
            className={`${styles.shortlistButton} ${
            isShortlisted ? styles.active : ""
            }`}
            onClick={() =>
            setIsShortlisted((current) => !current)
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
                isShortlisted ? "currentColor" : "none"
            }
            />
        </button>
        </div>


      </div>
    </section>

    <div className={styles.contentLayout}>
      <main className={styles.mainContent}>
        <section className={styles.card}>
          <SectionHeader
            icon={<FiHeart aria-hidden="true" />}
            title="About Ananya"
          />

          <p className={styles.aboutText}>
            {userProfile.about}
          </p>
        </section>

        <section className={styles.card}>
          <SectionHeader
            icon={<FiUser aria-hidden="true" />}
            title="Basic details"
          />

          <div className={styles.detailsGrid}>
            {basicDetails.map(([label, value]) => (
              <DetailItem
                key={label}
                label={label}
                value={value}
              />
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <SectionHeader
            icon={<FiBriefcase aria-hidden="true" />}
            title="Education & career"
          />

          <div className={styles.subsection}>
            <h3>Education</h3>

            <div className={styles.detailsGrid}>
              {educationDetails.map(([label, value]) => (
                <DetailItem
                  key={label}
                  label={label}
                  value={value}
                />
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.subsection}>
            <h3>Career</h3>

            <div className={styles.detailsGrid}>
              {careerDetails.map(([label, value]) => (
                <DetailItem
                  key={label}
                  label={label}
                  value={value}
                />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <SectionHeader
            icon={<FiUsers aria-hidden="true" />}
            title="Family"
          />

          <div className={styles.detailsGrid}>
            {familyDetails.map(([label, value]) => (
              <DetailItem
                key={label}
                label={label}
                value={value}
              />
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <SectionHeader
            icon={<FiHome aria-hidden="true" />}
            title="Lifestyle"
          />

          <div className={styles.detailsGrid}>
            {lifestyleDetails.map(([label, value]) => (
              <DetailItem
                key={label}
                label={label}
                value={value}
              />
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <SectionHeader
            icon={<FiStar aria-hidden="true" />}
            title="Interests & hobbies"
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
          />

          <p className={styles.preferenceIntro}>
            What Ananya is looking for in a partner.
          </p>

          <div className={styles.detailsGrid}>
            {preferences.map(([label, value]) => (
              <DetailItem
                key={label}
                label={label}
                value={value}
              />
            ))}
          </div>
        </section>

        <section className={styles.safetyCard}>
          <div className={styles.safetyIcon}>
            <FiShield aria-hidden="true" />
          </div>

          <div>
            <strong>Stay safe while connecting</strong>
            <p>
              Keep conversations on the platform until
              you feel comfortable sharing more personal
              information.
            </p>
          </div>
        </section>
      </main>

      <aside className={styles.sidebar}>
        <section className={styles.sideCard}>
          <div className={styles.sideIcon}>
            <FiShield aria-hidden="true" />
          </div>

          <span className={styles.sideEyebrow}>
            Profile verification
          </span>

          <h2>Verified information</h2>

          <p>
            Some profile information has been verified
            through our verification process.
          </p>

          <div className={styles.verificationList}>
            <div>
              <span>
                <FiCheck aria-hidden="true" />
              </span>
              <strong>Email verified</strong>
            </div>

            <div>
              <span>
                <FiCheck aria-hidden="true" />
              </span>
              <strong>Phone verified</strong>
            </div>

            <div className={styles.notVerified}>
              <span>
                <FiShield aria-hidden="true" />
              </span>
              <strong>Identity not verified</strong>
            </div>
          </div>
        </section>

        <section className={styles.privacyCard}>
          <div className={styles.privacyIcon}>
            <FiLock aria-hidden="true" />
          </div>

          <div>
            <strong>Respect privacy</strong>
            <p>
              Only share personal information when you are
              comfortable doing so.
            </p>
          </div>
        </section>

        <section className={styles.reportCard}>
          <button type="button">
            <FiFlag aria-hidden="true" />
            <span>Report this profile</span>
          </button>

          <button type="button">
            <FiLock aria-hidden="true" />
            <span>Block this profile</span>
          </button>
        </section>
      </aside>
    </div>

    <div className={styles.bottomCta}>
      <div>
        <span className={styles.bottomIcon}>
          <FiHeart aria-hidden="true" />
        </span>

        <div>
          <strong>Interested in Ananya?</strong>
          <p>
            Send an interest and start a meaningful
            connection.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setInterestSent(true)}
        className={styles.bottomButton}
      >
        <FiHeart aria-hidden="true" />
        {interestSent
          ? "Interest sent"
          : "Send interest"}
      </button>
    </div>
  </div>
</div>

);
}
