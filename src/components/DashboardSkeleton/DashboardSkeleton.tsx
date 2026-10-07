"use client";

import styles from "./DashboardSkeleton.module.scss";

export default function DashboardSkeleton() {
  return (
    <main
      className={styles.page}
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className={styles.backgroundGlow} />

      <div className={"container"}>
        {/* Header Skeleton */}
        <div className={styles.skeletonHeader}>
          <div className={styles.headerContent}>
            <span className={`${styles.skeleton} ${styles.eyebrow}`} />

            <span className={`${styles.skeleton} ${styles.title}`} />

            <span className={`${styles.skeleton} ${styles.subtitle}`} />
          </div>

          <div className={styles.headerActions}>
            <span className={`${styles.skeleton} ${styles.button}`} />
            <span className={`${styles.skeleton} ${styles.iconButton}`} />
            <span className={`${styles.skeleton} ${styles.avatar}`} />
          </div>
        </div>

        {/* Profile Completion */}
        <section className={styles.completion}>
          <div className={styles.completionMain}>
            <span
              className={`${styles.skeleton} ${styles.completionIcon}`}
            />

            <div className={styles.completionContent}>
              <div className={styles.titleRow}>
                <span
                  className={`${styles.skeleton} ${styles.smallTitle}`}
                />

                <span
                  className={`${styles.skeleton} ${styles.percent}`}
                />
              </div>

              <span
                className={`${styles.skeleton} ${styles.textLine}`}
              />

              <span
                className={`${styles.skeleton} ${styles.progress}`}
              />
            </div>
          </div>

          <span
            className={`${styles.skeleton} ${styles.completionButton}`}
          />
        </section>

        {/* Stats */}
        <section className={styles.statsGrid}>
          {[1, 2, 3, 4].map((item) => (
            <div className={styles.statCard} key={item}>
              <span
                className={`${styles.skeleton} ${styles.statIcon}`}
              />

              <div className={styles.statContent}>
                <span
                  className={`${styles.skeleton} ${styles.statLabel}`}
                />

                <span
                  className={`${styles.skeleton} ${styles.statValue}`}
                />

                <span
                  className={`${styles.skeleton} ${styles.statDetail}`}
                />
              </div>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className={styles.actionGrid}>
          {[1, 2].map((item) => (
            <div className={styles.actionCard} key={item}>
              <div className={styles.actionHeader}>
                <div>
                  <span
                    className={`${styles.skeleton} ${styles.cardEyebrow}`}
                  />

                  <span
                    className={`${styles.skeleton} ${styles.cardTitle}`}
                  />
                </div>

                <span
                  className={`${styles.skeleton} ${styles.roundIcon}`}
                />
              </div>

              <span
                className={`${styles.skeleton} ${styles.wideLine}`}
              />

              <span
                className={`${styles.skeleton} ${styles.wideLineShort}`}
              />

              <div className={styles.actionItems}>
                {[1, 2, 3, 4].map((action) => (
                  <span
                    key={action}
                    className={`${styles.skeleton} ${styles.actionItem}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Profiles */}
        <section className={styles.profileSection}>
          <div className={styles.sectionHeader}>
            <div>
              <span
                className={`${styles.skeleton} ${styles.cardEyebrow}`}
              />

              <span
                className={`${styles.skeleton} ${styles.sectionTitle}`}
              />

              <span
                className={`${styles.skeleton} ${styles.sectionSubtitle}`}
              />
            </div>

            <span
              className={`${styles.skeleton} ${styles.viewAll}`}
            />
          </div>

          <div className={styles.profileGrid}>
            {[1, 2, 3, 4].map((item) => (
              <div className={styles.profileCard} key={item}>
                <span
                  className={`${styles.skeleton} ${styles.profileImage}`}
                />

                <div className={styles.profileInfo}>
                  <span
                    className={`${styles.skeleton} ${styles.profileName}`}
                  />

                  <span
                    className={`${styles.skeleton} ${styles.profileMeta}`}
                  />

                  <span
                    className={`${styles.skeleton} ${styles.profileMetaShort}`}
                  />

                  <span
                    className={`${styles.skeleton} ${styles.profileButton}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Cards */}
        <section className={styles.bottomGrid}>
          {/* Messages */}
          <div className={styles.bottomCard}>
            <div className={styles.sectionHeader}>
              <div>
                <span
                  className={`${styles.skeleton} ${styles.cardEyebrow}`}
                />

                <span
                  className={`${styles.skeleton} ${styles.smallSectionTitle}`}
                />
              </div>

              <span
                className={`${styles.skeleton} ${styles.viewAll}`}
              />
            </div>

            <div className={styles.messageList}>
              {[1, 2, 3].map((item) => (
                <div className={styles.message} key={item}>
                  <span
                    className={`${styles.skeleton} ${styles.messageAvatar}`}
                  />

                  <div className={styles.messageText}>
                    <span
                      className={`${styles.skeleton} ${styles.messageName}`}
                    />

                    <span
                      className={`${styles.skeleton} ${styles.messageLine}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <span
              className={`${styles.skeleton} ${styles.fullButton}`}
            />
          </div>

          {/* Insights */}
          <div className={styles.bottomCard}>
            <div className={styles.sectionHeader}>
              <div>
                <span
                  className={`${styles.skeleton} ${styles.cardEyebrow}`}
                />

                <span
                  className={`${styles.skeleton} ${styles.smallSectionTitle}`}
                />
              </div>

              <span
                className={`${styles.skeleton} ${styles.roundIcon}`}
              />
            </div>

            <div className={styles.insightMain}>
              <span
                className={`${styles.skeleton} ${styles.insightNumber}`}
              />

              <span
                className={`${styles.skeleton} ${styles.insightLabel}`}
              />
            </div>

            <div className={styles.insightBars}>
              {[1, 2, 3, 4, 5, 6, 7].map((item) => (
                <span
                  key={item}
                  className={`${styles.skeleton} ${styles.bar} ${styles[`bar${item}`]}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <div className={styles.privacy}>
          <span
            className={`${styles.skeleton} ${styles.privacyIcon}`}
          />

          <div>
            <span
              className={`${styles.skeleton} ${styles.privacyTitle}`}
            />

            <span
              className={`${styles.skeleton} ${styles.privacyText}`}
            />
          </div>

          <span
            className={`${styles.skeleton} ${styles.privacyLink}`}
          />
        </div>
      </div>
    </main>
  );
}
