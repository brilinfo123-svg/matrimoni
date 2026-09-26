import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiHeart,
  FiShield,
  FiUserPlus,
} from "react-icons/fi";

import styles from "./index.module.scss";

const trustPoints = [
  "Create your profile at your own pace",
  "Choose what you want to share",
  "Discover people based on meaningful compatibility",
];

export default function CallToAction() {
  return (
    <section className={styles.section}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.decorativeCircleOne} />
          <div className={styles.decorativeCircleTwo} />

          <div className={styles.content}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowIcon}>
                <FiHeart aria-hidden="true" />
              </span>
              <span>Your journey starts here</span>
            </div>

            <h2 className={styles.title}>
              Ready to find someone
              <span> who fits your world?</span>
            </h2>

            <p className={styles.description}>
              Create a profile, discover meaningful connections,
              and take the next step at your own pace. No pressure.
              Just a better way to meet someone who shares what
              matters to you.
            </p>

            <div className={styles.actions}>
              <Link href="/register" className={styles.primaryButton}>
                <FiUserPlus aria-hidden="true" />
                <span>Create Your Profile</span>
                <FiArrowRight aria-hidden="true" />
              </Link>

              <Link href="/search" className={styles.secondaryButton}>
                <span>Explore Profiles</span>
              </Link>
            </div>

            <div className={styles.trustRow}>
              {trustPoints.map((point) => (
                <div key={point} className={styles.trustItem}>
                  <span className={styles.checkIcon}>
                    <FiCheck aria-hidden="true" />
                  </span>

                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.visual}>
            <div className={styles.heartGlow} />

            <div className={styles.heartOrb}>
              <FiHeart aria-hidden="true" />
            </div>

            <div className={`${styles.floatingCard} ${styles.cardOne}`}>
              <span className={styles.floatingIcon}>
                <FiHeart aria-hidden="true" />
              </span>

              <div>
                <strong>Meaningful</strong>
                <span>Connections</span>
              </div>
            </div>

            <div className={`${styles.floatingCard} ${styles.cardTwo}`}>
              <span className={styles.floatingIcon}>
                <FiShield aria-hidden="true" />
              </span>

              <div>
                <strong>Privacy</strong>
                <span>In your control</span>
              </div>
            </div>

            <div className={styles.sparkleOne} />
            <div className={styles.sparkleTwo} />
            <div className={styles.sparkleThree} />
          </div>
        </div>

        <div className={styles.bottomNote}>
          <span className={styles.noteIcon}>
            <FiShield aria-hidden="true" />
          </span>

          <p>
            Take your time. Share only what you are comfortable
            sharing and stay in control of your experience.
          </p>
        </div>
      </div>
    </section>
  );
}
