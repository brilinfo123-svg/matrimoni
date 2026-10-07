"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiHeart,
  FiMessageCircle,
  FiPhone,
  FiStar,
} from "react-icons/fi";

import styles from "./profile.module.scss";

interface ProfileActionsProps {
  profileId: string;
  name: string;
  phone: string;
  bottom?: boolean;
}

export default function ProfileActions({
  profileId,
  name,
  phone,
  bottom = false,
}: ProfileActionsProps) {
  const [isShortlisted, setIsShortlisted] =
    useState(false);

  const [interestSent, setInterestSent] =
    useState(false);

  const cleanPhone = phone.replace(
    /\D/g,
    "",
  );

  if (bottom) {
    return (
      <button
        type="button"
        onClick={() =>
          setInterestSent(true)
        }
        className={styles.bottomButton}
      >
        <FiHeart
          aria-hidden="true"
          fill={
            interestSent
              ? "currentColor"
              : "none"
          }
        />

        {interestSent
          ? "Interest sent"
          : "Send interest"}
      </button>
    );
  }

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={`${styles.interestButton} ${
          interestSent
            ? styles.interestSent
            : ""
        }`}
        onClick={() =>
          setInterestSent(true)
        }
      >
        <FiHeart
          aria-hidden="true"
          fill={
            interestSent
              ? "currentColor"
              : "none"
          }
        />

        <span>
          {interestSent
            ? "Interest sent"
            : "Send interest"}
        </span>
      </button>

      <Link
        href={`/messages?profile=${profileId}`}
        className={styles.messageButton}
      >
        <FiMessageCircle
          aria-hidden="true"
        />

        <span>Message</span>
      </Link>

      {cleanPhone && (
        <>
          <a
            href={`tel:${cleanPhone}`}
            className={styles.callButton}
            aria-label={`Call ${name}`}
          >
            <FiPhone
              aria-hidden="true"
            />

            <span>Call</span>
          </a>

          <a
            href={`https://wa.me/${cleanPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className={
              styles.whatsappButton
            }
            aria-label={`WhatsApp ${name}`}
          >
            <FiMessageCircle
              aria-hidden="true"
            />

            <span>WhatsApp</span>
          </a>
        </>
      )}

      <button
        type="button"
        className={`${styles.shortlistButton} ${
          isShortlisted
            ? styles.active
            : ""
        }`}
        onClick={() =>
          setIsShortlisted(
            (current) => !current,
          )
        }
        aria-label={
          isShortlisted
            ? "Remove from shortlist"
            : "Add to shortlist"
        }
      >
        <FiStar
          aria-hidden="true"
          fill={
            isShortlisted
              ? "currentColor"
              : "none"
          }
        />
      </button>
    </div>
  );
}