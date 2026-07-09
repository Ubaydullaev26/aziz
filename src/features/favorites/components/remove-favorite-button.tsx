"use client";

import { Heart, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFavoriteToggle } from "@/features/favorites/hooks/use-favorite-toggle";

export function RemoveFavoriteButton({ targetType, targetId }: { targetType: "PLACE" | "EVENT"; targetId: string }) {
  const toggle = useFavoriteToggle(targetType);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="shrink-0"
      disabled={toggle.isPending}
      onClick={() => toggle.mutate(targetId)}
      aria-label="Убрать из избранного"
    >
      {toggle.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4 fill-sunset text-sunset" />}
    </Button>
  );
}
