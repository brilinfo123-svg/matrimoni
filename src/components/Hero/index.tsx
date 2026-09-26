import Link from "next/link";
import Image from "next/image";
import {
  FiArrowRight,
  FiHeart,
  FiSearch,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import styles from "./index.module.scss";

const stats = [
  {
    value: "10K+",
    label: "Profiles",
  },
  {
    value: "5K+",
    label: "Connections",
  },
  {
    value: "1K+",
    label: "Success Stories",
  },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        <div className={styles.heroContent}>

          {/* Left Content */}
          <div className={styles.content}>

            {/* Eyebrow */}
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowIcon}>
                <FiHeart aria-hidden="true" />
              </span>

              <span>
                Meaningful connections start here
              </span>
            </div>

            {/* Heading */}
            <h1 className={styles.title}>
              Find someone who
              <span> fits your life.</span>
            </h1>

            {/* Description */}
            <p className={styles.description}>
              Discover genuine people who share your values,
              interests, lifestyle, and vision for the future.
              Your meaningful connection could be closer than
              you think.
            </p>

            {/* CTA */}
            <div className={styles.actions}>
              <Link
                href="/search"
                className={styles.primaryButton}
              >
                <FiSearch aria-hidden="true" />

                <span>
                  Discover Profiles
                </span>

                <FiArrowRight
                  className={styles.buttonArrow}
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/register"
                className={styles.secondaryButton}
              >
                Create Your Profile
              </Link>
            </div>

            {/* Trust */}
            <div className={styles.trust}>
              <div className={styles.trustIcon}>
                <FiShield aria-hidden="true" />
              </div>

              <div>
                <strong>
                  Privacy comes first
                </strong>

                <span>
                  Your profile, your choices, your control.
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className={styles.stats}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={styles.stat}
                >
                  <strong>
                    {stat.value}
                  </strong>

                  <span>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className={styles.visual}>

            {/* Decorative Circle */}
            <div className={styles.visualCircle} />

            {/* Main Card */}
            <div className={styles.profileCard}>

              <div className={styles.profileImage}>
                {/* <div className={styles.imagePlaceholder}>
                  
                  <FiUsers aria-hidden="true" />
                </div> */}
                <Image src="/public/images/hero/copleImg.png" alt="Profile" fill className={styles.coupleImage} sizes="(max-width: 768px) 100vw, 50vw" priority/>
                <span className={styles.verifiedBadge}>
                  <FiShield aria-hidden="true" />
                  Verified
                </span>
              </div>

              <div className={styles.profileInfo}>
                <div>
                  <h2>
                    Your next chapter
                  </h2>

                  <p>
                    Could start with a meaningful
                    connection.
                  </p>
                </div>

                <div className={styles.heartButton}>
                  <FiHeart aria-hidden="true" />
                </div>
              </div>

              <div className={styles.matchInfo}>
                <span className={styles.matchLabel}>
                  Compatibility
                </span>

                <strong>
                  92%
                </strong>
              </div>

              <div className={styles.progress}>
                <span />
              </div>
            </div>

            {/* Floating Card - Match */}
            <div className={`${styles.floatingCard} ${styles.matchCard}`}>
              <div className={styles.floatingIcon}>
                <FiHeart aria-hidden="true" />
              </div>

              <div>
                <strong>
                  Meaningful Match
                </strong>

                <span>
                  Based on your preferences
                </span>
              </div>
            </div>

            {/* Floating Card - People */}
            <div
              className={`${styles.floatingCard} ${styles.peopleCard}`}
            >
              <div className={styles.avatarStack}>
                <span>AK</span>
                <span>RS</span>
                <span>+</span>
              </div>

              <div>
                <strong>
                  New connections
                </strong>

                <span>
                  Waiting to be discovered
                </span>
              </div>
            </div>

            {/* Decorative Hearts */}
            <div className={styles.decorHeartOne}>
              <FiHeart aria-hidden="true" />
            </div>

            <div className={styles.decorHeartTwo}>
              <FiHeart aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}