"use client";

import Link from "next/link";
import {
  FiCheck,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
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
  return (
    <article className={styles.profileCard}>
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

      <div className={styles.profileContent}>
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

        {profile.location && (
          <div className={styles.profileLocation}>
            <FiMapPin aria-hidden="true" />

            <span>{profile.location}</span>
          </div>
        )}

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

        <div className={styles.cardActions}>
          <button
            type="button"
            className={`${styles.shortlistButton} ${
              shortlisted
                ? styles.shortlisted
                : ""
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
              fill={
                shortlisted
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          <Link
            href={`/profile/${profile.id}`}
            className={styles.viewButton}
          >
            View profile
          </Link>

          <Link
            href={`/dashboard/messages?profile=${profile.id}`}
            className={styles.messageButton}
            aria-label={`Message ${profile.name}`}
          >
            <FiMessageCircle aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}