"use client";

import { useQuery } from "@tanstack/react-query";

export function usePlaceDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["place", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`/api/places/${slug}`);
      if (!res.ok) throw new Error("Не удалось загрузить место");
      const data = await res.json();
      return data.place as PlaceDetail;
    },
  });
}

export type PlaceDetail = {
  id: string;
  slug: string;
  nameRu: string;
  descriptionRu: string;
  historyRu: string | null;
  address: string;
  latitude: number;
  longitude: number;
  priceLevel: string;
  priceFrom: number | null;
  currency: string;
  phone: string | null;
  website: string | null;
  rating: number;
  reviewCount: number;
  coverImage: string;
  city: { nameRu: string; slug: string };
  category: { key: string; nameRu: string; icon: string; color: string };
  images: { id: string; url: string; alt: string | null }[];
  openingHours: { dayOfWeek: number; opensAt: string | null; closesAt: string | null; isClosed: boolean }[];
  guides: {
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
  }[];
  tours: {
    id: string;
    slug: string;
    titleRu: string;
    coverImage: string;
    durationMinutes: number;
    price: number;
    currency: string;
    maxGroupSize: number;
    availabilities: { id: string; startAt: string; capacity: number; bookedCount: number }[];
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { name: string | null; image: string | null };
  }[];
};
