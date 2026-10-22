
"use client";

import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import EnableNotifications from "@/components/EnableNotifications/EnableNotifications";
import {
  FiBell,
  FiCheckCircle,
  FiEyeOff,
  FiMessageCircle,
  FiShield,
  FiTrash2,
  FiUserX,
} from "react-icons/fi";

import styles from "./settings.module.scss";

type ProfileSettings = {
  isMobileVisible?: boolean;
  isActive?: boolean;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  profile?: ProfileSettings;
};

export default function SettingsPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [accountActionLoading, setAccountActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("/api/profileSetting", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success || !data.profile) {
        throw new Error(data.message || "Unable to load your settings.");
      }

      setProfile(data.profile);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);


  const toggleMobileVisibility = async () => {
    if (!profile || savingPrivacy || accountActionLoading) return;
  
    const currentValue = profile.isMobileVisible ?? true;
    const nextValue = !currentValue;
  
    setSavingPrivacy(true);
    setErrorMessage("");
    setSuccessMessage("");
  
    try {
      const response = await fetch("/api/profileSetting", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isMobileVisible: nextValue,
        }),
      });
  
      const data: ApiResponse = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not update mobile privacy.");
      }
  
      // Use the server's saved value when it returns the updated profile.
      setProfile((current) => ({
        ...current!,
        ...(data.profile ?? {}),
        isMobileVisible: data.profile?.isMobileVisible ?? nextValue,
      }));
  
      await Swal.fire({
        icon: "success",
        title: nextValue ? "Mobile Number Visible" : "Mobile Number Hidden",
        text: nextValue
          ? "Your mobile number visibility setting has been enabled."
          : "Your mobile number has been hidden.",
        confirmButtonText: "OK",
        confirmButtonColor: "#a83268",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not update mobile privacy."
      );
  
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error instanceof Error
            ? error.message
            : "Could not update your mobile privacy setting.",
        confirmButtonColor: "#a83268",
      });
    } finally {
      setSavingPrivacy(false);
    }
  };
  


  const deactivateAccount = async () => {
    if (accountActionLoading || savingPrivacy) return;

    const result = await Swal.fire({
      title: "Deactivate Account?",
      text: "Your profile will be hidden from other members, but you can continue using your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, deactivate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#a83268",
      cancelButtonColor: "#777178",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    setAccountActionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/profileSetting/account", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deactivate" }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not deactivate your account.");
      }

      // Keep the user logged in and update the local account status.
      setProfile((current) =>
        current ? { ...current, isActive: false } : current
      );

      setSuccessMessage(
        "Your account is deactivated. Your public profile should now be hidden."
      );

      await Swal.fire({
        icon: "success",
        title: "Account Deactivated",
        text: "Your profile is hidden from other members. You can continue using your account.",
        confirmButtonColor: "#a83268",
      });
      router.replace("/account-deactivated");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not deactivate your account.";

      setErrorMessage(message);

      await Swal.fire({
        icon: "error",
        title: "Deactivation Failed",
        text: message,
        confirmButtonColor: "#a83268",
      });
    } finally {
      setAccountActionLoading(false);
    }
  };
  

