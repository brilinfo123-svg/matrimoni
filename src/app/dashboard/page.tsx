"use client";

import Link from "next/link";
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
  id: number;
  name: string;
  age: number;
  city: string;
  profession: string;
  compatibility: number;
  initials: string;
  verified: boolean;
  online: boolean;
};

const recommendedProfiles: Profile[] = [
  {
    id: 1,
    name: "Ananya Sharma",
    age: 28,
    city: "Toronto",
    profession: "Product Designer",
    compatibility: 94,
    initials: "AS",
    verified: true,
    online: true,
  },
  {
    id: 2,
    name: "Priya Mehta",
    age: 27,
    city: "Vancouver",
    profession: "Software Engineer",
    compatibility: 91,
    initials: "PM",
    verified: true,
    online: false,
  },
  {
    id: 3,
    name: "Meera Kapoor",
    age: 29,
    city: "Brampton",
    profession: "Marketing Manager",
    compatibility: 88,
    initials: "MK",
    verified: true,
    online: true,
  },
  {
    id: 4,
    name: "Riya Patel",
    age: 26,
    city: "Mississauga",
    profession: "Financial Analyst",
    compatibility: 86,
    initials: "RP",
    verified: false,
    online: false,
  },
];

const recentMessages = [
  {
    id: 1,
    name: "Ananya Sharma",
    initials: "AS",
    message: "It was lovely connecting with you.",
    time: "10m",
    unread: true,
  },
  {
    id: 2,
    name: "Priya Mehta",
    initials: "PM",
    message: "I saw your profile. We have a lot in common.",
    time: "1h",
    unread: true,
  },
  {
    id: 3,
    name: "Meera Kapoor",
    initials: "MK",
    message: "Thanks for accepting my interest.",
    time: "Yesterday",
    unread: false,
  },
];

