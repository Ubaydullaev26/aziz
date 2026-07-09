"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { usePlaces, useEvents, useGuides } from "@/features/map/hooks/use-map-data";
import { useMapStore } from "@/features/map/store";
import { MapView } from "@/features/map/components/map-view";
import { FilterPanel } from "@/features/map/components/filter-panel";
import { LiveFeedPanel } from "@/features/map/components/live-feed-panel";
import { EntityDetailSheet } from "@/features/map/components/entity-detail-sheet";

export function MapShell({
  citySlug,
  center,
  zoom,
}: {
  citySlug: string;
  center: { latitude: number; longitude: number };
  zoom: number;
}) {
  const { activeCategories, toursOnly, showGuides } = useMapStore();
  const { data: placesData, isLoading: placesLoading } = usePlaces(citySlug);
  const { data: eventsData } = useEvents(citySlug);
  const { data: guidesData } = useGuides(citySlug, showGuides);

  const places = React.useMemo(() => {
    let list = placesData?.places ?? [];
    if (activeCategories.length) {
      list = list.filter((p) => activeCategories.includes(p.category.key));
    } else {
      list = [];
    }
    if (toursOnly) list = list.filter((p) => p._count.tours > 0);
    return list;
  }, [placesData, activeCategories, toursOnly]);

  const events = React.useMemo(() => {
    let list = eventsData?.events ?? [];
    if (activeCategories.length) {
      list = list.filter((e) => activeCategories.includes(e.category.key));
    } else {
      list = [];
    }
    return list;
  }, [eventsData, activeCategories]);

  const guides = showGuides ? (guidesData?.guides ?? []) : [];

  return (
    <div className="relative h-full w-full">
      <MapView center={center} zoom={zoom} places={places} events={events} guides={guides} />
      <FilterPanel />
      <LiveFeedPanel events={eventsData?.events ?? []} />
      <EntityDetailSheet />

      {placesLoading && (
        <div className="glass-panel absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm shadow lg:left-[19rem] lg:translate-x-0">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Загружаем город…
        </div>
      )}
    </div>
  );
}
