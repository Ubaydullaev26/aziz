"use client";

import { useQuery } from "@tanstack/react-query";

export type FavoritePlaceItem = {
  id: string;
  place: {
    id: string;
    slug: string;
    nameRu: string;
    coverImage: string;
    rating: number;
    category: { nameRu: string; color: string };
    city: { nameRu: string };
  };
};

export type FavoriteEventItem = {
  id: string;
  event: {
    id: string;
    slug: string;
    titleRu: string;
    coverImage: string;
    startAt: string;
    category: { nameRu: string; color: string };
    city: { nameRu: string };
  };
};

export function useFavorites() {
  return useQuery<{ places: FavoritePlaceItem[]; events: FavoriteEventItem[] }>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Не удалось загрузить избранное");
      return res.json();
    },
  });
}
