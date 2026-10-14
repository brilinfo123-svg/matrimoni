
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

type FavoritesContextType = {
  favoriteIds: string[];
  isLoadingFavorites: boolean;
  toggleFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  refreshFavorites: () => Promise<void>;
};

const FavoritesContext =
  createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  // Prevent duplicate requests for the same profile.
  const pendingFavorites = useRef(new Set<string>());

  // Keep the latest favorite state available to async callbacks.
  const favoriteIdsRef = useRef<string[]>([]);

  const updateFavoriteIds = useCallback(
    (updater: (current: string[]) => string[]) => {
      const next = updater(favoriteIdsRef.current);
      favoriteIdsRef.current = next;
      setFavoriteIds(next);
    },
    [],
  );

  const refreshFavorites = useCallback(async () => {
    try {
      const response = await fetch("/api/favorites", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        favoriteIdsRef.current = [];
        setFavoriteIds([]);
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load favorites");
      }

      const ids = Array.isArray(data.favoriteIds)
        ? data.favoriteIds.map(String)
        : [];

      favoriteIdsRef.current = ids;
      setFavoriteIds(ids);
    } catch (error) {
      console.error("LOAD_FAVORITES_ERROR:", error);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, []);

  useEffect(() => {
    void refreshFavorites();
  }, [refreshFavorites]);

  const toggleFavorite = useCallback(
    async (id: string) => {
      const profileId = String(id).trim();

      if (!profileId) {
        throw new Error("Profile ID is missing.");
      }

      const key = profileId.toLowerCase();

      // Ignore repeated clicks while this profile is being saved.
      if (pendingFavorites.current.has(key)) {
        return;
      }

      const previousIds = [...favoriteIdsRef.current];

      const wasFavorite = previousIds.some(
        (favoriteId) => favoriteId.toLowerCase() === key,
      );

      const action = wasFavorite ? "remove" : "add";

      pendingFavorites.current.add(key);

      // Optimistically update the UI immediately.
      updateFavoriteIds((current) =>
        action === "add"
          ? current.some((favoriteId) => favoriteId.toLowerCase() === key)
            ? current
            : [...current, profileId]
          : current.filter(
              (favoriteId) => favoriteId.toLowerCase() !== key,
            ),
      );

      const toastId = toast.loading(
        action === "add" ? "Adding to favorites..." : "Removing favorite...",
      );

      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileId,
            action,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          console.error("FAVORITES_API_ERROR:", {
            status: response.status,
            message: data?.message,
            profileId,
            action,
          });

          throw new Error(
            data?.message || `Favorite request failed (${response.status})`,
          );
        }

        // Reconcile with the server's latest state if provided.
        if (Array.isArray(data.favoriteIds)) {
          const serverIds = data.favoriteIds.map(String);
          favoriteIdsRef.current = serverIds;
          setFavoriteIds(serverIds);
        }

        toast.success(
          action === "add"
            ? "Added to favorites"
            : "Removed from favorites",
          { id: toastId },
        );
      } catch (error) {
        // Restore the previous state if the save failed.
        favoriteIdsRef.current = previousIds;
        setFavoriteIds(previousIds);

        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to update favorites. Please try again.",
          { id: toastId },
        );

        throw error;
      } finally {
        pendingFavorites.current.delete(key);
      }
    },
    [updateFavoriteIds],
  );

  const isFavorite = useCallback(
    (id: string) =>
      favoriteIds.some(
        (favoriteId) =>
          favoriteId.toLowerCase() === String(id).toLowerCase(),
      ),
    [favoriteIds],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isLoadingFavorites,
        toggleFavorite,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      "useFavorites must be used inside FavoritesProvider",
    );
  }

  return context;
}
