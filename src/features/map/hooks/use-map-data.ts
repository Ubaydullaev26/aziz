"use client";

import { useQuery } from "@tanstack/react-query";

export type MapCategory = {
  id: string;
  key: string;
  nameRu: string;
  nameEn: string;
  nameUz: string;
  icon: string;
  color: string;
  isEventCategory: boolean;
  position: number;
};

export type MapPlace = {
  id: string;
  slug: string;
  nameRu: string;
  shortDescriptionRu: string | null;
  latitude: number;
  longitude: number;
  address: string;
  coverImage: string;
  priceLevel: string;
  priceFrom: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  category: { key: string; nameRu: string; icon: string; color: string };
  _count: { tours: number; guides: number };
};

export type MapEvent = {
  id: string;
  slug: string;
  titleRu: string;
  coverImage: string;
  organizer: string;
  address: string;
  latitude: number;
  longitude: number;
  startAt: string;
  endAt: string;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  category: { key: string; nameRu: string; icon: string; color: string };
  ticketTypes: { id: string; name: string; price: number; currency: string }[];
  timing: { isLiveNow: boolean; startsSoon: boolean; hasEnded: boolean };
};

export type MapGuide = {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  languages: string[];
  experienceYears: number;
  pricePerHour: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  city: { latitude: number; longitude: number; nameRu: string };
  places: { latitude: number; longitude: number; nameRu: string }[];
};

export function useCategories() {
  return useQuery<{ categories: MapCategory[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Не удалось загрузить категории");
      return res.json();
    },
    staleTime: 5 * 60_000,
  });
}

export function usePlaces(citySlug: string) {
  return useQuery<{ places: MapPlace[] }>({
    queryKey: ["places", citySlug],
    queryFn: async () => {
      const res = await fetch(`/api/places?city=${citySlug}`);
      if (!res.ok) throw new Error("Не удалось загрузить места");
      return res.json();
    },
  });
}

export function useEvents(citySlug: string) {
  return useQuery<{ events: MapEvent[] }>({
    queryKey: ["events", citySlug],
    queryFn: async () => {
      const res = await fetch(`/api/events?city=${citySlug}&upcoming=true`);
      if (!res.ok) throw new Error("Не удалось загрузить события");
      return res.json();
    },
    refetchInterval: 60_000,
  });
}

export function useGuides(citySlug: string, enabled: boolean) {
  return useQuery<{ guides: MapGuide[] }>({
    queryKey: ["guides", citySlug],
    enabled,
    queryFn: async () => {
      const res = await fetch(`/api/guides?city=${citySlug}`);
      if (!res.ok) throw new Error("Не удалось загрузить гидов");
      return res.json();
    },
  });
}
