"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FiCheck,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
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
  shortlisted: boolean;
  onShortlist: () => void;
};

export default function ProfileCard({
  profile,
  shortlisted,
  onShortlist,
}: ProfileCardProps) {
  /*
   * Clean mobile number
   *
   * Example:
   * "765-280-0999" -> "7652800999"
   */
  const cleanMobile = profile.mobile
    ? String(profile.mobile).replace(/\D/g, "")
    : "";

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
          {/* Shortlist */}
         

          {/* View Profile */}
          <Link
            href={`/profile/${profile.id}`}
            className={styles.viewButton}
          >
            View profile
          </Link>

          {/* Message */}
          {/* <Link
            href={`/messages?userId=${profile.id}`}
            className={styles.messageButton}
            aria-label={`Message ${profile.name}`}
          >
            <FiMessageCircle aria-hidden="true" />
          </Link> */}

          {/* Call */}
          <button
            type="button"
            className={`${styles.shortlistButton} ${
              shortlisted ? styles.shortlisted : ""
            }`}
            onClick={onShortlist}
            aria-label={
              shortlisted
                ? `Remove ${profile.name} from shortlist`
                : `Add ${profile.name} to shortlist`
            }
          >
            <FiHeart
              aria-hidden="true"
              fill={shortlisted ? "currentColor" : "none"}
            />
          </button>
          {cleanMobile && (
            <a
              href={`tel:${cleanMobile}`}
              className={styles.callButton}
              aria-label={`Call ${profile.name}`}
            >
              <FiPhone aria-hidden="true" />
            </a>
          )}

          {/* WhatsApp */}
          {cleanMobile && (
            <a
              href={`https://wa.me/${cleanMobile}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
              aria-label={`WhatsApp ${profile.name}`}
            >
             <Image src="/public/images/logo/whatsapp.png" alt="WhatsApp" width={20} height={20} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}