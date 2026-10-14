
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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

  const refreshFavorites = useCallback(async () => {
    try {
      const response = await fetch("/api/favorites", {
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        setFavoriteIds([]);
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load favorites");
      }

      setFavoriteIds(
        Array.isArray(data.favoriteIds)
          ? data.favoriteIds.map(String)
          : [],
      );
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

      const isCurrentlyFavorite = favoriteIds.some(
        (favoriteId) =>
          String(favoriteId).toLowerCase() ===
          profileId.toLowerCase(),
      );

      const action = isCurrentlyFavorite ? "remove" : "add";

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

      setFavoriteIds(
        Array.isArray(data.favoriteIds)
          ? data.favoriteIds.map((favoriteId: string) =>
              String(favoriteId),
            )
          : [],
      );
    },
    [favoriteIds],
  );

  const isFavorite = useCallback(
    (id: string) =>
      favoriteIds.some(
        (favoriteId) =>
          String(favoriteId).toLowerCase() ===
          String(id).toLowerCase(),
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
