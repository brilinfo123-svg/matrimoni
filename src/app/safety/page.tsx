import Link from "next/link";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiEye,
  FiFlag,
  FiHeart,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiPhone,
  FiShield,
  FiSlash,
  FiUserCheck,
} from "react-icons/fi";

import styles from "./safety.module.scss";

const safetyTips = [
  {
    number: "01",
    icon: FiUserCheck,
    title: "Keep your profile authentic",
    description:
      "Use honest information and photos that represent you accurately. Genuine profiles make it easier to build trust from the beginning.",
  },
  {
    number: "02",
    icon: FiLock,
    title: "Protect personal information",
    description:
      "Avoid sharing your home address, financial information, passwords, government ID details, or other sensitive information too early.",
  },
  {
    number: "03",
    icon: FiMessageCircle,
    title: "Take conversations at your pace",
    description:
      "There is no need to rush a connection. Spend enough time getting to know someone before deciding to move the conversation elsewhere.",
  },
  {
    number: "04",
    icon: FiEye,
    title: "Pay attention to consistency",
    description:
      "Look for consistency between someone's profile, conversations, and behavior. If something feels unusual, take your time before continuing.",
  },
  {
    number: "05",
    icon: FiMapPin,
    title: "Choose public places",
    description:
      "When meeting someone for the first time, choose a busy public location and let someone you trust know where you are going.",
  },
  {
    number: "06",
    icon: FiAlertCircle,
    title: "Never send money",
    description:
      "Be cautious if someone asks for money, financial assistance, gift cards, investments, loans, or emergency payments.",
  },
];

const warningSigns = [
  "They quickly ask to move the conversation away from the platform.",
  "They avoid reasonable questions about their identity or background.",
  "Their story frequently changes or important details do not match.",
  "They pressure you to make decisions quickly.",
  "They ask for money, financial information, or expensive gifts.",
  "They become controlling, threatening, disrespectful, or manipulative.",
];

const protectionSteps = [
  "Use privacy controls to decide what information you want to share.",
  "Block people you no longer want to communicate with.",
  "Report suspicious profiles or conversations.",
  "Keep your login details private and use a strong password.",
  "Meet in public and arrange your own transportation.",
  "Trust your instincts and leave a situation if you feel uncomfortable.",
];