export default function DashboardPage() {
  return (
    
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <div className={styles.container}>
        {/* =========================================
            TOP HEADER
        ========================================= */}

        <header className={styles.dashboardHeader}>
          <div>
            <span className={styles.eyebrow}>
              Your matrimonial journey
            </span>

            <h1>
              Good morning,
              <span> Akash.</span>
            </h1>

            <p>
              Here&apos;s what&apos;s happening with your
              profile today.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Link
              href="/search"
              className={styles.searchButton}
            >
              <FiSearch aria-hidden="true" />
              <span>Discover</span>
            </Link>

            <button
              type="button"
              className={styles.notificationButton}
              aria-label="Notifications"
            >
              <FiBell aria-hidden="true" />
              <span className={styles.notificationDot} />
            </button>

            <Link
              href="/dashboard/profile"
              className={styles.avatar}
              aria-label="Open profile"
            >
              AV
            </Link>
          </div>
        </header>

        {/* =========================================
            PROFILE COMPLETION
        ========================================= */}

        <section className={styles.completionCard}>
          <div className={styles.completionMain}>
            <div className={styles.completionIcon}>
              <FiUser aria-hidden="true" />
            </div>

            <div className={styles.completionText}>
              <div className={styles.completionTitleRow}>
                <h2>Complete your profile</h2>
                <strong>78%</strong>
              </div>

              <p>
                A complete profile gives people more context
                about you and helps personalize your
                recommendations.
              </p>

              <div className={styles.completionTrack}>
                <span style={{ width: "78%" }} />
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/profile/edit"
            className={styles.completionButton}
          >
            Complete profile
            <FiArrowRight aria-hidden="true" />
          </Link>
        </section>

        {/* =========================================
            QUICK STATS
        ========================================= */}

        <section className={styles.statsGrid}>
          <StatCard
            icon={<FiHeart aria-hidden="true" />}
            label="New interests"
            value="12"
            detail="3 since yesterday"
            href="/dashboard/interests"
          />

          <StatCard
            icon={<FiStar aria-hidden="true" />}
            label="Shortlisted"
            value="24"
            detail="5 new this week"
            href="/dashboard/shortlist"
          />

          <StatCard
            icon={<FiMessageCircle aria-hidden="true" />}
            label="Unread messages"
            value="4"
            detail="2 conversations"
            href="/dashboard/messages"
          />

          <StatCard
            icon={<FiUsers aria-hidden="true" />}
            label="Profile views"
            value="86"
            detail="18% more this week"
            href="/dashboard/profile"
          />
        </section>

        {/* =========================================
            VERIFICATION + QUICK ACTIONS
        ========================================= */}

        <section className={styles.actionGrid}>
          <div className={styles.verificationCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Trust & safety
                </span>

                <h2>Verify your profile</h2>
              </div>

              <div className={styles.verifiedIcon}>
                <FiShield aria-hidden="true" />
              </div>
            </div>

            <p>
              Verification can help people understand that
              your profile information has been reviewed.
            </p>

            <div className={styles.verificationSteps}>
              <VerificationItem
                completed
                label="Email verified"
              />

              <VerificationItem
                completed
                label="Phone verified"
              />

              <VerificationItem
                label="Identity verification"
              />
            </div>

            <Link
              href="/dashboard/verification"
              className={styles.outlineButton}
            >
              <span>View verification</span>
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.quickCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Quick actions
                </span>

                <h2>Keep exploring</h2>
              </div>

              <FiMoreHorizontal
                className={styles.moreIcon}
                aria-hidden="true"
              />
            </div>

            <div className={styles.quickActions}>
              <QuickAction
                href="/search"
                icon={<FiSearch aria-hidden="true" />}
                title="Discover"
                description="Find new profiles"
              />

              <QuickAction
                href="/dashboard/matches"
                icon={<FiHeart aria-hidden="true" />}
                title="Matches"
                description="See compatible profiles"
              />

              <QuickAction
                href="/dashboard/interests"
                icon={<FiUsers aria-hidden="true" />}
                title="Interests"
                description="Manage connections"
              />

              <QuickAction
                href="/dashboard/profile/edit"
                icon={<FiUser aria-hidden="true" />}
                title="Edit profile"
                description="Update your details"
              />
            </div>
          </div>
        </section>

        {/* =========================================
            RECOMMENDED PROFILES
        ========================================= */}

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.cardEyebrow}>
                Personalized for you
              </span>

              <h2>Recommended profiles</h2>

              <p>
                Based on your profile and current preferences.
              </p>
            </div>

            <Link
              href="/search"
              className={styles.viewAll}
            >
              View all
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.profileGrid}>
            {recommendedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
              />
            ))}
          </div>
        </section>

        {/* =========================================
            BOTTOM GRID
        ========================================= */}

        <section className={styles.bottomGrid}>
          {/* Messages */}

          <div className={styles.messagesCard}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Stay connected
                </span>

                <h2>Recent messages</h2>
              </div>

              <Link
                href="/dashboard/messages"
                className={styles.viewAll}
              >
                See all
                <FiChevronRight aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.messageList}>
              {recentMessages.map((message) => (
                <Link
                  href={`/dashboard/messages/${message.id}`}
                  className={styles.messageItem}
                  key={message.id}
                >
                  <div className={styles.messageAvatar}>
                    {message.initials}
                  </div>

                  <div className={styles.messageContent}>
                    <div className={styles.messageTop}>
                      <strong>{message.name}</strong>

                      <span>{message.time}</span>
                    </div>

                    <p>{message.message}</p>
                  </div>

                  {message.unread && (
                    <span className={styles.unreadDot} />
                  )}
                </Link>
              ))}
            </div>

            <Link
              href="/dashboard/messages"
              className={styles.messagesButton}
            >
              Open messages
              <FiMessageCircle aria-hidden="true" />
            </Link>
          </div>

          {/* Profile insights */}

          <div className={styles.insightsCard}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.cardEyebrow}>
                  Profile insights
                </span>

                <h2>This week</h2>
              </div>

              <FiBriefcase
                className={styles.insightIcon}
                aria-hidden="true"
              />
            </div>

            <div className={styles.insightHighlight}>
              <strong>86</strong>
              <span>profile views</span>

              <div className={styles.growth}>
                <FiArrowRight aria-hidden="true" />
                <span>18%</span>
              </div>
            </div>

            <div className={styles.insightBars}>
              <InsightBar day="Mon" value={42} />
              <InsightBar day="Tue" value={58} />
              <InsightBar day="Wed" value={48} />
              <InsightBar day="Thu" value={72} />
              <InsightBar day="Fri" value={64} />
              <InsightBar day="Sat" value={82} />
              <InsightBar day="Sun" value={95} />
            </div>

            <Link
              href="/dashboard/profile"
              className={styles.insightLink}
            >
              View profile insights
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* =========================================
            PRIVACY NOTE
        ========================================= */}

        <section className={styles.privacyNote}>
          <div className={styles.privacyIcon}>
            <FiShield aria-hidden="true" />
          </div>

          <div>
            <strong>Your privacy stays in your hands</strong>

            <p>
              Manage profile visibility, contact preferences
              and privacy controls whenever you want.
            </p>
          </div>

          <Link href="/dashboard/settings/privacy">
            Privacy settings
            <FiArrowRight aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}

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
    <Link href={href} className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>

      <div className={styles.statContent}>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>

      <FiChevronRight
        className={styles.statArrow}
        aria-hidden="true"
      />
    </Link>
  );
}

