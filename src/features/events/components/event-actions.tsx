"use client";

import { Heart, Navigation2, Share2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFavoriteToggle } from "@/features/favorites/hooks/use-favorite-toggle";
import { useShare } from "@/lib/use-share";

export function EventActions({
  id,
  slug,
  titleRu,
  descriptionRu,
  latitude,
  longitude,
}: {
  id: string;
  slug: string;
  titleRu: string;
  descriptionRu: string;
  latitude: number;
  longitude: number;
}) {
  const favoriteToggle = useFavoriteToggle("EVENT");
  const share = useShare();

  return (
    <div className="grid grid-cols-3 gap-2">
      <Button variant="outline" className="flex-col gap-1 py-3" asChild>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
          target="_blank"
          rel="noreferrer"
        >
          <Navigation2 className="h-4 w-4" />
          <span className="text-xs">Маршрут</span>
        </a>
      </Button>
      <Button
        variant="outline"
        className="flex-col gap-1 py-3"
        onClick={() => share({ title: titleRu, text: descriptionRu.slice(0, 100), path: `/events/${slug}` })}
      >
        <Share2 className="h-4 w-4" />
        <span className="text-xs">Поделиться</span>
      </Button>
      <Button
        variant="outline"
        className="flex-col gap-1 py-3"
        disabled={favoriteToggle.isPending}
        onClick={() => favoriteToggle.mutate(id)}
      >
        {favoriteToggle.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
        <span className="text-xs">Сохранить</span>
      </Button>
    </div>
  );
}
