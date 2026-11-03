
"use client";

import { FiCheck, FiHeart } from "react-icons/fi";
import styles from "./RegisterSuccess.module.scss";

export default function RegisterSuccess() {
  return (
    <main className={styles.successPage}>
      <div className={styles.backgroundGlow} />
      <div className={styles.floatingHeart}>♥</div>
      <div className={styles.floatingHeartTwo}>♥</div>

      <div className={styles.successWrapper}>
        {/* Couple image */}
        <div className={styles.coupleSection}>
          <div className={styles.heartOutline}>♡</div>

          <img
            src="public/images/backgrounds/RomanticCoupleBurgundy.png"
            alt="Happy couple"
            className={styles.coupleImage}
          />
        </div>

        {/* Success card */}
        <section className={styles.successCard}>
          <div className={styles.successIcon}>
            <FiHeart />
            <span>
              <FiCheck />
            </span>
          </div>

          <h1 className={styles.welcomeTitle}>
            <span className={styles.welcomeLine}>
              Welcome to
            </span>

            <span className={styles.brandName}>
              EverMilan!
            </span>
          </h1>

          <p className={styles.description}>
            Your profile has been created successfully.
            <br />
            A beautiful new beginning awaits you.
          </p>

          <div className={styles.redirect}>
            <span className={styles.loader} />
            <p>Taking you to your matches...</p>
          </div>
        </section>
      </div>
    </main>
  );
}