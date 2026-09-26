"use client";

import Link from "next/link";
import { useState } from "react";
import {
FiArrowLeft,
FiBriefcase,
FiCheck,
FiChevronDown,
FiChevronUp,
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

const interests = [
"Travel",
"Photography",
"Design",
"Music",
"Movies",
"Cooking",
"Technology",
"Nature",
];

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

export default function ProfilePreviewPage() {
const [activeSection, setActiveSection] = useState("about");
const [showMore, setShowMore] = useState(false);

const scrollToSection = (id: string) => {
setActiveSection(id);

document
  .getElementById(id)
  ?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

return ( <main className={styles.page}> <div className={styles.backgroundGlow} /> <div className={styles.backgroundGlowTwo} />
  <div className={styles.container}>
    {/* Top bar */}
    <div className={styles.topBar}>
      <Link
        href="/dashboard/profile"
        className={styles.backButton}
      >
        <FiArrowLeft aria-hidden="true" />
        <span>Back to profile</span>
      </Link>

      <div className={styles.previewLabel}>
        <span className={styles.previewDot} />
        <span>Profile preview</span>
      </div>

      <Link
        href="/dashboard/profile/edit"
        className={styles.editButton}
      >
        <FiEdit3 aria-hidden="true" />
        <span>Edit profile</span>
      </Link>
    </div>

    {/* Preview notice */}
    <div className={styles.previewNotice}>
      <div className={styles.noticeIcon}>
        <FiEyeIcon />
      </div>

      <div className={styles.noticeContent}>
        <strong>This is how your profile may appear to others.</strong>
        <span>
          Private information such as your email, phone number,
          documents and exact address is not shown here.
        </span>
      </div>

      <Link href="/dashboard/settings/privacy">
        Privacy settings
      </Link>
    </div>

    {/* Profile hero */}
    <section className={styles.heroCard}>
      <div className={styles.heroBackground}>
        <div className={styles.heroOrbOne} />
        <div className={styles.heroOrbTwo} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.profilePhotoArea}>
          <div className={styles.profilePhoto}>
            <span>AV</span>

            <span className={styles.onlineDot} />
          </div>

          <div className={styles.verifiedBadge}>
            <FiCheck aria-hidden="true" />
            <span>Verified profile</span>
          </div>
        </div>

        <div className={styles.heroInfo}>
          <div className={styles.nameRow}>
            <div>
              <div className={styles.eyebrow}>
                Your public profile
              </div>

              <h1>Akash Verma</h1>

              <p className={styles.basicLine}>
                <span>29</span>
                <span className={styles.separator}>•</span>
                <span>
                  <FiMapPin aria-hidden="true" />
                  Toronto, Canada
                </span>
              </p>
            </div>

            <button
              type="button"
              className={styles.moreButton}
              aria-label="More profile options"
              onClick={() => setShowMore((value) => !value)}
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
              <strong>Web Developer</strong>
            </div>

            <div>
              <span>Education</span>
              <strong>Bachelor&apos;s Degree</strong>
            </div>

            <div>
              <span>Marital status</span>
              <strong>Never married</strong>
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
            <span>Visible to members based on your settings</span>
          </div>
        </div>

        <Link
          href="/dashboard/settings/privacy"
          className={styles.managePrivacy}
        >
          Manage privacy
        </Link>
      </div>
    </section>

    {/* Quick navigation */}
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
            onClick={() => scrollToSection(section.id)}
          >
            <Icon aria-hidden="true" />
            <span>{section.title}</span>
          </button>
        );
      })}
    </nav>

    <div className={styles.mainLayout}>
      <div className={styles.contentColumn}>
        {/* About */}
        <section
          id="about"
          className={styles.card}
        >
          <SectionHeader
            icon={<FiUser aria-hidden="true" />}
            title="About me"
            subtitle="A little about who you are"
          />

          <p className={styles.aboutText}>
            I&apos;m a curious and positive person who enjoys
            building things, learning new ideas and spending
            meaningful time with the people I care about. I value
            honesty, kindness and open communication in a
            relationship.
          </p>

          <div className={styles.valueRow}>
            <div className={styles.valueItem}>
              <span className={styles.valueIcon}>
                <FiHeart aria-hidden="true" />
              </span>
              <div>
                <span>Looking for</span>
                <strong>A meaningful relationship</strong>
              </div>
            </div>

            <div className={styles.valueItem}>
              <span className={styles.valueIcon}>
                <FiMapPin aria-hidden="true" />
              </span>
              <div>
                <span>Based in</span>
                <strong>Toronto, Canada</strong>
              </div>
            </div>
          </div>
        </section>

        {/* Education */}
        <section
          id="education"
          className={styles.card}
        >
          <SectionHeader
            icon={<FiBriefcase aria-hidden="true" />}
            title="Education & career"
            subtitle="Your professional journey"
          />

          <div className={styles.detailGrid}>
            <DetailItem
              label="Highest education"
              value="Bachelor's Degree"
            />

            <DetailItem
              label="Field of study"
              value="Computer Science"
            />

            <DetailItem
              label="Profession"
              value="Web Developer"
            />

            <DetailItem
              label="Employment"
              value="Full-time"
            />

            <DetailItem
              label="Industry"
              value="Technology"
            />

            <DetailItem
              label="Work location"
              value="Toronto, Canada"
            />
          </div>
        </section>

        {/* Family */}
        <section
          id="family"
          className={styles.card}
        >
          <SectionHeader
            icon={<FiUsers aria-hidden="true" />}
            title="Family"
            subtitle="Family background"
          />

          <div className={styles.detailGrid}>
            <DetailItem
              label="Family type"
              value="Nuclear family"
            />

            <DetailItem
              label="Family location"
              value="Toronto, Canada"
            />

            <DetailItem
              label="Siblings"
              value="1 sibling"
            />
          </div>
        </section>

        {/* Lifestyle */}
        <section
          id="lifestyle"
          className={styles.card}
        >
          <SectionHeader
            icon={<FiHeart aria-hidden="true" />}
            title="Lifestyle"
            subtitle="Everyday preferences and habits"
          />

          <div className={styles.lifestyleGrid}>
            <LifestyleItem
              label="Diet"
              value="Vegetarian"
            />

            <LifestyleItem
              label="Smoking"
              value="Never"
            />

            <LifestyleItem
              label="Drinking"
              value="Occasionally"
            />

            <LifestyleItem
              label="Height"
              value="5'9&quot;"
            />
          </div>

          <div className={styles.interestsBlock}>
            <div className={styles.blockLabel}>
              Interests & hobbies
            </div>

            <div className={styles.interestList}>
              {interests.map((interest) => (
                <span
                  key={interest}
                  className={styles.interest}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Partner preferences */}
        <section
          id="preferences"
          className={styles.card}
        >
          <SectionHeader
            icon={<FiUsers aria-hidden="true" />}
            title="Partner preferences"
            subtitle="The kind of connection you are looking for"
          />

          <div className={styles.preferenceList}>
            <PreferenceRow
              label="Age"
              value="26 – 33 years"
            />

            <PreferenceRow
              label="Location"
              value="Canada"
            />

            <PreferenceRow
              label="Education"
              value="Bachelor's or above"
            />

            <PreferenceRow
              label="Profession"
              value="Any profession"
            />

            <PreferenceRow
              label="Marital status"
              value="Never married"
            />
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideCard}>
          <div className={styles.sideCardHeader}>
            <span className={styles.sideIcon}>
              <FiShield aria-hidden="true" />
            </span>

            <div>
              <strong>Trust & verification</strong>
              <span>Visible profile signals</span>
            </div>
          </div>

          <div className={styles.verificationList}>
            <VerificationRow
              label="Email"
              value="Verified"
              verified
            />

            <VerificationRow
              label="Phone"
              value="Verified"
              verified
            />

            <VerificationRow
              label="Identity"
              value="Pending"
            />
          </div>

          <Link
            href="/dashboard/verification"
            className={styles.sideLink}
          >
            Manage verification
          </Link>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideCardHeader}>
            <span className={styles.sideIcon}>
              <FiHome aria-hidden="true" />
            </span>

            <div>
              <strong>Profile visibility</strong>
              <span>Control what others can see</span>
            </div>
          </div>

          <div className={styles.visibilityItem}>
            <span className={styles.visibilityDot} />
            <div>
              <strong>Profile is visible</strong>
              <span>
                Your public profile can appear in discovery.
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/settings/privacy"
            className={styles.sideLink}
          >
            Privacy controls
          </Link>
        </div>

        <div className={styles.tipCard}>
          <span className={styles.tipIcon}>
            <FiLock aria-hidden="true" />
          </span>

          <div>
            <strong>Your private details stay private</strong>
            <p>
              Contact details, government documents and other
              sensitive information are not part of this public
              preview.
            </p>
          </div>
        </div>
      </aside>
    </div>

    {/* Bottom CTA */}
    <section className={styles.bottomCta}>
      <div className={styles.ctaIcon}>
        <FiHeart aria-hidden="true" />
      </div>

      <div className={styles.ctaContent}>
        <span className={styles.ctaEyebrow}>
          Keep your profile fresh
        </span>

        <h2>Make your profile feel like you.</h2>

        <p>
          Add your personality, interests and preferences so
          people can get a better sense of who you are.
        </p>
      </div>

      <Link
        href="/dashboard/profile/edit"
        className={styles.ctaButton}
      >
        <FiEdit3 aria-hidden="true" />
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
return ( <div className={styles.sectionHeader}> <span className={styles.sectionIcon}>{icon}</span>


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
value: string;
}) {
return ( <div className={styles.detailItem}> <span>{label}</span> <strong>{value}</strong> </div>
);
}

function LifestyleItem({
label,
value,
}: {
label: string;
value: string;
}) {
return ( <div className={styles.lifestyleItem}> <span>{label}</span> <strong>{value}</strong> </div>
);
}

function PreferenceRow({
label,
value,
}: {
label: string;
value: string;
}) {
return ( <div className={styles.preferenceRow}> <span>{label}</span> <strong>{value}</strong> </div>
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
return ( <div className={styles.verificationRow}> <div> <span>{label}</span> <strong>{value}</strong> </div>

  <span
    className={
      verified
        ? styles.verifiedStatus
        : styles.pendingStatus
    }
  >
    {verified && <FiCheck aria-hidden="true" />}
    {value}
  </span>
</div>


);
}

function FiEyeIcon() {
return ( <span className={styles.eyeIcon} aria-hidden="true">
◉ </span>
);
}
