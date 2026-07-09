"use client";

import { useQuery } from "@tanstack/react-query";

export function useEventDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["event", slug],
    enabled: !!slug,
    queryFn: async () => {
      const res = await fetch(`/api/events/${slug}`);
      if (!res.ok) throw new Error("Не удалось загрузить событие");
      const data = await res.json();
      return data.event as EventDetail;
    },
  });
}

export type EventDetail = {
  id: string;
  slug: string;
  titleRu: string;
  descriptionRu: string;
  coverImage: string;
  organizer: string;
  address: string;
  latitude: number;
  longitude: number;
  startAt: string;
  endAt: string;
  rating: number;
  reviewCount: number;
  city: { nameRu: string; slug: string };
  category: { key: string; nameRu: string; icon: string; color: string };
  place: { slug: string; nameRu: string } | null;
  images: { id: string; url: string; alt: string | null }[];
  ticketTypes: { id: string; name: string; price: number; currency: string; totalQuantity: number; soldQuantity: number }[];
  timing: { isLiveNow: boolean; startsSoon: boolean; hasEnded: boolean };
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: { name: string | null; image: string | null };
  }[];
};
