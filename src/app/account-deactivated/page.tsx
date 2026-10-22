"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { FiUserCheck, FiShield, FiLock } from "react-icons/fi";
import styles from "./page.module.scss";

export default function AccountDeactivatedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const activateAccount = async () => {
    if (loading) return;

    const confirmation = await Swal.fire({
      title: "Activate your account?",
      text: "Your EverMilan account will become active again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, activate",
      cancelButtonText: "Not now",
      confirmButtonColor: "#a83268",
    });

    if (!confirmation.isConfirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/profileSetting/account", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "activate" }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to activate your account.");
      }

      await Swal.fire({
        icon: "success",
        title: "Welcome Back!",
        text: "Your account is active again.",
        confirmButtonColor: "#a83268",
      });

      router.replace("/settings");
      router.refresh();
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Activation Failed",
        text:
          error instanceof Error
            ? error.message
            : "Please try again later.",
        confirmButtonColor: "#a83268",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.glow} />

      <section className={styles.card}>
        <div className={styles.logo}>
          <FiUserCheck />
        </div>

        <span className={styles.eyebrow}>EVERMILAN · ACCOUNT STATUS</span>

        <h1>Your account is Deactivated </h1>

        <p className={styles.description}>
          Your account is currently deactivated, and your profile is hidden
          from other members. Activate your account whenever you're ready
          to reconnect.
        </p>

        <div className={styles.notice}>
          <FiShield />
          <span>Your profile is hidden while your account is inactive.</span>
        </div>

        <button
          type="button"
          className={styles.activateButton}
          onClick={() => void activateAccount()}
          disabled={loading}
        >
          <FiUserCheck />
          {loading ? "Activating account..." : "Activate My Account"}
        </button>

        <div className={styles.footer}>
          <FiLock />
          <span>Your account security and privacy matter to us.</span>
        </div>
      </section>
    </main>
  );
}