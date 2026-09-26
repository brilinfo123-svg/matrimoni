import Link from "next/link";
import {
  FiArrowRight,
  FiHeart,
  FiMessageCircle,
  FiUserPlus,
} from "react-icons/fi";

import styles from "./index.module.scss";

const steps = [
  {
    number: "01",
    icon: FiUserPlus,
    title: "Create your profile",
    description:
      "Tell us about yourself, your lifestyle, values, interests, and what you're looking for in a meaningful relationship.",
  },
  {
    number: "02",
    icon: FiHeart,
    title: "Discover meaningful matches",
    description:
      "Explore profiles based on your preferences, shared interests, lifestyle, and compatibility.",
  },
  {
    number: "03",
    icon: FiMessageCircle,
    title: "Start a conversation",
    description:
      "When you find someone who feels right, send an interest and start getting to know each other.",
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        <div className={styles.heading}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowIcon}>
              <FiHeart aria-hidden="true" />
            </span>

            <span>Simple. Personal. Meaningful.</span>
          </div>

          <h2 className={styles.title}>
            Your journey to a
            <span> meaningful connection</span>
          </h2>

          <p className={styles.description}>
            Finding someone special doesn't have to be complicated.
            We've designed every step to make your journey feel
            natural, comfortable, and personal.
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className={styles.stepWrapper}>
                <article className={styles.step}>
                  <div className={styles.iconArea}>
                    <div className={styles.iconCircle}>
                      <Icon aria-hidden="true" />
                    </div>

                    <span className={styles.number}>
                      {step.number}
                    </span>
                  </div>

                  <div className={styles.content}>
                    <h3>{step.title}</h3>

                    <p>{step.description}</p>
                  </div>
                </article>

                {index < steps.length - 1 && (
                  <div className={styles.connector}>
                    <span />
                    <FiArrowRight aria-hidden="true" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.bottomCta}>
          <div className={styles.ctaContent}>
            <div className={styles.ctaIcon}>
              <FiHeart aria-hidden="true" />
            </div>

            <div>
              <h3>Ready to start your journey?</h3>

              <p>
                Create your profile and take the first step
                toward something meaningful.
              </p>
            </div>
          </div>

          <Link
            href="/register"
            className={styles.ctaButton}
          >
            <span>Create Your Profile</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}