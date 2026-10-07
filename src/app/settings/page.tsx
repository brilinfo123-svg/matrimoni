"use client";

import EnableNotifications from "@/components/EnableNotifications/EnableNotifications";
import {
  FiBell,
  FiCheckCircle,
  FiMessageCircle,
  FiShield,
} from "react-icons/fi";

import styles from "./settings.module.scss";

export default function SettingsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.headerIcon}>
            <FiBell />
          </div>

          <div>

            <h1>Message Notifications</h1>
          </div>
        </div>

        {/* Main Card */}
        <section className={styles.notificationCard}>
          <div className={styles.cardTop}>
            <div className={styles.iconBox}>
              <FiMessageCircle />
            </div>

            <div className={styles.cardContent}>
              <h2>New Message Alerts</h2>

              <p>
                Receive instant browser notifications whenever
                someone sends you a message.
              </p>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.notificationControl}>

            <div className={styles.enableButton}>
              <EnableNotifications />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className={styles.benefits}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <FiBell />
            </div>

            <div>
              <h3>Instant Alerts</h3>
              <p>
                Know immediately when you receive a new message.
              </p>
            </div>
          </div>

          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <FiCheckCircle />
            </div>

            <div>
              <h3>Stay Connected</h3>
              <p>
                Never miss an important conversation or reply.
              </p>
            </div>
          </div>

          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <FiShield />
            </div>

            <div>
              <h3>Private & Secure</h3>
              <p>
                Notifications are securely delivered to your device.
              </p>
            </div>
          </div>
        </section>

        {/* Info */}
        <div className={styles.infoBox}>
          <FiShield />

          <p>
            You can manage notification permissions anytime from
            your browser settings.
          </p>
        </div>
      </div>
    </main>
  );
}
