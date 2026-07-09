"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, Loader2 } from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CityResult = {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  coverImage: string | null;
  country: { nameRu: string; code: string };
};

export function CitySearch() {
  const router = useRouter();
  const { status } = useSession();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery<{ cities: CityResult[] }>({
    queryKey: ["cities", debounced],
    queryFn: async () => {
      const res = await fetch(`/api/cities?q=${encodeURIComponent(debounced)}`);
      if (!res.ok) throw new Error("Не удалось загрузить города");
      return res.json();
    },
  });

  function goToCity(slug: string) {
    const target = `/map?city=${slug}`;
    router.push(status === "authenticated" ? target : `/sign-up?callbackUrl=${encodeURIComponent(target)}`);
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="glass-panel flex items-center gap-2 rounded-full p-2 pl-5 shadow-lg">
        <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && data?.cities?.[0]) goToCity(data.cities[0].slug);
          }}
          placeholder="Выберите город, например Самарканд"
          className="h-11 flex-1 border-none bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button
          size="lg"
          className="hidden shrink-0 sm:flex"
          onClick={() => (data?.cities?.[0] ? goToCity(data.cities[0].slug) : undefined)}
        >
          Открыть карту
        </Button>
      </div>

      {open && (
        <div className="glass-panel absolute inset-x-0 top-[calc(100%+8px)] z-20 max-h-80 overflow-y-auto rounded-2xl p-2 shadow-xl">
          {isFetching && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Ищем города…
            </div>
          )}
          {!isFetching && data?.cities?.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Город не найден. Мы постоянно добавляем новые направления.
            </p>
          )}
          {!isFetching &&
            data?.cities?.map((city) => (
              <button
                key={city.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToCity(city.slug)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-secondary",
                )}
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {city.coverImage && (
                    <Image src={city.coverImage} alt={city.nameRu} fill className="object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{city.nameRu}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {city.country.nameRu}
                  </p>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
