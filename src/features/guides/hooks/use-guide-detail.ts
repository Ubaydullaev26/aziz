"use client";

import { useQuery } from "@tanstack/react-query";

export function useGuideDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["guide", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`/api/guides/${slug}`);
      if (!res.ok) throw new Error("Не удалось загрузить гида");
      const data = await res.json();
      return data.guide as GuideDetail;
    },
  });
}

export type GuideDetail = {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  bioRu: string | null;
  languages: string[];
  experienceYears: number;
  pricePerHour: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  city: { nameRu: string; slug: string };
  places: { slug: string; nameRu: string; coverImage: string }[];
  availabilities: { id: string; startAt: string; endAt: string; capacity: number; bookedCount: number }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { name: string | null; image: string | null };
  }[];
};
