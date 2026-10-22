"use client";

import Link from "next/link";
import Image from "next/image";

import { useFavorites } from "@/components/FavoritesProvider/FavoritesProvider";

import {
  FiCheck,
  FiHeart,
  FiMapPin,
  FiPhone,
  FiStar,
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
  motherTongue?: string;
  company?: string;
  college?: string;

  profileFor?: string;
  gender?: string;

  // Mobile contact visibility setting
  isMobileVisible?: boolean;

  // Mobile number
  mobile?: string | number | null;

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
};

export default function ProfileCard({
  profile,
}: ProfileCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const favorite = isFavorite(profile.id);

  /*
   * Clean mobile number.
   * Example: "765-280-0999" -> "7652800999"
   */
  const cleanMobile = profile.mobile
    ? String(profile.mobile).replace(/\D/g, "")
    : "";

  // Hide contact buttons when the user disables mobile visibility.
  const canShowMobile = profile.isMobileVisible === true;

  return (
    <article className={styles.profileCard}>
      {/* Profile Image */}
      <Link
        href={`/profile/${profile.id}`}
        className={styles.profileImageLink}
        aria-label={`View ${profile.name}'s profile`}
      >
        <div className={styles.profileImage}>
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={`${profile.name} profile`}
              loading="lazy"
            />
          ) : (
            <span>{profile.initials}</span>
          )}

          <div className={styles.compatibility}>
            <FiStar aria-hidden="true" />
            <span>Profile</span>
          </div>
        </div>
      </Link>

      {/* Profile Content */}
      <div className={styles.profileContent}>
        {/* Name */}
        <div className={styles.profileNameRow}>
          <Link
            href={`/profile/${profile.id}`}
            className={styles.profileName}
          >
            {profile.name}
          </Link>

          {profile.verified && (
            <span
              className={styles.verifiedIcon}
              title="Verified profile"
            >
              <FiCheck aria-hidden="true" />
            </span>
          )}
        </div>

        {/* Age + Profession */}
        <p className={styles.profileMeta}>
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

        {/* Location */}
        {profile.location && (
          <div className={styles.profileLocation}>
            <FiMapPin aria-hidden="true" />
            <span>{profile.location}</span>
          </div>
        )}

        {/* Details */}
        <div className={styles.profileDetails}>
          {profile.education && (
            <span>{profile.education}</span>
          )}

          {profile.maritalStatus && (
            <span>{profile.maritalStatus}</span>
          )}

          {profile.religion && (
            <span>{profile.religion}</span>
          )}
        </div>

        {/* Actions */}
        <div className={styles.cardActions}>
          {/* View Profile */}
          <Link
            href={`/profile/${profile.id}`}
            className={styles.viewButton}
          >
            View profile
          </Link>

          {/* Favorites */}
          <button
            type="button"
            className={`${styles.shortlistButton} ${
              favorite ? styles.shortlisted : ""
            }`}
            onClick={async () => {
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
            }}
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

          {/* Call and WhatsApp: only when mobile visibility is enabled */}
          {canShowMobile && cleanMobile && (
            <>
              <a
                href={`tel:${cleanMobile}`}
                className={styles.callButton}
                aria-label={`Call ${profile.name}`}
              >
                <FiPhone aria-hidden="true" />
              </a>

              <a
                href={`https://wa.me/${cleanMobile}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappButton}
                aria-label={`WhatsApp ${profile.name}`}
              >
                <Image
                  src="/public/images/logo/whatsapp.png"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                />
              </a>
            </>
          )}
        </div>
      </div>
    </article>
  );
}