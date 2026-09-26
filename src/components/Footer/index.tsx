import Link from "next/link";
import {
  FiFacebook,
  FiHeart,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiTwitter,
} from "react-icons/fi";

import styles from "./index.module.scss";

const footerLinks = {
  platform: [
    {
      label: "Discover",
      href: "/search",
    },
    {
      label: "Matches",
      href: "/matches",
    },
    {
      label: "Success Stories",
      href: "/success-stories",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
  ],

  company: [
    {
      label: "About Us",
      href: "/about",
    },
    {
      label: "Contact Us",
      href: "/contact",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Safety",
      href: "/safety",
    },
  ],

  legal: [
    {
      label: "Privacy Policy",
      href: "/privacy",
    },
    {
      label: "Terms & Conditions",
      href: "/terms",
    },
    {
      label: "Cookie Policy",
      href: "/cookies",
    },
  ],
};

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: FiFacebook,
  },
  {
    label: "Instagram",
    href: "#",
    icon: FiInstagram,
  },
  {
    label: "Twitter",
    href: "#",
    icon: FiTwitter,
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: FiLinkedin,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* Main Footer */}
        <div className={styles.footerMain}>

          {/* Brand */}
          <div className={styles.brandSection}>
            <Link
              href="/"
              className={styles.logo}
              aria-label="Matrimonial home"
            >
              <span className={styles.logoIcon}>
                <FiHeart aria-hidden="true" />
              </span>

              <span className={styles.logoText}>
                <span className={styles.logoName}>
                  Matrimonialdsfsf
                </span>

                <span className={styles.logoTagline}>
                  Find your meaningful connection
                </span>
              </span>
            </Link>

            <p className={styles.description}>
              A modern matrimonial platform designed to help
              people discover meaningful connections based on
              compatibility, values, and shared goals.
            </p>

            {/* Email */}
            <a
              href="mailto:support@matrimonial.com"
              className={styles.emailLink}
            >
              <span className={styles.emailIcon}>
                <FiMail aria-hidden="true" />
              </span>

              <span>support@matrimonial.com</span>
            </a>
          </div>

          {/* Platform */}
          <div className={styles.linkColumn}>
            <h3>Platform</h3>

            <ul>
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className={styles.linkColumn}>
            <h3>Company</h3>

            <ul>
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className={styles.linkColumn}>
            <h3>Legal</h3>

            <ul>
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className={styles.footerBottom}>

          <p className={styles.copyright}>
            © {currentYear} Matrimonial. All rights reserved.
          </p>

          {/* Social Media */}
          <div className={styles.socialLinks}>
            {socialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  className={styles.socialLink}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon aria-hidden="true" />
                </a>
              );
            })}
          </div>

          <p className={styles.madeWith}>
            Made with
            <FiHeart aria-hidden="true" />
            for meaningful connections
          </p>
        </div>
      </div>
    </footer>
  );
}