export default function SafetyPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGlowTwo} />

        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowIcon}>
                  <FiShield aria-hidden="true" />
                </span>
                <span>Safety & privacy</span>
              </div>

              <h1 className={styles.heroTitle}>
                Connect with confidence.
                <span> Stay in control.</span>
              </h1>

              <p className={styles.heroDescription}>
                Meaningful relationships begin with trust. These simple
                safety practices can help you protect your privacy,
                recognize warning signs, and feel more confident while
                getting to know someone.
              </p>

              <div className={styles.heroActions}>
                <a
                  href="#safety-tips"
                  className={styles.primaryButton}
                >
                  <span>Explore safety tips</span>
                  <FiArrowRight aria-hidden="true" />
                </a>

                <Link
                  href="/search"
                  className={styles.secondaryButton}
                >
                  Discover profiles
                </Link>
              </div>

              <div className={styles.heroTrust}>
                <div className={styles.heroTrustIcon}>
                  <FiLock aria-hidden="true" />
                </div>

                <div>
                  <strong>Your privacy matters</strong>
                  <span>
                    Share information only when you feel comfortable.
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.heroVisual}>
              <div className={styles.visualGlow} />

              <div className={styles.shieldOrb}>
                <div className={styles.orbRing} />
                <div className={styles.orbIcon}>
                  <FiShield aria-hidden="true" />
                </div>
              </div>

              <div className={`${styles.floatingCard} ${styles.cardOne}`}>
                <div className={styles.floatingIcon}>
                  <FiLock aria-hidden="true" />
                </div>

                <div>
                  <strong>Privacy first</strong>
                  <span>You choose what to share</span>
                </div>
              </div>

              <div className={`${styles.floatingCard} ${styles.cardTwo}`}>
                <div className={styles.floatingIcon}>
                  <FiUserCheck aria-hidden="true" />
                </div>

                <div>
                  <strong>Stay aware</strong>
                  <span>Trust grows with time</span>
                </div>
              </div>

              <div className={styles.visualHeart}>
                <FiHeart aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="safety-tips"
        className={styles.tipsSection}
      >
        <div className="container">
          <div className={styles.sectionHeading}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowLine} />
              <span>Simple safety habits</span>
            </div>

            <h2>
              A few thoughtful habits
              <span> can make a difference.</span>
            </h2>

            <p>
              You are always in control of how quickly a connection
              develops and what information you choose to share.
            </p>
          </div>

          <div className={styles.tipsGrid}>
            {safetyTips.map((tip) => {
              const Icon = tip.icon;

              return (
                <article
                  key={tip.number}
                  className={styles.tipCard}
                >
                  <div className={styles.tipTop}>
                    <span className={styles.tipNumber}>
                      {tip.number}
                    </span>

                    <div className={styles.tipIcon}>
                      <Icon aria-hidden="true" />
                    </div>
                  </div>

                  <h3>{tip.title}</h3>

                  <p>{tip.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.warningSection}>
        <div className="container">
          <div className={styles.warningPanel}>
            <div className={styles.warningIntro}>
              <div className={styles.warningIcon}>
                <FiAlertCircle aria-hidden="true" />
              </div>

              <div>
                <span className={styles.smallLabel}>
                  Stay alert
                </span>

                <h2>
                  Know the signs that
                  <span> deserve attention.</span>
                </h2>

                <p>
                  A single unusual interaction does not always mean
                  something is wrong. But repeated pressure,
                  inconsistency, or requests for money are reasons
                  to slow down and reconsider the interaction.
                </p>
              </div>
            </div>

            <div className={styles.warningList}>
              {warningSigns.map((warning) => (
                <div
                  key={warning}
                  className={styles.warningItem}
                >
                  <span>
                    <FiAlertCircle aria-hidden="true" />
                  </span>

                  <p>{warning}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.protectionSection}>
        <div className="container">
          <div className={styles.protectionGrid}>
            <div className={styles.protectionVisual}>
              <div className={styles.protectionCircle}>
                <div className={styles.protectionIcon}>
                  <FiShield aria-hidden="true" />
                </div>
              </div>

              <div className={styles.protectionBadge}>
                <FiCheck aria-hidden="true" />
                <span>In your control</span>
              </div>
            </div>

            <div className={styles.protectionContent}>
              <div className={styles.eyebrow}>
                <span className={styles.eyebrowIcon}>
                  <FiShield aria-hidden="true" />
                </span>
                <span>Protect your experience</span>
              </div>

              <h2>
                Use the tools available
                <span> when you need them.</span>
              </h2>

              <p>
                You should always feel comfortable deciding who can
                interact with you. Use privacy, blocking, and
                reporting controls whenever something does not feel
                right.
              </p>

              <div className={styles.protectionList}>
                {protectionSteps.map((step) => (
                  <div
                    key={step}
                    className={styles.protectionItem}
                  >
                    <span className={styles.checkIcon}>
                      <FiCheck aria-hidden="true" />
                    </span>

                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className={styles.protectionActions}>
                <Link
                  href="/dashboard/settings/privacy"
                  className={styles.outlineButton}
                >
                  <FiLock aria-hidden="true" />
                  <span>Privacy settings</span>
                </Link>

                <Link
                  href="/contact"
                  className={styles.textButton}
                >
                  Get help
                  <FiArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.reportSection}>
        <div className="container">
          <div className={styles.reportPanel}>
            <div className={styles.reportIcon}>
              <FiFlag aria-hidden="true" />
            </div>

            <div className={styles.reportContent}>
              <span>Something doesn't feel right?</span>

              <h2>
                You can always block or report
                <span> an unwanted interaction.</span>
              </h2>

              <p>
                If another member makes you uncomfortable or appears
                suspicious, use the available controls and step away
                from the conversation.
              </p>
            </div>

            <div className={styles.reportActions}>
              <Link
                href="/contact"
                className={styles.reportButton}
              >
                <FiFlag aria-hidden="true" />
                <span>Contact support</span>
              </Link>

              <Link
                href="/search"
                className={styles.reportBack}
              >
                Continue discovering
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.finalSection}>
        <div className="container">
          <div className={styles.finalCard}>
            <div className={styles.finalIcon}>
              <FiHeart aria-hidden="true" />
            </div>

            <h2>
              Take your time.
              <span> Let trust grow naturally.</span>
            </h2>

            <p>
              The right connection does not need to be rushed. Stay
              comfortable, protect your privacy, and move forward at
              your own pace.
            </p>

            <Link
              href="/register"
              className={styles.finalButton}
            >
              Create your profile
              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
