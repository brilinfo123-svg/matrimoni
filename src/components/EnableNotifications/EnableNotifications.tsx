"use client";

import { useEffect, useState } from "react";
import {
  FiBell,
  FiBellOff,
  FiCheck,
} from "react-icons/fi";

import {
  disablePushNotifications,
  registerPushNotifications,
} from "@/lib/pushNotifications";

import styles from "./index.module.scss";

export default function EnableNotifications() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkNotificationStatus = async () => {
      try {
        // Browser support check
        if (
          !("serviceWorker" in navigator) ||
          !("PushManager" in window) ||
          !("Notification" in window)
        ) {
          if (!cancelled) {
            setEnabled(false);
            setLoading(false);
          }

          return;
        }

        // Browser notification permission check
        if (Notification.permission !== "granted") {
          if (!cancelled) {
            setEnabled(false);
            setLoading(false);
          }

          return;
        }

        /*
         * Get service worker registrations.
         *
         * We use getRegistrations() instead of getRegistration("/")
         * because it is safer when the application is running with
         * a custom Next.js server.
         */
        const registrationPromise =
          navigator.serviceWorker.getRegistrations();

        /*
         * Safety timeout.
         *
         * Even if the service worker API gets stuck,
         * the UI will not stay on "Checking Notifications..."
         * forever.
         */
        const timeoutPromise = new Promise<
          ServiceWorkerRegistration[]
        >((resolve) => {
          setTimeout(() => {
            resolve([]);
          }, 3000);
        });

        const registrations = await Promise.race([
          registrationPromise,
          timeoutPromise,
        ]);

        if (cancelled) {
          return;
        }

        if (!registrations.length) {
          setEnabled(false);
          setLoading(false);
          return;
        }

        /*
         * Find the registration that controls push.
         *
         * If you only have one service worker, this will simply
         * use that registration.
         */
        let subscription = null;

        for (const registration of registrations) {
          try {
            const currentSubscription =
              await registration.pushManager.getSubscription();

            if (currentSubscription) {
              subscription = currentSubscription;
              break;
            }
          } catch (error) {
            console.warn(
              "PUSH_SUBSCRIPTION_CHECK_ERROR:",
              error,
            );
          }
        }

        if (!cancelled) {
          setEnabled(Boolean(subscription));
        }
      } catch (error) {
        console.error(
          "NOTIFICATION_STATUS_CHECK_ERROR:",
          error,
        );

        if (!cancelled) {
          setEnabled(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    checkNotificationStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const success = await registerPushNotifications();

      setEnabled(success);
    } catch (error) {
      console.error(
        "ENABLE_NOTIFICATION_ERROR:",
        error,
      );

      setEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const success =
        await disablePushNotifications();

      if (success) {
        setEnabled(false);
      }
    } catch (error) {
      console.error(
        "DISABLE_NOTIFICATION_ERROR:",
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial status check
   */
  if (loading) {
    return (
      <button
        type="button"
        className={styles.button}
        disabled
      >
        <FiBell size={17} />
        Checking Notifications...
      </button>
    );
  }

  /*
   * Notifications enabled
   */
  if (enabled) {
    return (
      <div className={styles.notificationActions}>
        <button
          type="button"
          className={styles.enabledButton}
          disabled
        >
          <FiCheck size={17} />
          Notifications Enabled
        </button>

        <button
          type="button"
          className={styles.disableButton}
          onClick={handleDisable}
          disabled={loading}
        >
          <FiBellOff size={17} />
          Disable Notifications
        </button>
      </div>
    );
  }

  /*
   * Notifications disabled
   */
  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleEnable}
      disabled={loading}
    >
      <FiBell size={17} />
      Enable Message Notifications
    </button>
  );
}
