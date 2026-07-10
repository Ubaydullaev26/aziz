"use client";

import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface CityOption {
  slug: string;
  nameRu: string;
}

export function CitySwitcher({
  cities,
  activeCitySlug,
}: {
  cities: CityOption[];
  activeCitySlug: string;
}) {
  const router = useRouter();

  if (cities.length < 2) return null;

  return (
    <div className="glass-panel absolute right-4 top-4 z-10 rounded-2xl shadow-xl">
      <Select value={activeCitySlug} onValueChange={(slug) => router.push(`/map?city=${slug}`)}>
        <SelectTrigger className="w-40 border-none bg-transparent">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.slug} value={city.slug}>
              {city.nameRu}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
