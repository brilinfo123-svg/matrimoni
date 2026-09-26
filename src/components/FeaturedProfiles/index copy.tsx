import Link from "next/link";
import {
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiHeart,
  FiMapPin,
} from "react-icons/fi";

import styles from "./index.module.scss";

interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  profession: string;
  compatibility: number;
  image: string;
  initials: string;
  verified: boolean;
  education: string;
}

const profiles: Profile[] = [
  {
    id: 1,
    name: "Ananya",
    age: 28,
    location: "Mumbai, India",
    profession: "Product Designer",
    compatibility: 94,
    image: "/images/profiles/profile-1.jpg",
    initials: "AN",
    verified: true,
    education: "MBA, Design",
  },
  {
    id: 2,
    name: "Rahul",
    age: 30,
    location: "Delhi, India",
    profession: "Software Engineer",
    compatibility: 91,
    image: "/images/profiles/profile-2.jpg",
    initials: "RA",
    verified: true,
    education: "B.Tech, Computer Science",
  },
  {
    id: 3,
    name: "Priya",
    age: 27,
    location: "Bengaluru, India",
    profession: "Marketing Manager",
    compatibility: 89,
    image: "/images/profiles/profile-3.jpg",
    initials: "PR",
    verified: true,
    education: "MBA, Marketing",
  },
  {
    id: 4,
    name: "Arjun",
    age: 29,
    location: "Pune, India",
    profession: "Entrepreneur",
    compatibility: 87,
    image: "/images/profiles/profile-4.jpg",
    initials: "AR",
    verified: false,
    education: "B.Com, Business",
  },
];

export default function FeaturedProfiles() {
  return (
    <section className={styles.section}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        <div className={styles.sectionHeader}>
          <div className={styles.headerContent}>
            {/* <div className={styles.eyebrow}>
              <span className={styles.eyebrowIcon}>
                <FiHeart aria-hidden="true" />
              </span>

              <span>People worth knowing</span>
            </div> */}

            <h2 className={styles.title}>
              Meet people who could
              <span> fit your world.</span>
            </h2>

            {/* <p className={styles.description}>
              Explore a selection of profiles from people looking
              for genuine connections, shared values, and a
              meaningful future.
            </p> */}
          </div>

          
        </div>

        <div className={styles.profileGrid}>
          {profiles.map((profile) => (
            <article
              key={profile.id}
              className={styles.profileCard}
            >
              <div className={styles.imageWrapper}>
                <div className={styles.imagePlaceholder}>
                  <span>{profile.initials}</span>
                </div>

                <div className={styles.imageOverlay} />

                <div className={styles.topRow}>
                  {profile.verified && (
                    <span className={styles.verified}>
                      <FiCheck aria-hidden="true" />
                      Verified
                    </span>
                  )}

                  <button
                    type="button"
                    className={styles.favoriteButton}
                    aria-label={`Add ${profile.name} to shortlist`}
                  >
                    <FiHeart aria-hidden="true" />
                  </button>
                </div>

                <div className={styles.compatibility}>
                  <span>Compatibility</span>
                  <strong>{profile.compatibility}%</strong>
                </div>
              </div>

              <div className={styles.profileContent}>
                <div className={styles.nameRow}>
                  <h3>
                    {profile.name}, {profile.age}
                  </h3>

                  {profile.verified && (
                    <span
                      className={styles.verifiedSmall}
                      aria-label="Verified profile"
                    >
                      <FiCheck aria-hidden="true" />
                    </span>
                  )}
                </div>

                <div className={styles.location}>
                  <FiMapPin aria-hidden="true" />
                  <span>{profile.location}</span>
                </div>

                <div className={styles.profession}>
                  <FiBriefcase aria-hidden="true" />
                  <span>{profile.profession}</span>
                </div>

                <div className={styles.details}>
                  <span>{profile.education}</span>
                  <span className={styles.detailDot}>•</span>
                  <span>{profile.profession}</span>
                </div>

                <Link
                  href={`/profile/${profile.id}`}
                  className={styles.viewProfile}
                >
                  <span>View profile</span>
                  <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.mobileViewAll}>
          <Link
            href="/search"
            className={styles.viewAllButton}
          >
            <span>Explore all profiles</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        {/* <div className={styles.bottomNote}>
          <span className={styles.noteIcon}>
            <FiCheck aria-hidden="true" />
          </span>

          <p>
            Profiles are shown based on preferences and
            compatibility. You stay in control of who you
            connect with.
          </p>
        </div> */}
      </div>
      <div className={styles.viewAll}><Link href="/search" className={styles.desktopViewAll}><span>View all profiles</span><FiArrowRight aria-hidden="true" /></Link></div>
    </section>
  );
}