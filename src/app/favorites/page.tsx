"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FiHeart,
  FiMapPin,
  FiBriefcase,
  FiArrowRight,
  FiUser,
  FiRefreshCw,
} from "react-icons/fi";

import { useFavorites } from "@/components/FavoritesProvider/FavoritesProvider";
import styles from "./favorites.module.scss";

type FavoriteProfile = {
  id: string;
  name: string;
  photo: string | null;
  age?: number;
  city?: string;
  state?: string;
  profession?: string;
  education?: string;
};

// Shared cache remains available while navigating between pages.
let favoritesCache: FavoriteProfile[] | null = null;

// Reuse an ongoing request instead of sending duplicate requests.
let favoritesRequest: Promise<FavoriteProfile[]> | null = null;

export default function FavoritesPage() {
  const [profiles, setProfiles] = useState<FavoriteProfile[]>(
    () => favoritesCache ?? []
  );

  const [loading, setLoading] = useState(
    () => favoritesCache === null
  );

  const [removingId, setRemovingId] = useState("");
  const [error, setError] = useState("");

  const { isFavorite, toggleFavorite } = useFavorites();

  const loadFavorites = useCallback(
    async (forceRefresh = false) => {
      // Do not call APIs again when cached profiles are available.
      if (!forceRefresh && favoritesCache !== null) {
        setProfiles(favoritesCache);
        setError("");
        setLoading(false);
        return;
      }

      // Reuse the existing request when the initial load is in progress.
      if (!forceRefresh && favoritesRequest) {
        setLoading(true);

        try {
          const result = await favoritesRequest;
          setProfiles(result);
          setError("");
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load favorite profiles."
          );
        } finally {
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setError("");

      const request = (async (): Promise<FavoriteProfile[]> => {
        const favoritesResponse = await fetch("/api/favorites", {
          credentials: "include",
          cache: "no-store",
        });

        const favoritesData = await favoritesResponse.json();

        if (!favoritesResponse.ok || !favoritesData.success) {
          throw new Error(
            favoritesData.message ||
              "Unable to load favorite profiles."
          );
        }

        const favoriteIds: string[] = Array.isArray(
          favoritesData.favoriteIds
        )
          ? favoritesData.favoriteIds.map(String)
          : [];

        if (favoriteIds.length === 0) {
          return [];
        }

        const usersResponse = await fetch(
          `/api/users?ids=${encodeURIComponent(
            favoriteIds.join(",")
          )}`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        const usersData = await usersResponse.json();

        if (!usersResponse.ok || !usersData.success) {
          throw new Error(
            usersData.message ||
              "Unable to load profile details."
          );
        }

        const users: FavoriteProfile[] = (
          Array.isArray(usersData.users) ? usersData.users : []
        ).map((user: Record<string, unknown>) => {
          const firstName = String(user.firstName || "");
          const lastName = String(user.lastName || "");

          const name = String(
            user.name ||
              `${firstName} ${lastName}`.trim() ||
              "Member"
          );

          const photos = Array.isArray(user.photos)
            ? user.photos
            : [];

          const dateOfBirth = user.dateOfBirth
            ? new Date(String(user.dateOfBirth))
            : null;

          let age: number | undefined;

          if (
            dateOfBirth &&
            !Number.isNaN(dateOfBirth.getTime())
          ) {
            const today = new Date();

            age =
              today.getFullYear() - dateOfBirth.getFullYear();

            const birthdayNotReached =
              today.getMonth() < dateOfBirth.getMonth() ||
              (today.getMonth() === dateOfBirth.getMonth() &&
                today.getDate() < dateOfBirth.getDate());

            if (birthdayNotReached) {
              age--;
            }
          }

          const photo =
            typeof user.photo === "string" && user.photo.trim()
              ? user.photo
              : typeof photos[0] === "string"
                ? photos[0]
                : null;

          return {
            id: String(user.id || user._id || ""),
            name,
            photo,
            age,
            city: String(user.city || ""),
            state: String(user.state || ""),
            profession: String(user.profession || ""),
            education: String(user.education || ""),
          };
        });

        // Keep the same order as the favorites API response.
        const profilesById = new Map(
          users.map((profile) => [profile.id, profile])
        );

        return favoriteIds
          .map((id) => profilesById.get(id))
          .filter(
            (profile): profile is FavoriteProfile =>
              Boolean(profile?.id)
          );
      })();

      favoritesRequest = request;

      try {
        const result = await request;

        favoritesCache = result;
        setProfiles(result);
        setError("");
      } catch (err) {
        console.error("Favorites loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load favorite profiles."
        );
      } finally {
        if (favoritesRequest === request) {
          favoritesRequest = null;
        }

        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadFavorites();

    const handleFavoritesUpdated = (event: Event) => {
      // Ignore the event emitted by this page after its own update.
      const customEvent = event as CustomEvent<{
        source?: string;
      }>;

      if (customEvent.detail?.source === "favorites-page") {
        return;
      }

      // Another component changed favorites while this page is mounted.
      void loadFavorites(true);
    };

    window.addEventListener(
      "favorites:updated",
      handleFavoritesUpdated
    );

    return () => {
      window.removeEventListener(
        "favorites:updated",
        handleFavoritesUpdated
      );
    };
  }, [loadFavorites]);

  const removeFavorite = async (profileId: string) => {
    if (removingId) return;

    setRemovingId(profileId);
    setError("");

    try {
      await toggleFavorite(profileId);

      // Update both the visible list and the cached profiles.
      const updatedProfiles = (favoritesCache ?? profiles).filter(
        (profile) => profile.id !== profileId
      );

      favoritesCache = updatedProfiles;
      setProfiles(updatedProfiles);

      // Notify other components without triggering another fetch here.
      window.dispatchEvent(
        new CustomEvent("favorites:updated", {
          detail: { source: "favorites-page" },
        })
      );
    } catch (err) {
      console.error("Remove favorite error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to remove favorite. Please try again."
      );
    } finally {
      setRemovingId("");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.glow} />

      <div className="container">
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              <FiHeart aria-hidden="true" />
              YOUR SHORTLIST
            </span>

            <h1>Favorite Profiles</h1>

            <p>
              Keep track of the people who caught your attention
              and revisit their profiles anytime.
            </p>
          </div>

          {!loading && (
            <div className={styles.count}>
              <FiHeart aria-hidden="true" />
              <span>{profiles.length} saved</span>
            </div>
          )}
        </header>

        {error && (
          <div className={styles.error} role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => void loadFavorites(true)}
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={styles.skeletonCard}
              >
                <div className={styles.skeletonPhoto} />

                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineShort} />
                  <div className={styles.skeletonButton} />
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <section className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FiHeart aria-hidden="true" />
            </div>

            <h2>No favorites yet</h2>

            <p>
              Profiles you save using the heart icon will appear
              here, so you can find them easily later.
            </p>

            <Link
              href="/search"
              className={styles.primaryButton}
            >
              Explore profiles
              <FiArrowRight aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <div className={styles.grid}>
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className={styles.card}
              >
                <Link
                  href={`/profile/${profile.id}`}
                  className={styles.photoLink}
                  aria-label={`View ${profile.name}'s profile`}
                >
                  {profile.photo ? (
                    <Image
                      src={profile.photo}
                      alt={`${profile.name}'s profile`}
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                      className={styles.photo}
                      unoptimized
                    />
                  ) : (
                    <div className={styles.photoPlaceholder}>
                      <FiUser aria-hidden="true" />
                    </div>
                  )}

                  <span className={styles.savedLabel}>
                    <FiHeart aria-hidden="true" />
                    Saved
                  </span>
                </Link>

                <div className={styles.cardContent}>
                  <div className={styles.nameRow}>
                    <h2>{profile.name}</h2>

                    {profile.age !== undefined &&
                      profile.age > 0 && (
                        <span className={styles.age}>
                          {profile.age}
                        </span>
                      )}
                  </div>

                  {(profile.city || profile.state) && (
                    <p className={styles.detail}>
                      <FiMapPin aria-hidden="true" />
                      {[profile.city, profile.state]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}

                  {profile.profession && (
                    <p className={styles.detail}>
                      <FiBriefcase aria-hidden="true" />
                      {profile.profession}
                    </p>
                  )}

                  {profile.education && (
                    <p className={styles.education}>
                      {profile.education}
                    </p>
                  )}

                  <div className={styles.cardActions}>
                    <Link
                      href={`/profile/${profile.id}`}
                      className={styles.viewButton}
                    >
                      View Profile
                      <FiArrowRight aria-hidden="true" />
                    </Link>

                    <button
                      type="button"
                      className={`${styles.removeButton} ${
                        isFavorite(profile.id)
                          ? styles.shortlisted
                          : ""
                      }`}
                      onClick={() =>
                        void removeFavorite(profile.id)
                      }
                      disabled={Boolean(removingId)}
                      aria-label={`Remove ${profile.name} from favorites`}
                      title="Remove from favorites"
                    >
                      {removingId === profile.id ? (
                        <FiRefreshCw
                          aria-hidden="true"
                          className={styles.spinning}
                        />
                      ) : (
                        <FiHeart
                          aria-hidden="true"
                          fill={
                            isFavorite(profile.id)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}