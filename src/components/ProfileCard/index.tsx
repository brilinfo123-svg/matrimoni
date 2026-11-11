"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useFavorites } from "@/components/FavoritesProvider/FavoritesProvider";
import {
  FiCheck,
  FiCopy,
  FiHeart,
  FiMapPin,
  FiPhone,
  FiStar,
  FiX,
} from "react-icons/fi";
import styles from "@/app/search/search.module.scss";

export type Profile = {
  id: string;
  name: string;
  age: number | null;
  location: string;
  city: string;
  state: string;
  profession: string;
  education: string;
  maritalStatus: string;
  religion?: string;
  cast?: string;
  motherTongue?: string;
  company?: string;
  college?: string;
  profileFor?: string;
  gender?: string;
  isMobileVisible?: boolean;
  photo: string | null;
  initials: string;
  verified: boolean;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  profileComplete: boolean;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

type ProfileCardProps = {
  profile: Profile;
  shortlisted?: boolean;
  onShortlist?: () => void;
  contactUnlocked: boolean;
  onUnlockContact: (profile: Profile) => Promise<string | null>;
};

export default function ProfileCard({
  profile,
  contactUnlocked,
  onUnlockContact,
}: ProfileCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [numberCopied, setNumberCopied] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [imageError, setImageError] = useState(false);
  const favorite = isFavorite(profile.id);
  const normalizedGender = profile.gender?.trim().toLowerCase();

const fallbackImage =
  normalizedGender === "female"
    ? "public/images/profiles/female-placeholder.webp"
    : "public/images/profiles/male-placeholder.webp";

  const profileImageSrc = profile.photo && !imageError ? profile.photo : fallbackImage;
  const canShowMobile = profile.isMobileVisible === true;

  const cleanMobile = contactNumber.replace(/\D/g, "");

  const handleContactClick = async () => {
    if (!canShowMobile || unlocking) return;

    setUnlocking(true);

    try {
      const mobile = await onUnlockContact(profile);

      if (!mobile) return;

      setContactNumber(mobile);
      setShowContactDialog(true);
    } catch (error) {
      console.error("CONTACT_UNLOCK_ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Unable to unlock contact. Please try again."
      );
    } finally {
      setUnlocking(false);
    }
  };

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(cleanMobile);
      setNumberCopied(true);
      window.setTimeout(() => setNumberCopied(false), 2000);
    } catch (error) {
      console.error("COPY_NUMBER_ERROR:", error);
      alert("Unable to copy number. Please copy it manually.");
    }
  };

  const handleFavoriteClick = async () => {
    try {
      await toggleFavorite(profile.id);
    } catch (error) {
      console.error("FAVORITE_ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Could not update favorite. Please try again."
      );
    }
  };

  return (
    <>
      <article className={styles.profileCard}>
        <Link
          href={`/profile/${profile.id}`}
          className={styles.profileImageLink}
          aria-label={`View ${profile.name}'s profile`}
        >
          <div className={styles.profileImage}>
          <img
  src={profileImageSrc}
  alt={`${profile.name} profile`}
  loading="lazy"
  className={
    profile.photo && !imageError
      ? styles.profilePhoto
      : styles.placeholderPhoto
  }
  onError={() => setImageError(true)}
/>

            <div className={styles.compatibility}>
              <FiStar aria-hidden="true" />
              <span>Profile</span>
            </div>
          </div>
        </Link>

        <div className={styles.profileContent}>
          <div className={styles.profileNameRow}>
            <Link href={`/profile/${profile.id}`} className={styles.profileName}>
              {profile.name}
            </Link>

            {profile.verified && (
              <span className={styles.verifiedIcon} title="Verified profile">
                <FiCheck aria-hidden="true" />
              </span>
            )}
          </div>

          <p className={styles.profileMeta}>
            {profile.age !== null ? `${profile.age} years` : "Age not added"}
            {profile.cast && (
              <>
                <span>•</span>
                {profile.cast}
              </>
            )}
          </p>

          {profile.location && (
            <div className={styles.profileLocation}>
              <FiMapPin aria-hidden="true" />
              <span>{profile.location}</span>
            </div>
          )}

          <div className={styles.profileDetails}>
            {profile.education && <span>{profile.education}</span>}
            {profile.maritalStatus && <span>{profile.maritalStatus}</span>}
            {profile.religion && <span>{profile.religion}</span>}
          </div>

          <div className={styles.cardActions}>
            <Link href={`/profile/${profile.id}`} className={styles.viewButton}>
              View profile
            </Link>

            <button
              type="button"
              className={`${styles.shortlistButton} ${
                favorite ? styles.shortlisted : ""
              }`}
              onClick={handleFavoriteClick}
              aria-label={
                favorite
                  ? `Remove ${profile.name} from favorites`
                  : `Add ${profile.name} to favorites`
              }
            >
              <FiHeart
                aria-hidden="true"
                fill={favorite ? "currentColor" : "none"}
              />
            </button>

            {canShowMobile && (
  <button
    type="button"
    className={styles.callButton}
    onClick={handleContactClick}
    disabled={unlocking}
    aria-label={`View contact details for ${profile.name}`}
  >
    <FiPhone aria-hidden="true" />
  </button>
)}
          </div>
        </div>
      </article>

      {showContactDialog && (
        <div
          className={styles.contactDialogOverlay}
          onClick={() => setShowContactDialog(false)}
        >
          <div
            className={styles.contactDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`contact-title-${profile.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.contactDialogClose}
              onClick={() => setShowContactDialog(false)}
              aria-label="Close contact details"
            >
              <FiX />
            </button>

            <div className={styles.contactDialogIcon}>
              <FiPhone />
            </div>

            <span className={styles.contactDialogEyebrow}>
              Contact unlocked
            </span>

            <h2 id={`contact-title-${profile.id}`}>{profile.name}</h2>

            <p className={styles.contactDialogLocation}>
              <FiMapPin />
              {profile.location || "Location not added"}
            </p>

            <div className={styles.contactNumber}>
              <div className={styles.contactNumberRow}>
                <strong>{contactNumber}</strong>

                <button
                  type="button"
                  className={styles.copyNumberButton}
                  onClick={handleCopyNumber}
                  aria-label="Copy mobile number"
                >
                  {numberCopied ? <FiCheck /> : <FiCopy />}
                  {numberCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className={styles.contactDialogActions}>
              <a href={`tel:${cleanMobile}`} className={styles.contactCallAction}>
                <FiPhone />
                Call now
              </a>

              <a
                href={`https://wa.me/${cleanMobile}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactWhatsappAction}
              >
                <Image
                  src="/public/images/logo/whatsapp.png"
                  alt=""
                  width={20}
                  height={20}
                />
                WhatsApp
              </a>
            </div>

            <p className={styles.contactDialogNote}>
              Please respect each other's privacy and communicate respectfully.
            </p>
          </div>
        </div>
      )}
    </>
  );
}