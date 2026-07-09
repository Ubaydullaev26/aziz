"use client";

import { useMapStore } from "@/features/map/store";
import { PlaceDetailSheet } from "@/features/places/components/place-detail-sheet";
import { EventDetailSheet } from "@/features/events/components/event-detail-sheet";
import { GuideDetailSheet } from "@/features/guides/components/guide-detail-sheet";

export function EntityDetailSheet() {
  const { selected, select } = useMapStore();

  if (!selected) return null;

  const onClose = () => select(null);

  if (selected.type === "place") return <PlaceDetailSheet slug={selected.slug} onClose={onClose} />;
  if (selected.type === "event") return <EventDetailSheet slug={selected.slug} onClose={onClose} />;
  return <GuideDetailSheet slug={selected.slug} onClose={onClose} />;
}
