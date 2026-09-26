import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiHeart,
  FiLock,
  FiShield,
  FiSliders,
  FiUsers,
} from "react-icons/fi";

import styles from "./index.module.scss";

const benefits = [
  {
    icon: FiSliders,
    title: "Compatibility beyond filters",
    description:
      "Go beyond age and location. Discover people based on values, lifestyle, interests, and relationship goals.",
  },
  {
    icon: FiShield,
    title: "Built around trust",
    description:
      "Verification, privacy controls, reporting tools, and thoughtful profile design help create a safer experience.",
  },
  {
    icon: FiLock,
    title: "Your privacy, your control",
    description:
      "Choose what you share, who can interact with you, and how visible your profile should be.",
  },
  {
    icon: FiUsers,
    title: "Connections that feel personal",
    description:
      "We focus on meaningful conversations and genuine compatibility instead of endless swiping.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        <div className={styles.layout}>
          <div className={styles.visualColumn}>
            <div className={styles.visualCard}>
              <div className={styles.visualTop}>
                <span className={styles.smallLabel}>
                  <FiShield aria-hidden="true" />
                  Designed around trust
                </span>

                <span className={styles.liveDot}>
                  <span />
                  Your privacy matters
                </span>
              </div>

              <div className={styles.centerVisual}>
                <div className={styles.outerCircle}>
                  <div className={styles.middleCircle}>
                    <div className={styles.innerCircle}>
                      <FiHeart aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <span
                  className={`${styles.orbitItem} ${styles.orbitOne}`}
                >
                  <FiShield aria-hidden="true" />
                </span>

                <span
                  className={`${styles.orbitItem} ${styles.orbitTwo}`}
                >
                  <FiUsers aria-hidden="true" />
                </span>

                <span
                  className={`${styles.orbitItem} ${styles.orbitThree}`}
                >
                  <FiLock aria-hidden="true" />
                </span>

                <span
                  className={`${styles.orbitItem} ${styles.orbitFour}`}
                >
                  <FiCheck aria-hidden="true" />
                </span>
              </div>

              <div className={styles.trustStats}>
                <div className={styles.trustStat}>
                  <strong>100%</strong>
                  <span>Your choices</span>
                </div>

                <div className={styles.statDivider} />

                <div className={styles.trustStat}>
                  <strong>24/7</strong>
                  <span>Profile controls</span>
                </div>

                <div className={styles.statDivider} />

                <div className={styles.trustStat}>
                  <strong>Private</strong>
                  <span>By design</span>
                </div>
              </div>
            </div>

            <div className={styles.floatingMessage}>
              <span className={styles.floatingIcon}>
                <FiCheck aria-hidden="true" />
              </span>

              <div>
                <strong>Connection made meaningful</strong>
                <span>Based on more than just a photo.</span>
              </div>
            </div>
          </div>

          <div className={styles.contentColumn}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowIcon}>
                <FiHeart aria-hidden="true" />
              </span>

              <span>More than a matrimonial platform</span>
            </div>

            <h2 className={styles.title}>
              Built for people who want
              <span> something real.</span>
            </h2>

            <p className={styles.description}>
              We believe finding a life partner should be about
              understanding people, not simply matching filters.
              Every part of the experience is designed to help you
              make thoughtful connections.
            </p>

            <div className={styles.benefits}>
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className={styles.benefit}
                  >
                    <div className={styles.benefitIcon}>
                      <Icon aria-hidden="true" />
                    </div>

                    <div className={styles.benefitContent}>
                      <h3>{benefit.title}</h3>

                      <p>{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link
              href="/safety"
              className={styles.learnMore}
            >
              <span>Learn about safety & privacy</span>
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}