const activateAccount = async () => {
  if (accountActionLoading || savingPrivacy) return;

  const result = await Swal.fire({
    title: "Activate Account?",
    text: "Your account will be active again, and your profile can be visible to other members.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, activate",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#a83268",
    cancelButtonColor: "#777178",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  setAccountActionLoading(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
    const response = await fetch("/api/profileSetting/account", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "activate" }),
    });

    const data: ApiResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Could not activate your account.");
    }

    setProfile((current) =>
      current ? { ...current, isActive: true } : current
    );

    setSuccessMessage("Your account is active again.");

    await Swal.fire({
      icon: "success",
      title: "Account Activated",
      text: "Your account is active again. Your profile can appear to other members.",
      confirmButtonColor: "#a83268",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not activate your account.";

    setErrorMessage(message);

    await Swal.fire({
      icon: "error",
      title: "Activation Failed",
      text: message,
      confirmButtonColor: "#a83268",
    });
  } finally {
    setAccountActionLoading(false);
  }
};

 

  const deleteAccount = async () => {
    if (accountActionLoading || savingPrivacy) return;
  
    const result = await Swal.fire({
      title: "Permanently Delete Account?",
      text: "Your account and associated profile photos will be permanently deleted. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Continue",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#b42336",
      cancelButtonColor: "#777178",
      reverseButtons: true,
    });
  
    if (!result.isConfirmed) return;
  
    const finalConfirmation = await Swal.fire({
      title: "Are you absolutely sure?",
      text: "Please confirm that you want to permanently delete your EverMilan account.",
      icon: "error",
      input: "checkbox",
      inputPlaceholder: "I understand this action is permanent",
      inputValidator: (value) =>
        value ? undefined : "Please confirm before continuing.",
      showCancelButton: true,
      confirmButtonText: "Delete Permanently",
      cancelButtonText: "Keep My Account",
      confirmButtonColor: "#b42336",
      cancelButtonColor: "#777178",
      reverseButtons: true,
    });
  
    if (!finalConfirmation.isConfirmed) return;
  
    setAccountActionLoading(true);
    setErrorMessage("");
  
    try {
      const response = await fetch("/api/profileSetting/account", {
        method: "DELETE",
        credentials: "include",
      });
  
      const data: ApiResponse = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not delete your account.");
      }
  
      await Swal.fire({
        icon: "success",
        title: "Account Deleted",
        text: "Your account deletion request has completed.",
        confirmButtonColor: "#a83268",
      });
  
      router.replace("/login?account=deleted");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not delete your account.";
  
      setErrorMessage(message);
  
      await Swal.fire({
        icon: "error",
        title: "Deletion Failed",
        text: message,
        confirmButtonColor: "#a83268",
      });
  
      setAccountActionLoading(false);
    }
  };
  


  const mobileIsVisible = profile?.isMobileVisible ?? true;

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.headerIcon}>
            <FiBell />
          </div>

          <div>
            <span className={styles.eyebrow}>Account preferences</span>
            <h1>Settings & Privacy</h1>
            <p>
              Manage your message notifications, mobile number privacy, and
              account status.
            </p>
          </div>
        </header>

        {errorMessage && (
          <div className={styles.errorBox} role="alert">
            <FiShield />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className={styles.successBox} role="status">
            <FiCheckCircle />
            <p>{successMessage}</p>
          </div>
        )}

        {loading ? (
          <section className={styles.loadingCard} aria-live="polite">
            <span className={styles.spinner} />
            <p>Loading your settings…</p>
          </section>
        ) : (
          <>
            {/* Message notifications */}
            <section className={styles.notificationCard}>
              <div className={styles.cardTop}>
                <div className={styles.iconBox}>
                  <FiMessageCircle />
                </div>

                <div className={styles.cardContent}>
                  <h2>Message Notifications</h2>
                  <p>
                    Receive browser notifications when someone sends you a
                    message.
                  </p>
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.notificationControl}>
                <div>
                  <span className={styles.controlTitle}>
                    New message alerts
                  </span>
                  <span className={styles.controlDescription}>
                    Enable notifications on this device so you can stay
                    connected.
                  </span>
                </div>

                <div className={styles.enableButton}>
                  <EnableNotifications />
                </div>
              </div>
            </section>

            {/* Mobile number privacy */}
            <section className={styles.settingCard}>
              <div className={styles.settingIcon}>
                <FiEyeOff />
              </div>

              <div className={styles.settingContent}>
                <h2>Mobile Number Privacy</h2>
                <p>
                  Hide your mobile number from other members where your
                  profile displays contact information. This setting does not
                  replace privacy checks in your profile API.
                </p>

                <span
                  className={
                    mobileIsVisible
                      ? styles.statusVisible
                      : styles.statusHidden
                  }
                >
                  {mobileIsVisible
                    ? "Mobile number visibility is ON"
                    : "Mobile number is hidden"}
                </span>
              </div>

              <label className={styles.switch} aria-label="Hide my mobile number">
                <input
                  type="checkbox"
                  role="switch"
                  checked={!mobileIsVisible}
                  disabled={savingPrivacy || accountActionLoading}
                  onChange={() => void toggleMobileVisibility()}
                />
                <span className={styles.switchTrack} />
              </label>
            </section>

            {/* Account management */}
            <section className={styles.accountSection}>
              <div className={styles.accountSectionHeader}>
                <div>
                  <span className={styles.eyebrow}>Account management</span>
                  <h2>Manage Your Account</h2>
                  <p>
                    Temporarily hide your profile or permanently delete your
                    account.
                  </p>
                </div>
              </div>

              
              <div className={styles.accountAction}>
                <div className={styles.settingIcon}>
                  <FiUserX />
                </div>

                <div className={styles.settingContent}>
                  <h3>
                    {profile?.isActive === false
                      ? "Activate Account"
                      : "Deactivate Account"}
                  </h3>

                  <p>
                    {profile?.isActive === false
                      ? "Your account is currently deactivated. Activate it to make your profile available to other members again."
                      : "Temporarily hide your profile from other members. You can activate your account again whenever you want."}
                  </p>

                  <span
                    className={
                      profile?.isActive === false
                        ? styles.statusHidden
                        : styles.statusVisible
                    }
                  >
                    {profile?.isActive === false
                      ? "Account is deactivated"
                      : "Account is active"}
                  </span>
                </div>

                {profile?.isActive === false ? (
                  <button
                    type="button"
                    className={styles.activateButton}
                    onClick={() => void activateAccount()}
                    disabled={accountActionLoading || savingPrivacy}
                  >
                    {accountActionLoading ? "Please wait…" : "Activate Account"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.deactivateButton}
                    onClick={() => void deactivateAccount()}
                    disabled={accountActionLoading || savingPrivacy}
                  >
                    {accountActionLoading ? "Please wait…" : "Deactivate Account"}
                  </button>
                )}
              </div>


              <div className={styles.accountDivider} />

              <div className={styles.accountAction}>
                <div className={`${styles.settingIcon} ${styles.dangerIcon}`}>
                  <FiTrash2 />
                </div>

                <div className={styles.settingContent}>
                  <h3>Delete Account</h3>
                  <p>
                    Permanently delete your account and associated profile
                    photos. This action cannot be undone.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => void deleteAccount()}
                  disabled={accountActionLoading || savingPrivacy}
                >
                  <FiTrash2 />
                  {accountActionLoading ? "Please wait…" : "Delete Account"}
                </button>
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
                  <p>Know when you receive a new message.</p>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <FiCheckCircle />
                </div>
                <div>
                  <h3>Stay Connected</h3>
                  <p>Keep up with important conversations and replies.</p>
                </div>
              </div>

              <div className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <FiShield />
                </div>
                <div>
                  <h3>Privacy Matters</h3>
                  <p>Control your mobile visibility and account status.</p>
                </div>
              </div>
            </section>

            <div className={styles.infoBox}>
              <FiShield />
              <p>
                Browser notification permissions can be managed in your
                browser settings. Account privacy and deletion also require
                the corresponding server-side protections.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}