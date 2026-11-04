
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCheck, FiUnlock, FiTrash2 } from "react-icons/fi";

import ProfileCard, {
  type Profile,
} from "@/components/ProfileCard";

import styles from "./unlocked-profiles.module.scss";

export default function UnlockedProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingProfiles, setRemovingProfiles] = useState<string[]>([]);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadUnlockedProfiles = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/contacts/unlocked", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unlocked profiles load nahi ho paayi."
          );
        }

        const unlockedProfiles: Profile[] = Array.isArray(data.profiles)
          ? data.profiles
          : [];

        if (active) {
          setProfiles(unlockedProfiles);
        }
      } catch (err) {
        console.error("UNLOCKED_PROFILES_ERROR:", err);

        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unlocked profiles load nahi ho paayi."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadUnlockedProfiles();

    return () => {
      active = false;
    };
  }, []);

  const handleUnlockContact = async (
    profile: Profile
  ): Promise<string | null> => {
    try {
      const response = await fetch("/api/contacts/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: profile.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Contact number load nahi ho paaya.");
        return null;
      }

      return data.profile?.mobile
        ? String(data.profile.mobile)
        : null;
    } catch (err) {
      console.error("UNLOCKED_CONTACT_ERROR:", err);
      alert("Contact number load nahi ho paaya.");
      return null;
    }
  };

  const handleRemoveProfile = async () => {
    if (!selectedProfileId || removingProfiles.includes(selectedProfileId)) {
      return;
    }
  
    const profileId = selectedProfileId;
  
    setRemovingProfiles((current) => [...current, profileId]);
  
    try {
      const response = await fetch("/api/contacts/unlocked", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileId }),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to remove profile.");
      }
  
      setProfiles((current) =>
        current.filter((profile) => profile.id !== profileId)
      );
  
      setShowRemoveModal(false);
      setSelectedProfileId(null);
    } catch (err) {
      console.error("REMOVE_UNLOCKED_PROFILE_ERROR:", err);
  
      alert(
        err instanceof Error
          ? err.message
          : "Unable to remove profile."
      );
    } finally {
      setRemovingProfiles((current) =>
        current.filter((id) => id !== profileId)
      );
    }
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.message}>
          Loading unlocked profiles...
        </p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              YOUR CONNECTIONS
            </span>

            <h1>Unlocked Profiles</h1>

            <p>
              Yahan aapki woh profiles hain jinke contact
              details aap unlock kar chuke hain.
            </p>
          </div>

          <Link href="/search" className={styles.browseButton}>
            Browse Profiles
          </Link>
        </div>

        <div className={styles.count}>
          <div className={styles.countIcon}>
            <FiUnlock />
          </div>

          <div className={styles.countNumber}>
            <strong>{profiles.length}</strong>
            <span>Unlocked profiles</span>
          </div>

          <div className={styles.countStatus}>
            <FiCheck />
            Contacts Unlocked
          </div>
        </div>

        {error ? (
          <div className={styles.empty}>
            <h2>Something went wrong</h2>
            <p>{error}</p>

            <button
              type="button"
              className={styles.browseButton}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : profiles.length === 0 ? (
          <div className={styles.empty}>
            <h2>Abhi koi unlocked profile nahi hai</h2>

            <p>
              Search page par profiles explore karein aur
              contact unlock karne ke baad unhe yahan dekhein.
            </p>

            <Link href="/search" className={styles.browseButton}>
              Explore Profiles
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
              {profiles.map((profile) => {
                const isRemoving = removingProfiles.includes(profile.id);

                return (
                  <div key={profile.id} className={styles.unlockedCard}>
                    <div className={styles.unlockedLabel}>
                      <FiCheck />
                      Unlocked
                    </div>

                    <ProfileCard
                      profile={profile}
                      contactUnlocked={true}
                      onUnlockContact={handleUnlockContact}
                    />

                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => {
                        setSelectedProfileId(profile.id);
                        setShowRemoveModal(true);
                      }}
                    >
                      <FiTrash2 />
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
        )}
      </div>
      {showRemoveModal && (
          <div
            className={styles.removeModalOverlay}
            onClick={() => {
              if (removingProfiles.length === 0) {
                setShowRemoveModal(false);
                setSelectedProfileId(null);
              }
            }}
          >
            <div
              className={styles.removeModal}
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="removeModalTitle"
            >
              <div className={styles.removeModalIcon}>
                <FiTrash2 />
              </div>

              <h2 id="removeModalTitle">Remove Profile?</h2>

              <p>
                Are you sure you want to remove this profile from
                your unlocked profiles?
              </p>

              <div className={styles.removeWarning}>
                <FiUnlock />
                <span>
                  Your contact unlock credit will not be refunded.
                  Unlocking this profile again will use another credit.
                </span>
              </div>

              <div className={styles.removeModalActions}>
                <button
                  type="button"
                  className={styles.cancelRemoveButton}
                  onClick={() => {
                    setShowRemoveModal(false);
                    setSelectedProfileId(null);
                  }}
                  disabled={removingProfiles.length > 0}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={styles.confirmRemoveButton}
                  onClick={handleRemoveProfile}
                  disabled={removingProfiles.length > 0}
                >
                  <FiTrash2 />
                  {removingProfiles.length > 0
                    ? "Removing..."
                    : "Yes, Remove"}
                </button>
              </div>
            </div>
          </div>
        )}
    </main>
  );
}
