import Link from "next/link";
import {
  FiArrowLeft,
  FiCoffee,
  FiShield,
  FiSettings,
  FiBarChart2,
  FiLock,
  FiBook,
} from "react-icons/fi";

import styles from "./page.module.scss";

export const metadata = {
  title: "Cookies Policy | EverMilan",
  description:
    "Learn how EverMilan uses cookies and similar technologies to improve your browsing experience, protect your account, and maintain website security.",
};

const cookieSections = [
  {
    id: "what-are-cookies",
    icon: FiBook,
    title: "1. What Are Cookies?",
    content: [
      "Cookies are small text files stored on your device when you visit a website. They help websites remember certain information about your visit and provide a smoother browsing experience.",
      "EverMilan may also use similar technologies, such as local storage or session identifiers, where appropriate for website functionality and security.",
    ],
  },
  {
    id: "how-we-use-cookies",
    icon: FiSettings,
    title: "2. How We Use Cookies",
    content: [
      "We may use cookies and similar technologies to keep you signed in, remember your preferences, maintain secure sessions, and help essential features work correctly.",
      "These technologies may also help us understand website performance and improve the experience for people using EverMilan, where such measurement tools are enabled.",
    ],
  },
  {
    id: "essential-cookies",
    icon: FiLock,
    title: "3. Essential Cookies",
    content: [
      "Essential cookies support core website functions, including authentication, account security, session management, and protection against unauthorized access.",
      "Some features may not work properly if these cookies are blocked. Where permitted by applicable law, essential cookies may operate without consent when they are strictly necessary to provide a service you request.",
    ],
  },
  {
    id: "analytics-cookies",
    icon: FiBarChart2,
    title: "4. Analytics and Performance",
    content: [
      "If analytics tools are enabled, we may use cookies or similar technologies to understand general usage patterns, identify technical issues, and improve website performance.",
      "Where required by applicable law, we will request your consent before using non-essential analytics cookies. We do not claim to use a particular analytics provider unless it is actually configured on our website.",
    ],
  },
  {
    id: "third-party-cookies",
    icon: FiShield,
    title: "5. Third-Party Technologies",
    content: [
      "Certain website features or services may rely on third-party providers. Those providers may use their own technologies in accordance with their privacy policies and the settings you choose.",
      "We aim to use third-party services responsibly and to enable non-essential tracking only when appropriate consent has been obtained.",
    ],
  },
  {
    id: "manage-cookies",
    icon: FiSettings,
    title: "6. Managing Your Cookie Preferences",
    content: [
      "You can usually manage or delete cookies through your browser settings. You may be able to block all cookies, allow only certain types, or remove cookies already stored on your device.",
      "Blocking essential cookies may affect sign-in, account security, or other website features. If EverMilan provides a cookie preference control, you can also use it to manage the optional technologies covered by that control.",
    ],
  },
  {
    id: "data-and-privacy",
    icon: FiLock,
    title: "7. Cookies and Your Privacy",
    content: [
      "Cookies may contain identifiers or preference information. We handle information collected through our website in accordance with our applicable privacy practices and legal obligations.",
      "Cookies should not be used to store passwords in plain text or other sensitive account information. For more information about how we handle personal information, please review our Privacy Policy.",
    ],
  },
  {
    id: "policy-updates",
    icon: FiShield,
    title: "8. Changes to This Policy",
    content: [
      "We may update this Cookies Policy when our website features, technologies, or legal requirements change. Updates will be published on this page along with a revised effective date where appropriate.",
      "We encourage you to review this page periodically to stay informed about our cookie practices.",
    ],
  },
];

export default function CookiesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>
          <FiArrowLeft />
          <span>Back to Home</span>
        </Link>

        <header className={styles.hero}>
          <div className={styles.heroIcon}>
            <FiCoffee />
          </div>

          <span className={styles.eyebrow}>
            PRIVACY & TRANSPARENCY
          </span>

          <h1>Cookies Policy</h1>

          <p className={styles.heroDescription}>
            Learn how EverMilan uses cookies and similar technologies
            to provide a secure, reliable, and personalized experience
            while you search for meaningful connections.
          </p>

          <p className={styles.updated}>
            Effective date: October 15, 2026
          </p>
        </header>

        <section className={styles.notice}>
          <FiShield className={styles.noticeIcon} />

          <div>
            <h2>Your privacy matters</h2>
            <p>
              We aim to use cookies responsibly, protect your account,
              and respect your choices regarding non-essential
              technologies in accordance with applicable law.
            </p>
          </div>
        </section>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <h2>On this page</h2>

            <nav aria-label="Cookies policy sections">
              {cookieSections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title.replace(/^\d+\.\s*/, "")}
                </a>
              ))}
            </nav>
          </aside>

          <div className={styles.content}>
            {cookieSections.map((section) => {
              const Icon = section.icon;

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className={styles.policySection}
                >
                  <div className={styles.sectionHeading}>
                    <div className={styles.sectionIcon}>
                      <Icon />
                    </div>

                    <h2>{section.title}</h2>
                  </div>

                  {section.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </section>
              );
            })}

            <section className={styles.contact}>
              <h2>Questions about cookies?</h2>

              <p>
                If you have questions about this policy or how
                EverMilan handles your information, please contact
                our team through the available support channels.
              </p>

              <Link href="/contact" className={styles.contactLink}>
                Contact Us
              </Link>
            </section>

            <div className={styles.footerLinks}>
              <Link href="/privacy">Privacy Policy</Link>
              <span aria-hidden="true">•</span>
              <Link href="/terms">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
