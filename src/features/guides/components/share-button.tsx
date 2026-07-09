"use client";

import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useShare } from "@/lib/use-share";

export function ShareButton({ name, slug }: { name: string; slug: string }) {
  const share = useShare();
  return (
    <Button variant="outline" onClick={() => share({ title: name, path: `/guides/${slug}` })}>
      <Share2 className="h-4 w-4" /> Поделиться
    </Button>
  );
}
