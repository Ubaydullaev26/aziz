"use client";

import * as React from "react";
import Image from "next/image";
import { Radio, ChevronUp, ChevronDown } from "lucide-react";

import { useMapStore } from "@/features/map/store";
import type { MapEvent } from "@/features/map/hooks/use-map-data";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function LiveFeedPanel({ events }: { events: MapEvent[] }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const { select, requestFlyTo } = useMapStore();

  const feed = events
    .filter((e) => e.timing.isLiveNow || e.timing.startsSoon)
    .sort((a, b) => Number(b.timing.isLiveNow) - Number(a.timing.isLiveNow));

  if (feed.length === 0) return null;

  return (
    <div className="glass-panel absolute bottom-4 right-4 z-10 w-full max-w-xs overflow-hidden rounded-2xl shadow-xl sm:bottom-6 sm:right-6">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-live rounded-full bg-sunset" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-sunset" />
        </span>
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Radio className="h-3.5 w-3.5" /> Сейчас рядом
        </span>
        <span className="ml-auto text-xs text-muted-foreground">{feed.length}</span>
        {collapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {!collapsed && (
        <div className="no-scrollbar max-h-72 space-y-1 overflow-y-auto px-2 pb-2">
          {feed.map((event) => (
            <button
              key={event.id}
              onClick={() => {
                select({ type: "event", slug: event.slug });
                requestFlyTo(event.longitude, event.latitude);
              }}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-secondary"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image src={event.coverImage} alt="" fill className="object-cover" sizes="48px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{event.titleRu}</p>
                <p className="truncate text-xs text-muted-foreground">{event.address}</p>
              </div>
              <Badge
                variant={event.timing.isLiveNow ? "live" : "secondary"}
                className={cn("shrink-0 text-[10px]", !event.timing.isLiveNow && "opacity-80")}
              >
                {event.timing.isLiveNow ? "Сейчас" : formatDateTime(event.startAt)}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
