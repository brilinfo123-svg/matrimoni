"use client";

import { useEffect, useState } from "react";
import { FiBell, FiCheck, FiX } from "react-icons/fi";

import { registerPushNotifications } from "@/lib/pushNotifications";

import styles from "./NotificationPrompt.module.scss";

const NOTIFICATION_LATER_KEY =
  "notification_prompt_maybe_later";

const NOTIFICATION_ENABLED_KEY =
  "notification_prompt_enabled";

export default function NotificationPrompt() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const checkNotificationStatus = async () => {
      try {
        // -----------------------------------------
        // Browser support check
        // -----------------------------------------
        if (
          typeof window === "undefined" ||
          !("Notification" in window) ||
          !("serviceWorker" in navigator) ||
          !("PushManager" in window)
        ) {
          return;
        }

        // -----------------------------------------
        // Permission denied
        // -----------------------------------------
        if (Notification.permission === "denied") {
          console.log(
            "NOTIFICATION_PROMPT: Permission denied"
          );

          setShowModal(false);
          return;
        }

        // -----------------------------------------
        // Check actual Push subscription
        // -----------------------------------------
        const registrations =
          await navigator.serviceWorker.getRegistrations();

        let hasSubscription = false;

        for (const registration of registrations) {
          try {
            const subscription =
              await registration.pushManager.getSubscription();

            if (subscription) {
              hasSubscription = true;
              break;
            }
          } catch (error) {
            console.error(
              "NOTIFICATION_PROMPT: Subscription check failed:",
              error
            );
          }
        }

        // -----------------------------------------
        // Notifications already enabled
        // -----------------------------------------
        if (hasSubscription) {
          console.log(
            "NOTIFICATION_PROMPT: Notifications already enabled"
          );

          localStorage.setItem(
            NOTIFICATION_ENABLED_KEY,
            "true"
          );

          // Remove old Maybe Later state
          localStorage.removeItem(
            NOTIFICATION_LATER_KEY
          );

          setShowModal(false);

          return;
        }

        // -----------------------------------------
        // Check if user clicked Maybe Later
        // -----------------------------------------
        const maybeLater =
          localStorage.getItem(
            NOTIFICATION_LATER_KEY
          );

        if (maybeLater === "true") {
          /*
           * Check sessionStorage.
           *
           * sessionStorage survives page refresh,
           * but is cleared when the browser tab/session
           * is closed.
           */
          const alreadyShownThisSession =
            sessionStorage.getItem(
              "notification_prompt_handled"
            );

          if (alreadyShownThisSession === "true") {
            console.log(
              "NOTIFICATION_PROMPT: Already dismissed in this session"
            );

            setShowModal(false);

            return;
          }
        }

        // -----------------------------------------
        // Show modal
        // -----------------------------------------
        console.log(
          "NOTIFICATION_PROMPT: Notifications are not enabled"
        );

        timer = setTimeout(() => {
          setShowModal(true);
        }, 1200);
      } catch (error) {
        console.error(
          "NOTIFICATION_PROMPT: Failed to check status:",
          error
        );
      }
    };

    checkNotificationStatus();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  // -----------------------------------------
  // Enable Notifications
  // -----------------------------------------
  const handleEnable = async () => {
    try {
      setLoading(true);

      console.log(
        "NOTIFICATION_PROMPT: Enabling notifications..."
      );

      const success =
        await registerPushNotifications();

      if (success) {
        console.log(
          "NOTIFICATION_PROMPT: Notifications enabled successfully"
        );

        // Remember permanently that notifications are enabled
        localStorage.setItem(
          NOTIFICATION_ENABLED_KEY,
          "true"
        );

        // Remove Maybe Later state
        localStorage.removeItem(
          NOTIFICATION_LATER_KEY
        );

        // Remove session state
        sessionStorage.removeItem(
          "notification_prompt_handled"
        );

        setShowModal(false);
      } else {
        console.log(
          "NOTIFICATION_PROMPT: Registration failed"
        );
      }
    } catch (error) {
      console.error(
        "NOTIFICATION_PROMPT: Enable failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Maybe Later
  // -----------------------------------------
  const handleMaybeLater = () => {
    /*
     * Remember that the user dismissed the modal.
     */
    localStorage.setItem(
      NOTIFICATION_LATER_KEY,
      "true"
    );

    /*
     * Mark this browser session as handled.
     *
     * This prevents the modal from appearing again
     * after refresh.
     */
    sessionStorage.setItem(
      "notification_prompt_handled",
      "true"
    );

    setShowModal(false);
  };

  // -----------------------------------------
  // Close
  // -----------------------------------------
  const handleClose = () => {
    /*
     * Treat close button same as Maybe Later.
     */
    localStorage.setItem(
      NOTIFICATION_LATER_KEY,
      "true"
    );

    sessionStorage.setItem(
      "notification_prompt_handled",
      "true"
    );

    setShowModal(false);
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Close */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close notification popup"
          disabled={loading}
        >
          <FiX />
        </button>

        {/* Stylish Notification Bell */}
        <div className={styles.iconWrapper}>
          <div className={styles.iconPulse}></div>

          <div className={styles.iconCircle}>
            <FiBell />
          </div>

          <span
            className={styles.notificationDot}
          />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h2>Stay Connected 💕</h2>

          <p>
            Never miss an important message or
            connection. Turn on notifications to get
            instant updates.
          </p>

          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <span>
                <FiCheck />
              </span>

              <p>
                Get notified when someone messages you
              </p>
            </div>

            <div className={styles.benefit}>
              <span>
                <FiCheck />
              </span>

              <p>
                Receive instant message alerts
              </p>
            </div>

            {/* <div className={styles.benefit}>
              <span>
                <FiCheck />
              </span>

              <p>
                Stay updated even when the website is
                closed
              </p>
            </div> */}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.enableButton}
            onClick={handleEnable}
            disabled={loading}
          >
            <FiBell />

            {loading
              ? "Enabling Notifications..."
              : "Enable Notifications"}
          </button>

          <button
            type="button"
            className={styles.laterButton}
            onClick={handleMaybeLater}
            disabled={loading}
          >
            Maybe Later
          </button>
        </div>

        {/* Privacy */}
        <p className={styles.privacyText}>
          You can change notification preferences
          anytime from Settings.
        </p>
      </div>
    </div>
  );
}
