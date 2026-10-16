"use client";

import Link from "next/link";
import {
  FiArrowLeft,
  FiShield,
  FiLock,
  FiEye,
  FiUserCheck,
  FiDatabase,
  FiMail,
  FiTrash2,
} from "react-icons/fi";

import styles from "./page.module.scss";

const sections = [
  {
    id: "information",
    title: "1. Information We Collect",
    icon: FiDatabase,
    content:
      "We collect information you provide when creating your account, including your name, email address, mobile number, date of birth, location, education, profession, family details, partner preferences, and profile photographs.",
  },
  {
    id: "usage",
    title: "2. How We Use Your Information",
    icon: FiUserCheck,
    content:
      "We use your information to create and manage your profile, recommend compatible matches, enable messaging, provide notifications, improve our services, prevent fraudulent activity, and maintain the security of our platform.",
  },
  {
    id: "visibility",
    title: "3. Profile Visibility",
    icon: FiEye,
    content:
      "Certain profile details may be visible to other registered members to help them discover compatible matches. Please review the information you share carefully. Contact details and other sensitive information should only be shared when you feel comfortable.",
  },
  {
    id: "security",
    title: "4. Data Security",
    icon: FiLock,
    content:
      "We use reasonable technical and organizational measures to protect your personal information against unauthorized access, loss, misuse, and disclosure. However, no online platform can guarantee absolute security.",
  },
  {
    id: "sharing",
    title: "5. Information Sharing",
    icon: FiShield,
    content:
      "We do not sell your personal information. We may share necessary information with trusted service providers who help us operate our platform, or when required by law, to protect our rights, or to address security concerns.",
  },
  {
    id: "cookies",
    title: "6. Cookies and Notifications",
    icon: FiDatabase,
    content:
      "We may use cookies and similar technologies to maintain your login session, improve functionality, and remember preferences. If you enable browser notifications, we may send alerts about new messages and other relevant account activity. You can manage notification permissions through your browser settings.",
  },
  {
    id: "retention",
    title: "7. Data Retention and Account Deletion",
    icon: FiTrash2,
    content:
      "We retain your information for as long as necessary to provide our services, meet legal obligations, and resolve disputes. You may request account deletion or removal of personal information, subject to applicable legal requirements and legitimate retention needs.",
  },
  {
    id: "rights",
    title: "8. Your Privacy Rights",
    icon: FiUserCheck,
    content:
      "Depending on your location and applicable law, you may have the right to access, correct, delete, or request a copy of your personal information, withdraw consent, and raise concerns about how your data is handled.",
  },
  {
    id: "children",
    title: "9. Children's Privacy",
    icon: FiShield,
    content:
      "EverMilan is intended for adults who meet the applicable legal age requirements for using matrimonial services. We do not knowingly collect personal information from children.",
  },
  {
    id: "changes",
    title: "10. Changes to This Policy",
    icon: FiLock,
    content:
      "We may update this Privacy Policy from time to time to reflect changes in our services, practices, or legal requirements. Updates will be published on this page with a revised effective date.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          {/* <Link href="/" className={styles.backLink}>
            <FiArrowLeft />
            Back to Home
          </Link> */}

          <div className={styles.heroIcon}>
            <FiShield />
          </div>

          <span className={styles.eyebrow}>YOUR PRIVACY MATTERS</span>

          {/* <h1>Privacy Policy</h1> */}
{/* 
          <p>
            Your trust is important to us. Learn how EverMilan
            collects, uses, protects, and manages your personal
            information while helping you find a meaningful
            connection.
          </p> */}

          <span className={styles.updated}>
            Effective Date: October 15, 2026
          </span>
        </div>
      </section>

      <section className={styles.content}>
        <aside className={styles.sidebar}>
          <h2>On this page</h2>
          <nav aria-label="Privacy policy sections">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
            <a href="#contact">11. Contact Us</a>
          </nav>
        </aside>

        <article className={styles.policy}>
          <div className={styles.intro}>
            <h2>Your privacy, our responsibility</h2>
            <p>
              This Privacy Policy explains how EverMilan handles
              personal information when you visit our website,
              register an account, create a matrimonial profile,
              communicate with members, or use our services.
              By using our platform, you acknowledge this policy.
              Where consent is legally required, we will seek it
              separately.
            </p>
          </div>

          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <section
                key={section.id}
                id={section.id}
                className={styles.policySection}
              >
                <div className={styles.sectionHeading}>
                  <span className={styles.sectionIcon}>
                    <Icon />
                  </span>
                  <h2>{section.title}</h2>
                </div>
                <p>{section.content}</p>
              </section>
            );
          })}

          <section id="contact" className={styles.contactCard}>
            <div className={styles.contactIcon}>
              <FiMail />
            </div>
            <h2>11. Contact Us</h2>
            <p>
              If you have questions, requests, or concerns about
              this Privacy Policy or the handling of your personal
              information, please contact our support team through
              the official contact details provided on our website.
            </p>
            <Link href="/contact" className={styles.contactLink}>
              Contact Support
            </Link>
          </section>

          <div className={styles.footerNote}>
            <FiShield />
            <p>
              Thank you for trusting EverMilan. We are committed
              to treating your personal information with care and
              respect.
            </p>
          </div>
        </article>
      </section>
    </main>
  );
}