function VerificationItem({
  completed = false,
  label,
}: {
  completed?: boolean;
  label: string;
}) {
  return (
    <div className={styles.verificationItem}>
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
        <small>Verified</small>
      )}
    </div>
  );
}

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
    <Link href={href} className={styles.quickAction}>
      <span className={styles.quickIcon}>{icon}</span>

      <span className={styles.quickText}>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <FiChevronRight
        className={styles.quickArrow}
        aria-hidden="true"
      />
    </Link>
  );
}

function ProfileCard({
  profile,
}: {
  profile: Profile;
}) {
  return (
    <article className={styles.profileCard}>
      <Link
        href={`/profile/${profile.id}`}
        className={styles.profileVisual}
      >
        <div className={styles.profileInitials}>
          {profile.initials}
        </div>

        <div className={styles.profileGradient} />

        {profile.online && (
          <span className={styles.onlineBadge}>
            <span />
            Online
          </span>
        )}

        {profile.verified && (
          <span className={styles.profileVerified}>
            <FiCheck aria-hidden="true" />
            Verified
          </span>
        )}

        <span className={styles.compatibility}>
          <strong>{profile.compatibility}%</strong>
          <small>match</small>
        </span>
      </Link>

      <div className={styles.profileInfo}>
        <div className={styles.profileNameRow}>
          <Link
            href={`/profile/${profile.id}`}
            className={styles.profileName}
          >
            {profile.name}
          </Link>

          <button
            type="button"
            className={styles.favoriteButton}
            aria-label={`Shortlist ${profile.name}`}
          >
            <FiHeart aria-hidden="true" />
          </button>
        </div>

        <span className={styles.profileDetails}>
          {profile.age} years old
        </span>

        <span className={styles.profileMeta}>
          <FiMapPin aria-hidden="true" />
          {profile.city}
        </span>

        <span className={styles.profileMeta}>
          <FiBriefcase aria-hidden="true" />
          {profile.profession}
        </span>

        <Link
          href={`/profile/${profile.id}`}
          className={styles.profileButton}
        >
          View profile
          <FiArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

function InsightBar({
  day,
  value,
}: {
  day: string;
  value: number;
}) {
  return (
    <div className={styles.insightBarItem}>
      <div className={styles.barTrack}>
        <span style={{ height: `${value}%` }} />
      </div>

      <small>{day}</small>
    </div>
  );
}
