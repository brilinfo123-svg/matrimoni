import Link from "next/link";
import {
  FiArrowRight,
  FiCheck,
  FiEye,
  FiFlag,
  FiLock,
  FiShield,
  FiSlash,
  FiUserCheck,
} from "react-icons/fi";

import styles from "./index.module.scss";

const safetyFeatures = [
  {
    icon: FiUserCheck,
    title: "Profile verification",
    description:
      "Verification can help create a more trustworthy experience by giving people additional confidence when connecting.",
  },
  {
    icon: FiEye,
    title: "Privacy controls",
    description:
      "Choose what information you share and manage how your profile is visible to other members.",
  },
  {
    icon: FiFlag,
    title: "Report concerns",
    description:
      "If something feels wrong, you can report a profile or conversation so it can be reviewed.",
  },
  {
    icon: FiSlash,
    title: "Block unwanted contact",
    description:
      "You can block people you no longer want to interact with and take control of your conversations.",
  },
];

const safetyChecklist = [
  "Keep personal information private until you feel comfortable",
  "Take your time before moving a conversation offline",
  "Use profile and conversation controls when needed",
];

export default function SafetySection() {
  return (
    <section className={styles.section}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        <div className={styles.visual}>
          <div className={styles.visualGlow} />

          <div className={styles.securityCard}>
            <div className={styles.cardTop}>
              <div className={styles.shieldIcon}>
                <FiShield aria-hidden="true" />
              </div>

              <div>
                <span className={styles.cardLabel}>Your privacy</span>
                <strong>Stays in your hands</strong>
              </div>

              <span className={styles.statusDot} />
            </div>

            <div className={styles.securityLine}>
              <span className={styles.lineIcon}>
                <FiLock aria-hidden="true" />
              </span>

              <div>
                <strong>Private by design</strong>
                <span>Control what you share</span>
              </div>

              <FiCheck
                className={styles.lineCheck}
                aria-hidden="true"
              />
            </div>

            <div className={styles.securityLine}>
              <span className={styles.lineIcon}>
                <FiUserCheck aria-hidden="true" />
              </span>

              <div>
                <strong>Profile controls</strong>
                <span>Manage your visibility</span>
              </div>

              <FiCheck
                className={styles.lineCheck}
                aria-hidden="true"
              />
            </div>

            <div className={styles.securityLine}>
              <span className={styles.lineIcon}>
                <FiFlag aria-hidden="true" />
              </span>

              <div>
                <strong>Report & block</strong>
                <span>Handle unwanted interactions</span>
              </div>

              <FiCheck
                className={styles.lineCheck}
                aria-hidden="true"
              />
            </div>

            <div className={styles.cardFooter}>
              <span className={styles.footerPulse} />
              <span>Safety tools available when you need them</span>
            </div>
          </div>

          <div className={styles.floatingCard}>
            <div className={styles.floatingIcon}>
              <FiLock aria-hidden="true" />
            </div>

            <div>
              <strong>Privacy first</strong>
              <span>You choose what to share</span>
            </div>
          </div>

          <div className={styles.orbitOne} />
          <div className={styles.orbitTwo} />
        </div>

        <div className={styles.content}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowIcon}>
              <FiShield aria-hidden="true" />
            </span>
            <span>Safety & privacy</span>
          </div>

          <h2 className={styles.title}>
            Connect with confidence,
            <span> at your own pace.</span>
          </h2>

          <p className={styles.description}>
            Meaningful connections take trust. That is why your
            privacy, visibility, and ability to control
            interactions should always be part of the experience.
          </p>

          <div className={styles.featureGrid}>
            {safetyFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <div key={feature.title} className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <Icon aria-hidden="true" />
                  </div>

                  <div className={styles.featureContent}>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.safetyNote}>
            <div className={styles.noteIcon}>
              <FiCheck aria-hidden="true" />
            </div>

            <div>
              <strong>A few simple habits can help</strong>

              <ul>
                {safetyChecklist.map((item) => (
                  <li key={item}>
                    <span>
                      <FiCheck aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Link href="/safety" className={styles.learnMore}>
            <span>Learn more about safety</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

