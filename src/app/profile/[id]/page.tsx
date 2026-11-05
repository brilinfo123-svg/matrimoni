
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useFavorites } from "@/components/FavoritesProvider/FavoritesProvider";
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheck,
  FiChevronRight,
  FiFlag,
  FiHeart,
  FiHome,
  FiImage,
  FiLock,
  FiMapPin,
  FiMoreHorizontal,
  FiPhone,
  FiShield,
  FiUser,
  FiUsers,
  FiMessageCircle,
  FiUnlock,
  FiX,
} from "react-icons/fi";

import styles from "./profile.module.scss";
import ProfileSkeleton from "@/components/ProfileSkeleton/ProfileSkeleton";

type Profile = {
  aboutYourself: string;
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  mobile: string;
  isMobileVisible: boolean;
  age: number | null;
  dateOfBirth: string | null;
  gender: string;
  profileFor: string;
  city: string;
  state: string;
  location: string;
  religion: string;
  cast: string;
  motherTongue: string;
  maritalStatus: string;
  education: string;
  college: string;
  profession: string;
  company: string;
  income: string;
  fatherOccupation: string;
  motherOccupation: string;
  diet: string;
  smoking: string;
  drinking: string;
  partnerAgeMin: string;
  partnerAgeMax: string;
  partnerState: string;
  partnerCity: string;
  partnerReligion: string;
  partnerCast: string;
  partnerEducation: string;
  partnerProfession: string;
  partnerMaritalStatus: string;
  photos: string[];
  initials: string;
  verified: boolean;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isProfileComplete: boolean;
};

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === ""
    ? "Not added"
    : String(value);
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className={styles.detailItem}>
      <span>{label}</span>
      <strong>{displayValue(value)}</strong>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionTitle}>
        <span className={styles.sectionIcon}>{icon}</span>
        <h2>{title}</h2>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [contactUnlocked, setContactUnlocked] = useState(false);
  const [contactMobile, setContactMobile] = useState("");
  const [unlockingContact, setUnlockingContact] = useState(false);
  const [contactDialog, setContactDialog] = useState(false);
  const [contactError, setContactError] = useState("");
    const { isFavorite, toggleFavorite } = useFavorites();
  const isShortlisted = id ? isFavorite(id) : false;

  const handleFavoriteToggle = async () => {
    if (!id || favoriteLoading) return;

    try {
      setFavoriteLoading(true);
      await toggleFavorite(id);
    } catch (error) {
      console.error("PROFILE_FAVORITE_ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update favorites. Please try again."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleContactClick = async () => {
    if (!id || unlockingContact) return;

    // Already unlocked: directly open dialog.
    if (contactUnlocked && contactMobile) {
      setContactDialog(true);
      return;
    }

    setContactError("");
    setUnlockingContact(true);

    let successfulUnlock = false;
    let unlockStartedAt = 0;

    try {
      const response = await fetch("/api/contacts/unlock", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: id,
        }),
      });

      const data = await response.json();

      if (response.status === 402) {
        window.location.href = "/contact-plans";
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to unlock this contact."
        );
      }

      const mobile = String(
        data.profile?.mobile || data.mobile || ""
      ).replace(/\D/g, "");

      if (!mobile) {
        throw new Error(
          "Mobile number was not returned by the API."
        );
      }

      successfulUnlock = true;
      unlockStartedAt = Date.now();

      setContactMobile(mobile);
      setContactUnlocked(true);
    } catch (error) {
      console.error("CONTACT_UNLOCK_ERROR:", error);

      setContactError(
        error instanceof Error
          ? error.message
          : "Unable to unlock contact."
      );
    } finally {
      if (successfulUnlock) {
        const elapsed = Date.now() - unlockStartedAt;
        const remaining = Math.max(0, 2000 - elapsed);

        await new Promise((resolve) =>
          setTimeout(resolve, remaining)
        );

        setContactDialog(true);
      }

      setUnlockingContact(false);
    }
  };

