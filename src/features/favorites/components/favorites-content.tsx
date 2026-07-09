"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, HeartOff } from "lucide-react";

import { useFavorites } from "@/features/favorites/hooks/use-favorites";
import { RemoveFavoriteButton } from "@/features/favorites/components/remove-favorite-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";

export function FavoritesContent() {
  const { data, isLoading } = useFavorites();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const places = data?.places ?? [];
  const events = data?.events ?? [];

  return (
    <Tabs defaultValue="places">
      <TabsList>
        <TabsTrigger value="places">Места ({places.length})</TabsTrigger>
        <TabsTrigger value="events">События ({events.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="places" className="space-y-2">
        {places.length === 0 && <EmptyState text="Вы ещё не сохранили ни одного места" />}
        {places.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
            <Link href={`/places/${f.place.slug}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              <Image src={f.place.coverImage} alt={f.place.nameRu} fill className="object-cover" />
            </Link>
            <Link href={`/places/${f.place.slug}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">{f.place.nameRu}</p>
              <p className="truncate text-xs text-muted-foreground">
                {f.place.category.nameRu} · {f.place.city.nameRu}
              </p>
              <p className="flex items-center gap-1 text-xs font-medium">
                <Star className="h-3 w-3 fill-sunset text-sunset" /> {f.place.rating.toFixed(1)}
              </p>
            </Link>
            <RemoveFavoriteButton targetType="PLACE" targetId={f.place.id} />
          </div>
        ))}
      </TabsContent>

      <TabsContent value="events" className="space-y-2">
        {events.length === 0 && <EmptyState text="Вы ещё не сохранили ни одного события" />}
        {events.map((f) => (
          <div key={f.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
            <Link href={`/events/${f.event.slug}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              <Image src={f.event.coverImage} alt={f.event.titleRu} fill className="object-cover" />
            </Link>
            <Link href={`/events/${f.event.slug}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">{f.event.titleRu}</p>
              <p className="truncate text-xs text-muted-foreground">
                {f.event.category.nameRu} · {formatDateTime(f.event.startAt)}
              </p>
            </Link>
            <RemoveFavoriteButton targetType="EVENT" targetId={f.event.id} />
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-center">
      <HeartOff className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
