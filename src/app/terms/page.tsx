import Link from "next/link";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiHeart,
  FiLock,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import styles from "./page.module.scss";

export const metadata = {
  title: "Terms & Conditions | EverMilan",
  description:
    "Read EverMilan's Terms and Conditions to understand the rules, responsibilities, and guidelines for using our matrimonial platform.",
};

const sections = [
  {
    id: "eligibility",
    title: "1. Eligibility",
    icon: FiCheckCircle,
    content: [
      "You must be at least 18 years old to create an account or use EverMilan's matrimonial services.",
      "You confirm that you have the legal capacity to enter into these Terms and that the information you provide is accurate and truthful.",
      "You must not use the platform if doing so would violate any applicable law or legal restriction.",
    ],
  },
  {
    id: "account",
    title: "2. Account Registration & Security",
    icon: FiUsers,
    content: [
      "You are responsible for maintaining the confidentiality of your login credentials and for activities carried out through your account.",
      "Provide accurate, current, and complete information when creating and updating your profile.",
      "Do not create an account using another person's identity or provide misleading information about your age, marital status, education, profession, or intentions.",
      "Notify us promptly if you suspect unauthorized access to your account.",
    ],
  },
  {
    id: "conduct",
    title: "3. User Conduct",
    icon: FiHeart,
    content: [
      "Use EverMilan respectfully and only for genuine matrimonial and relationship purposes.",
      "Do not harass, threaten, impersonate, intimidate, discriminate against, or exploit other members.",
      "Do not use the platform to send spam, distribute malicious content, promote scams, or solicit money from other users.",
      "Do not upload content that is unlawful, abusive, deceptive, defamatory, or infringes another person's rights.",
      "Do not scrape profiles, collect member information without authorization, or use another member's information for commercial purposes.",
    ],
  },
  {
    id: "profiles",
    title: "4. Profiles, Photos & Content",
    icon: FiShield,
    content: [
      "You must have the necessary rights or permission to upload photographs and other information to your profile.",
      "You are responsible for the accuracy and appropriateness of the content you submit.",
      "By submitting content, you grant EverMilan permission to host, store, display, and process that content as needed to operate and provide the service, subject to our Privacy Policy and applicable law.",
      "You retain ownership of your content. We do not claim ownership of your personal photographs or profile information.",
      "We may restrict or remove content that violates these Terms, applicable law, or the safety of our community.",
    ],
  },
  {
    id: "privacy",
    title: "5. Privacy & Personal Information",
    icon: FiLock,
    content: [
      "Your personal information is handled in accordance with our Privacy Policy.",
      "You control the information you choose to share on your profile, subject to the platform's available privacy settings.",
      "Do not share passwords, verification codes, financial information, or other sensitive personal details with people you have not established trust with.",
      "While we take reasonable measures to protect our platform, no online service can guarantee absolute security.",
    ],
  },
  {
    id: "safety",
    title: "6. Safety & Member Interactions",
    icon: FiShield,
    content: [
      "EverMilan provides a platform for people to discover matrimonial connections. We cannot guarantee the identity, intentions, background, conduct, or compatibility of every member.",
      "Use caution when communicating with other members and verify important information independently.",
      "Never send money or disclose financial credentials to someone you have met through the platform without independently verifying their circumstances.",
      "Report suspicious profiles, harassment, impersonation, or potentially fraudulent activity through the available reporting or contact channels.",
      "You are responsible for your decisions when communicating with or meeting other members, subject to any rights or protections available under applicable law.",
    ],
  },
  {
    id: "communication",
    title: "7. Messages & Notifications",
    icon: FiHeart,
    content: [
      "You may use messaging and notification features to communicate with other members.",
      "Do not use messaging to harass, threaten, spam, or distribute unlawful material.",
      "Notifications may depend on your device settings, browser permissions, network connection, and service availability.",
      "We cannot guarantee that every message or notification will be delivered immediately or without interruption.",
    ],
  },
  {
    id: "termination",
    title: "8. Account Suspension & Termination",
    icon: FiUsers,
    content: [
      "You may stop using EverMilan and request account deletion through the available account settings or by contacting us.",
      "We may restrict, suspend, or terminate access when reasonably necessary to address violations of these Terms, suspected fraud, security risks, legal requirements, or harm to members.",
      "Where appropriate and legally permitted, we may provide notice or an opportunity to resolve an issue before restricting an account.",
      "Any provisions that by their nature should continue after termination will remain effective to the extent permitted by law.",
    ],
  },
  {
    id: "availability",
    title: "9. Service Availability & Disclaimers",
    icon: FiCheckCircle,
    content: [
      "We aim to keep EverMilan available and functioning reliably, but uninterrupted or error-free service cannot be guaranteed.",
      "We may update, modify, suspend, or discontinue features when reasonably necessary for maintenance, security, or business operations.",
      "EverMilan does not guarantee that you will find a match, receive messages, or establish a relationship through the platform.",
      "To the extent permitted by applicable law, the service is provided on an as-available basis, without warranties that cannot legally be excluded.",
    ],
  },
  {
    id: "liability",
    title: "10. Limitation of Liability",
    icon: FiShield,
    content: [
      "To the extent permitted by applicable law, EverMilan is not responsible for indirect or consequential losses arising from use of the platform, interactions between members, or a member's conduct.",
      "Nothing in these Terms excludes or limits liability where such exclusion or limitation is prohibited by law, including any applicable consumer rights.",
      "These Terms do not remove any rights or remedies you may have under applicable law.",
    ],
  },
  {
    id: "changes",
    title: "11. Changes to These Terms",
    icon: FiCheckCircle,
    content: [
      "We may revise these Terms as our services, practices, or legal obligations change.",
      "Updated Terms will be published on this page with a revised effective date.",
      "Where required by applicable law, we will provide additional notice or obtain consent for material changes.",
      "Your continued use of EverMilan after updated Terms take effect is subject to applicable law and any consent requirements.",
    ],
  },
  {
    id: "contact",
    title: "12. Contact Us",
    icon: FiLock,
    content: [
      "If you have questions about these Terms or need help with your account, contact our support team.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />

        <div className={styles.heroInner}>
          <Link href="/" className={styles.backLink}>
            <FiArrowLeft />
            <span>Back to Home</span>
          </Link>

          <h1>
            Terms &amp; <span>Conditions</span>
          </h1>

          <div className={styles.heroMeta}>
            <span>
              <FiCheckCircle />
              Please read carefully
            </span>
            <span className={styles.metaDivider} />
            <span>Effective date: October 15, 2026</span>
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <aside className={styles.notice}>
          <div className={styles.noticeIcon}>
            <FiHeart />
          </div>
          <div>
            <h2>Welcome to EverMilan</h2>
            <p>
              These Terms explain the basic rules for using our
              matrimonial platform. By creating an account or using
              our services, you agree to these Terms, subject to
              applicable law.
            </p>
          </div>
        </aside>

        <div className={styles.layout}>
          <aside className={styles.toc}>
            <h2>On this page</h2>
            <nav aria-label="Terms and Conditions sections">
              {sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className={styles.termsContent}>
            <section className={styles.intro}>
              <h2>Please read these terms</h2>
              <p>
                These Terms and Conditions govern your access to and
                use of EverMilan. Please read them carefully. If you
                do not agree with these Terms, do not use the service.
              </p>
            </section>

            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <section
                  key={section.id}
                  id={section.id}
                  className={styles.termSection}
                >
                  <div className={styles.sectionHeading}>
                    <span className={styles.sectionIcon}>
                      <Icon />
                    </span>
                    <h2>{section.title}</h2>
                  </div>

                  {section.id === "contact" ? (
                    <>
                      {section.content.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}

                      <div className={styles.contactCard}>
                        <span className={styles.contactLabel}>
                          EMAIL SUPPORT
                        </span>
                        <a href="mailto:support@evermilan.com">
                          support@evermilan.com
                        </a>
                        <Link href="/contact">
                          Visit Contact Us
                        </Link>
                      </div>
                    </>
                  ) : (
                    <ul>
                      {section.content.map((paragraph) => (
                        <li key={paragraph}>{paragraph}</li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}

            <div className={styles.footerNote}>
              <FiHeart />
              <p>
                Thank you for being part of EverMilan. Let&apos;s
                build meaningful connections with honesty, respect,
                and care.
              </p>
            </div>

            <div className={styles.relatedLinks}>
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/safety-tips">Safety Centre</Link>
              <Link href="/contact">Contact Us</Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}