useEffect(() => {
  if (!id) return;

  let mounted = true;

  async function checkUnlockedContact() {
    try {
      const response = await fetch("/api/contacts/unlocked", {
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) return;

      const profiles = Array.isArray(data.profiles)
        ? data.profiles
        : [];

      const unlockedProfile = profiles.find(
        (item: any) =>
          String(item.id || item._id || item.profileId) === id
      );

      const mobile = String(
        unlockedProfile?.mobile || ""
      ).replace(/\D/g, "");

      if (mounted && unlockedProfile && mobile) {
        setContactUnlocked(true);
        setContactMobile(mobile);
      }
    } catch (error) {
      console.error("UNLOCKED_CONTACT_CHECK_ERROR:", error);
    }
  }

  void checkUnlockedContact();

  return () => {
    mounted = false;
  };
}, [id]);

  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/users/${id}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Profile not found");
        }

        setProfile(data.user);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (lightboxIndex === null || !profile?.photos?.length) return;
  
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      }
  
      if (event.key === "ArrowRight") {
        setLightboxIndex((current) =>
          current === null
            ? null
            : (current + 1) % profile.photos.length
        );
      }
  
      if (event.key === "ArrowLeft") {
        setLightboxIndex((current) =>
          current === null
            ? null
            : (current - 1 + profile.photos.length) % profile.photos.length
        );
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
  
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, profile]);
  
  const primaryPhoto = useMemo(
    () => profile?.photos?.[0] || null,
    [profile]
  );

  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className="container">
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>
              <FiUser />
            </div>

            <h1>Profile not found</h1>
            <p>{error || "This profile could not be found."}</p>

            <Link href="/search" className={styles.backButton}>
              <FiArrowLeft />
              <span>Back to discover</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const phone = profile.isMobileVisible ? profile.mobile : "";

  const aboutText = [
    profile.profession && `Works as ${profile.profession}`,
    profile.education && `has studied ${profile.education}`,
    profile.city && `and is based in ${profile.city}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className={styles.page}>
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGlowTwo} />

      <div className="container">
        {/* TOP BAR */}
        <div className={styles.topBar}>
          <Link href="/search" className={styles.backButton}>
            <FiArrowLeft aria-hidden="true" />
            <span>Back to discover</span>
          </Link>

          <button
            type="button"
            className={styles.moreButton}
            aria-label="More profile options"
          >
            <FiMoreHorizontal aria-hidden="true" />
          </button>
        </div>

        {/* PROFILE HERO */}
        <section className={styles.profileHero}>
          <div className={styles.photoSection}>
          <div className={styles.profilePhoto}>
            {profile.photos?.length > 0 ? (
              <button
                type="button"
                className={styles.profilePhotoButton}
                onClick={() => setLightboxIndex(0)}
                aria-label="View profile photo in full screen"
              >
                <img
                  src={profile.photos[0]}
                  alt={`${profile.name} profile`}
                  className={styles.profilePhotoImage}
                />
                <span className={styles.photoZoomHint}>
                  <FiImage /> View photo
                </span>
              </button>
            ) : (
              <span>{profile.initials}</span>
            )}

            {profile.isProfileComplete && (
              <div className={styles.onlineBadge}>
                <span />
                Profile complete
              </div>
            )}
          </div>

            <div className={styles.photoCount}>
              <span>{profile.photos.length}</span>
              <span>
                {profile.photos.length === 1
                  ? "profile photo"
                  : "profile photos"}
              </span>
            </div>
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.statusRow}>
              {profile.verified && (
                <span className={styles.verifiedBadge}>
                  <FiCheck />
                  Verified profile
                </span>
              )}
            </div>

            <h1>{profile.name}</h1>

            <p className={styles.subtitle}>
              {profile.age !== null
                ? `${profile.age} years`
                : "Age not added"}

              {profile.profession && (
                <>
                  <span>•</span>
                  {profile.profession}
                </>
              )}
            </p>

            <div className={styles.location}>
              <FiMapPin />
              <span>{profile.location || "Location not added"}</span>
            </div>

            {/* COMPATIBILITY */}
            <div className={styles.compatibilityCard}>
              <div className={styles.matchCircle}>
                <strong>—</strong>
                <span>match</span>
              </div>

              <div>
                <strong>Compatibility</strong>
                <p>
                  Compatibility will be calculated based on your
                  preferences.
                </p>
              </div>

              <FiChevronRight className={styles.compatibilityArrow} />
            </div>

            {/* ACTIONS */}
            
            <div className={styles.actions}>
              {/* FREE CHAT */}
              <Link
                href={`/messages?userId=${profile.id}`}
                className={styles.messageButton}
              >
                <FiMessageCircle />
                <span>Message</span>
              </Link>

              {/* CALL */}
              <button
                type="button"
                className={styles.callButton}
                onClick={handleContactClick}
                disabled={unlockingContact}
              >
                {unlockingContact ? (
                  <span>Unlocking...</span>
                ) : (
                  <>
                    <FiPhone />
                    <span>Call</span>
                  </>
                )}
              </button>

              {/* WHATSAPP */}
              <button
                type="button"
                className={styles.whatsappButton}
                onClick={handleContactClick}
                disabled={unlockingContact}
              >
                <FiMessageCircle />
                <span>WhatsApp</span>
              </button>

              {/* FAVORITE */}
              <button
                type="button"
                className={`${styles.shortlistButton} ${
                  isShortlisted ? styles.active : ""
                }`}
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                aria-label={
                  isShortlisted
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
                aria-pressed={isShortlisted}
              >
                <FiHeart
                  fill={isShortlisted ? "currentColor" : "none"}
                />
              </button>
            </div>

            {contactError && (
              <p className={styles.contactError} role="alert">
                {contactError}
              </p>
            )}

          </div>
        </section>

        {/* CONTENT */}
        <div className={styles.contentLayout}>
          <main className={styles.mainContent}>
            {/* ABOUT */}
            <section className={styles.card}>
              <SectionHeader
                icon={<FiHeart />}
                title={`About ${profile.firstName || "this profile"}`}
              />

              <p className={styles.aboutText}>
                {profile.aboutYourself?.trim() || aboutText || "Not added"}
              </p>
            </section>

            {/* BASIC DETAILS */}
            <section className={styles.card}>
              <SectionHeader icon={<FiUser />} title="Basic details" />

              <div className={styles.detailsGrid}>
                <DetailItem
                  label="Age"
                  value={profile.age !== null ? `${profile.age} years` : ""}
                />
                <DetailItem label="Gender" value={profile.gender} />
                <DetailItem label="Marital status" value={profile.maritalStatus} />
                <DetailItem label="Religion" value={profile.religion} />
                <DetailItem label="Cast / community" value={profile.cast} />
                <DetailItem label="Mother tongue" value={profile.motherTongue} />
                <DetailItem label="Profile created for" value={profile.profileFor} />
                <DetailItem label="City" value={profile.city} />
                <DetailItem label="State" value={profile.state} />
              </div>
            </section>

            {/* EDUCATION & CAREER */}
            <section className={styles.card}>
              <SectionHeader icon={<FiBriefcase />} title="Education & career" />

              <div className={styles.subsection}>
                <h3>Education</h3>
                <div className={styles.detailsGrid}>
                  <DetailItem label="Education" value={profile.education} />
                  <DetailItem label="College" value={profile.college} />
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.subsection}>
                <h3>Career</h3>
                <div className={styles.detailsGrid}>
                  <DetailItem label="Profession" value={profile.profession} />
                  <DetailItem label="Company" value={profile.company} />
                  <DetailItem label="Income" value={profile.income} />
                </div>
              </div>
            </section>

            {/* FAMILY */}
            <section className={styles.card}>
              <SectionHeader icon={<FiUsers />} title="Family" />
              <div className={styles.detailsGrid}>
                <DetailItem
                  label="Father's occupation"
                  value={profile.fatherOccupation}
                />
                <DetailItem
                  label="Mother's occupation"
                  value={profile.motherOccupation}
                />
              </div>
            </section>

            {/* LIFESTYLE */}
            <section className={styles.card}>
              <SectionHeader icon={<FiHome />} title="Lifestyle" />
              <div className={styles.detailsGrid}>
                <DetailItem label="Diet" value={profile.diet} />
                <DetailItem label="Smoking" value={profile.smoking} />
                <DetailItem label="Drinking" value={profile.drinking} />
              </div>
            </section>

            {/* PHOTOS */}
            {profile.photos.length > 0 && (
              <section className={styles.card}>
                <SectionHeader icon={<FiImage />} title="Photos" />
                <div className={styles.profilePhotos}>
                  {profile.photos.map((photo, index) => (
                    <button
                      type="button"
                      key={`${photo}-${index}`}
                      className={styles.galleryPhotoButton}
                      onClick={() => setLightboxIndex(index)}
                      aria-label={`View photo ${index + 1} in full screen`}
                    >
                      <img
                        src={photo}
                        alt={`${profile.name} photo ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* PARTNER PREFERENCES */}
            <section className={styles.card}>
              <SectionHeader
                icon={<FiHeart />}
                title="Partner preferences"
              />

              <p className={styles.preferenceIntro}>
                What {profile.firstName || "this member"} is looking for
                in a partner.
              </p>

              <div className={styles.detailsGrid}>
                <DetailItem
                  label="Age"
                  value={
                    profile.partnerAgeMin && profile.partnerAgeMax
                      ? `${profile.partnerAgeMin} – ${profile.partnerAgeMax} years`
                      : ""
                  }
                />
                <DetailItem label="State" value={profile.partnerState} />
                <DetailItem label="City" value={profile.partnerCity} />
                <DetailItem label="Religion" value={profile.partnerReligion} />
                <DetailItem label="Cast / community" value={profile.partnerCast} />
                <DetailItem label="Education" value={profile.partnerEducation} />
                <DetailItem label="Profession" value={profile.partnerProfession} />
                <DetailItem
                  label="Marital status"
                  value={profile.partnerMaritalStatus}
                />
              </div>
            </section>

            {/* SAFETY */}
            <section className={styles.safetyCard}>
              <div className={styles.safetyIcon}>
                <FiShield />
              </div>
              <div>
                <strong>Stay safe while connecting</strong>
                <p>
                  Keep conversations on the platform until you feel
                  comfortable sharing more personal information.
                </p>
              </div>
            </section>
          </main>

          {/* SIDEBAR */}
          <aside className={styles.sidebar}>
            {/* VERIFICATION */}
            <section className={styles.sideCard}>
              <div className={styles.sideIcon}>
                <FiShield />
              </div>
              <span className={styles.sideEyebrow}>Profile verification</span>
              <h2>Verification status</h2>
              <p>Verification information for this profile.</p>

              <div className={styles.verificationList}>
                <div className={profile.isEmailVerified ? "" : styles.notVerified}>
                  <span><FiCheck /></span>
                  <strong>Email {profile.isEmailVerified ? "verified" : "verified"}</strong>
                </div>

                <div className={profile.isMobileVerified ? "" : styles.notVerified}>
                  <span><FiCheck /></span>
                  <strong>Mobile {profile.isMobileVerified ? "verified" : "verified"}</strong>
                </div>

                <div className={profile.isProfileComplete ? "" : styles.notVerified}>
                  <span><FiShield /></span>
                  <strong>Profile {profile.isProfileComplete ? "complete" : "incomplete"}</strong>
                </div>
              </div>
            </section>

            {/* PRIVACY */}
            <section className={styles.privacyCard}>
              <div className={styles.privacyIcon}>
                <FiLock />
              </div>
              <div>
                <strong>Respect privacy</strong>
                <p>
                  Only share personal information when you are comfortable
                  doing so.
                </p>
              </div>
            </section>

            {/* REPORT / BLOCK */}
            <section className={styles.reportCard}>
              <button type="button">
                <FiFlag />
                <span>Report this profile</span>
              </button>
              <button type="button">
                <FiLock />
                <span>Block this profile</span>
              </button>
            </section>
          </aside>
        </div>

        {/* BOTTOM CTA */}
        <div className={styles.bottomCta}>
          <div>
            <span className={styles.bottomIcon}>
              <FiHeart />
            </span>
            <div>
              <strong>
                Interested in {profile.firstName || "this profile"}?
              </strong>
              <p>Send an interest and start a meaningful connection.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setInterestSent(true)}
            className={styles.bottomButton}
          >
            <FiHeart />
            {interestSent ? "Interest sent" : "Send interest"}
          </button>
        </div>
      </div>
      {lightboxIndex !== null && profile.photos.length > 0 && (
        <div
          className={styles.lightbox}
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Profile photo gallery"
        >
          {/* CLOSE BUTTON */}
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxIndex(null)}
            aria-label="Close gallery"
          >
            &times;
          </button>

          {/* IMAGE COUNTER */}
          <div className={styles.lightboxCounter}>
            {lightboxIndex + 1} / {profile.photos.length}
          </div>

          {/* PREVIOUS BUTTON */}
          {profile.photos.length > 1 && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
              onClick={(event) => {
                event.stopPropagation();
                setLightboxIndex(
                  (lightboxIndex - 1 + profile.photos.length) %
                    profile.photos.length
                );
              }}
              aria-label="Previous photo"
            >
              &#10094;
            </button>
          )}

          {/* FULL SCREEN IMAGE */}
          <div
            className={styles.lightboxImageWrapper}
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={profile.photos[lightboxIndex]}
              alt={`${profile.name} photo ${lightboxIndex + 1}`}
              className={styles.lightboxImage}
            />
          </div>

          {/* NEXT BUTTON */}
          {profile.photos.length > 1 && (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNext}`}
              onClick={(event) => {
                event.stopPropagation();
                setLightboxIndex(
                  (lightboxIndex + 1) % profile.photos.length
                );
              }}
              aria-label="Next photo"
            >
              &#10095;
            </button>
          )}
        </div>
      )}

      {/* CONTACT LOADER */}
      {unlockingContact && (
        <div className={styles.contactOverlay}>
          <div className={styles.contactDialog}>
            <div className={styles.contactLoaderSpinner} />
            <h2>Unlocking contact...</h2>
            <p>Please wait while we securely retrieve the contact details.</p>
          </div>
        </div>
      )}

      {/* CONTACT DIALOG */}
      {contactDialog && contactUnlocked && contactMobile && (
        <div
          className={styles.contactOverlay}
          onClick={() => setContactDialog(false)}
        >
          <section
            className={styles.contactDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.contactDialogClose}
              onClick={() => setContactDialog(false)}
              aria-label="Close dialog"
            >
              <FiX />
            </button>

            <div className={styles.contactSuccessIcon}>
              <FiCheck />
            </div>

            <span className={styles.contactEyebrow}>
              CONTACT UNLOCKED
            </span>

            <h2 id="contact-dialog-title">
              {profile.name}
            </h2>

            <p>
              You can now call or connect with this member on WhatsApp.
            </p>

            <div className={styles.contactMobileNumber}>
              <FiPhone />
              <strong>{contactMobile}</strong>
            </div>

            <div className={styles.contactDialogActions}>
              <a href={`tel:${contactMobile}`}>
                <FiPhone />
                <span>Call Now</span>
              </a>

              <a
                href={`https://wa.me/${contactMobile}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiMessageCircle />
                <span>WhatsApp</span>
              </a>
            </div>

            <button
              type="button"
              className={styles.contactDoneButton}
              onClick={() => setContactDialog(false)}
            >
              Done
            </button>
          </section>
        </div>
      )}

    </div>
  );
}