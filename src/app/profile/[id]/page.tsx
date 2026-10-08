"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
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
  FiMessageCircle,
  FiMoreHorizontal,
  FiPhone,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import styles from "./profile.module.scss";
import ProfileSkeleton from "@/components/ProfileSkeleton/ProfileSkeleton";

type Profile = {
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
  motherTongue: string;
  maritalStatus: string;

  education: string;
  college: string;

  profession: string;
  company: string;
  income: string;

  familyType: string;
  familyValues: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;

  lifestyle: string;
  diet: string;
  smoking: string;
  drinking: string;

  partnerAgeMin: string;
  partnerAgeMax: string;
  partnerState: string;
  partnerCity: string;
  partnerReligion: string;
  partnerEducation: string;
  partnerProfession: string;
  partnerMaritalStatus: string;
  partnerLifestyle: string;

  photos: string[];

  initials: string;

  verified: boolean;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  isProfileComplete: boolean;
};

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "Not added";
  }

  return String(value);
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

  const [isShortlisted, setIsShortlisted] = useState(false);
  const [interestSent, setInterestSent] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

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
          err instanceof Error
            ? err.message
            : "Unable to load profile",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const primaryPhoto = useMemo(() => {
    if (!profile?.photos?.length) {
      return null;
    }

    return profile.photos[0];
  }, [profile]);

  if (loading) {
    return (
      <ProfileSkeleton />
    );
  }

  if (error || !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.backgroundGlow} />
        <div className={styles.backgroundGlowTwo} />

        <div className={"container"}>
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

  const phone = profile.isMobileVisible ? profile.mobile: "";

  console.log("Profile data:", profile);

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

      <div className={"container"}>
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
              {primaryPhoto ? (
                <img
                  src={primaryPhoto}
                  alt={`${profile.name} profile`}
                  className={styles.profilePhotoImage}
                />
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

              <FiChevronRight
                className={styles.compatibilityArrow}
              />
            </div>

            {/* ACTIONS */}
           
            {/* ACTIONS */}
            <div className={styles.actions}>
              {/* <button
                type="button"
                className={`${styles.interestButton} ${
                  interestSent ? styles.interestSent : ""
                }`}
                onClick={() => setInterestSent(true)}
              >
                <FiHeart
                  fill={interestSent ? "currentColor" : "none"}
                />

                <span>
                  {interestSent ? "Interest sent" : "Send interest"}
                </span>
              </button> */}

              {/* MESSAGE BUTTON */}
              <Link
                href={`/messages?userId=${profile.id}`}
                className={styles.messageButton}
              >
                {/* <FiMessageCircle /> */}
                <Image src="/public/images/logo/message.png" alt="WhatsApp" width={20} height={20} />
                <span>Message</span>
              </Link>
              {/* WHATSAPP BUTTON */}
              {profile.mobile && (
                <a
                  href={`https://wa.me/${profile.mobile.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappButton}
                >
                  {/* <FiMessageCircle /> */}
                  <Image src="/public/images/logo/whatsapp.png" alt="WhatsApp" width={20} height={20} />
                  <span>WhatsApp</span>
                </a>
              )}
              {/* CALL BUTTON */}
              {profile.mobile && (
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                  className={styles.callButton}
                >
                  <FiPhone />
                  <span>Call</span>
                </a>
              )}

              

              {/* SHORTLIST BUTTON */}
              <button
                type="button"
                className={`${styles.shortlistButton} ${
                  isShortlisted ? styles.active : ""
                }`}
                onClick={() => setIsShortlisted((current) => !current)}
                aria-label={
                  isShortlisted
                    ? "Remove from shortlist"
                    : "Add to shortlist"
                }
              >
                <FiHeart
                  fill={isShortlisted ? "currentColor" : "none"}
                />
              </button>
            </div>
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
                {aboutText ||
                  "This member has not added an about section yet."}
              </p>
            </section>

            {/* BASIC DETAILS */}
            <section className={styles.card}>
              <SectionHeader
                icon={<FiUser />}
                title="Basic details"
              />

              <div className={styles.detailsGrid}>
                <DetailItem
                  label="Age"
                  value={
                    profile.age !== null
                      ? `${profile.age} years`
                      : ""
                  }
                />

                <DetailItem label="Gender" value={profile.gender} />

                <DetailItem
                  label="Marital status"
                  value={profile.maritalStatus}
                />

                <DetailItem
                  label="Religion"
                  value={profile.religion}
                />

                <DetailItem
                  label="Mother tongue"
                  value={profile.motherTongue}
                />

                <DetailItem
                  label="Profile created for"
                  value={profile.profileFor}
                />

                <DetailItem label="City" value={profile.city} />

                <DetailItem label="State" value={profile.state} />
              </div>
            </section>

            {/* EDUCATION & CAREER */}
            <section className={styles.card}>
              <SectionHeader
                icon={<FiBriefcase />}
                title="Education & career"
              />

              <div className={styles.subsection}>
                <h3>Education</h3>

                <div className={styles.detailsGrid}>
                  <DetailItem
                    label="Education"
                    value={profile.education}
                  />

                  <DetailItem
                    label="College"
                    value={profile.college}
                  />
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.subsection}>
                <h3>Career</h3>

                <div className={styles.detailsGrid}>
                  <DetailItem
                    label="Profession"
                    value={profile.profession}
                  />

                  <DetailItem
                    label="Company"
                    value={profile.company}
                  />

                  <DetailItem label="Income" value={profile.income} />
                </div>
              </div>
            </section>

            {/* FAMILY */}
            <section className={styles.card}>
              <SectionHeader icon={<FiUsers />} title="Family" />

              <div className={styles.detailsGrid}>
                <DetailItem
                  label="Family type"
                  value={profile.familyType}
                />

                <DetailItem
                  label="Family values"
                  value={profile.familyValues}
                />

                <DetailItem
                  label="Father's occupation"
                  value={profile.fatherOccupation}
                />

                <DetailItem
                  label="Mother's occupation"
                  value={profile.motherOccupation}
                />

                <DetailItem
                  label="Siblings"
                  value={profile.siblings}
                />
              </div>
            </section>

            {/* LIFESTYLE */}
            <section className={styles.card}>
              <SectionHeader icon={<FiHome />} title="Lifestyle" />

              <div className={styles.detailsGrid}>
                <DetailItem
                  label="Lifestyle"
                  value={profile.lifestyle}
                />

                <DetailItem label="Diet" value={profile.diet} />

                <DetailItem
                  label="Smoking"
                  value={profile.smoking}
                />

                <DetailItem
                  label="Drinking"
                  value={profile.drinking}
                />
              </div>
            </section>

            {/* PHOTOS */}
            {profile.photos.length > 0 && (
              <section className={styles.card}>
                <SectionHeader icon={<FiImage />} title="Photos" />

                <div className={styles.profilePhotos}>
                  {profile.photos.map((photo, index) => (
                    <img
                      key={`${photo}-${index}`}
                      src={photo}
                      alt={`${profile.name} photo ${index + 1}`}
                    />
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
                What {profile.firstName || "this member"} is looking
                for in a partner.
              </p>

              <div className={styles.detailsGrid}>
                <DetailItem
                  label="Age"
                  value={
                    profile.partnerAgeMin &&
                    profile.partnerAgeMax
                      ? `${profile.partnerAgeMin} – ${profile.partnerAgeMax} years`
                      : ""
                  }
                />

                <DetailItem
                  label="State"
                  value={profile.partnerState}
                />

                <DetailItem
                  label="City"
                  value={profile.partnerCity}
                />

                <DetailItem
                  label="Religion"
                  value={profile.partnerReligion}
                />

                <DetailItem
                  label="Education"
                  value={profile.partnerEducation}
                />

                <DetailItem
                  label="Profession"
                  value={profile.partnerProfession}
                />

                <DetailItem
                  label="Marital status"
                  value={profile.partnerMaritalStatus}
                />

                <DetailItem
                  label="Lifestyle"
                  value={profile.partnerLifestyle}
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

              <span className={styles.sideEyebrow}>
                Profile verification
              </span>

              <h2>Verification status</h2>

              <p>Verification information for this profile.</p>

              <div className={styles.verificationList}>
                <div>
                  <span>
                    <FiCheck />
                  </span>

                  <strong>
                    Email{" "}
                    {profile.isEmailVerified
                      ? "verified"
                      : "not verified"}
                  </strong>
                </div>

                <div>
                  <span>
                    <FiCheck />
                  </span>

                  <strong>
                    Mobile{" "}
                    {profile.isMobileVerified
                      ? "verified"
                      : "not verified"}
                  </strong>
                </div>

                <div
                  className={
                    profile.isProfileComplete
                      ? ""
                      : styles.notVerified
                  }
                >
                  <span>
                    <FiShield />
                  </span>

                  <strong>
                    Profile{" "}
                    {profile.isProfileComplete
                      ? "complete"
                      : "incomplete"}
                  </strong>
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
                  Only share personal information when you are
                  comfortable doing so.
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
                Interested in{" "}
                {profile.firstName || "this profile"}?
              </strong>

              <p>
                Send an interest and start a meaningful connection.
              </p>
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
    </div>
  );
}
