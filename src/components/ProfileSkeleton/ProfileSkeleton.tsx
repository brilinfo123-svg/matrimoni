"use client";

import styles from "./profileSkeleton.module.scss";

export default function ProfileSkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        {/* Top Bar */}
        <div className={styles.topBar}>
          <div className={`${styles.skeleton} ${styles.backButton}`} />

          <div className={`${styles.skeleton} ${styles.lineShort}`} />

          <div className={`${styles.skeleton} ${styles.moreButton}`} />
        </div>

        {/* Profile Hero */}
        <section className={styles.profileHero}>
          {/* Profile Photo */}
          <div className={styles.photoSection}>
            <div className={`${styles.skeleton} ${styles.profilePhoto}`} />

            <div className={styles.photoCount}>
              <div
                className={`${styles.skeleton} ${styles.countNumber}`}
              />
              <div className={`${styles.skeleton} ${styles.countText}`} />
            </div>
          </div>

          {/* Profile Info */}
          <div className={styles.profileInfo}>
            <div className={styles.statusRow}>
              <div className={`${styles.skeleton} ${styles.badge}`} />
            </div>

            <div className={`${styles.skeleton} ${styles.name}`} />

            <div className={`${styles.skeleton} ${styles.subtitle}`} />

            <div className={styles.location}>
              <div
                className={`${styles.skeleton} ${styles.locationIcon}`}
              />
              <div
                className={`${styles.skeleton} ${styles.locationText}`}
              />
            </div>

            {/* Compatibility */}
            <div className={styles.compatibility}>
              <div className={`${styles.skeleton} ${styles.matchCircle}`} />

              <div className={styles.compatibilityContent}>
                <div
                  className={`${styles.skeleton} ${styles.compatibilityTitle}`}
                />

                <div
                  className={`${styles.skeleton} ${styles.compatibilityText}`}
                />

                <div
                  className={`${styles.skeleton} ${styles.compatibilityTextShort}`}
                />
              </div>

              <div
                className={`${styles.skeleton} ${styles.chevron}`}
              />
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <div
                className={`${styles.skeleton} ${styles.actionLarge}`}
              />

              <div
                className={`${styles.skeleton} ${styles.actionSmall}`}
              />

              <div
                className={`${styles.skeleton} ${styles.actionSmall}`}
              />

              <div
                className={`${styles.skeleton} ${styles.actionSmall}`}
              />
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className={styles.contentLayout}>
          <main>
            {/* About */}
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div
                  className={`${styles.skeleton} ${styles.sectionIcon}`}
                />

                <div
                  className={`${styles.skeleton} ${styles.sectionTitle}`}
                />
              </div>

              <div className={styles.textGroup}>
                <div className={`${styles.skeleton} ${styles.text}`} />
                <div className={`${styles.skeleton} ${styles.text}`} />
                <div
                  className={`${styles.skeleton} ${styles.textMedium}`}
                />
              </div>
            </section>

            {/* Details */}
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div
                  className={`${styles.skeleton} ${styles.sectionIcon}`}
                />

                <div
                  className={`${styles.skeleton} ${styles.sectionTitle}`}
                />
              </div>

              <div className={styles.detailsGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className={styles.detailItem}
                  >
                    <div
                      className={`${styles.skeleton} ${styles.detailLabel}`}
                    />

                    <div
                      className={`${styles.skeleton} ${styles.detailValue}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Photos */}
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <div
                  className={`${styles.skeleton} ${styles.sectionIcon}`}
                />

                <div
                  className={`${styles.skeleton} ${styles.sectionTitle}`}
                />
              </div>

              <div className={styles.photos}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.skeleton} ${styles.photo}`}
                  />
                ))}
              </div>
            </section>
          </main>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <section className={styles.sideCard}>
              <div className={styles.sideHeader}>
                <div
                  className={`${styles.skeleton} ${styles.sideIcon}`}
                />

                <div>
                  <div
                    className={`${styles.skeleton} ${styles.sideEyebrow}`}
                  />

                  <div
                    className={`${styles.skeleton} ${styles.sideTitle}`}
                  />
                </div>
              </div>

              <div className={styles.sideDescription}>
                <div
                  className={`${styles.skeleton} ${styles.text}`}
                />

                <div
                  className={`${styles.skeleton} ${styles.textMedium}`}
                />
              </div>

              <div className={styles.verificationList}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={styles.verificationItem}
                  >
                    <div
                      className={`${styles.skeleton} ${styles.verificationIcon}`}
                    />

                    <div
                      className={`${styles.skeleton} ${styles.verificationText}`}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Privacy */}
            <section className={styles.privacyCard}>
              <div
                className={`${styles.skeleton} ${styles.privacyIcon}`}
              />

              <div className={styles.privacyContent}>
                <div
                  className={`${styles.skeleton} ${styles.privacyTitle}`}
                />

                <div
                  className={`${styles.skeleton} ${styles.privacyText}`}
                />

                <div
                  className={`${styles.skeleton} ${styles.privacyText}`}
                />
              </div>
            </section>
          </aside>
        </div>

        {/* Bottom CTA */}
        <section className={styles.bottomCta}>
          <div className={styles.ctaContent}>
            <div
              className={`${styles.skeleton} ${styles.ctaIcon}`}
            />

            <div>
              <div
                className={`${styles.skeleton} ${styles.ctaTitle}`}
              />

              <div
                className={`${styles.skeleton} ${styles.ctaText}`}
              />
            </div>
          </div>

          <div
            className={`${styles.skeleton} ${styles.ctaButton}`}
          />
        </section>
      </div>
    </div>
  );
}
