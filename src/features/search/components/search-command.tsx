"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Landmark, CalendarDays, Users, MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchResults = {
  cities: { id: string; slug: string; nameRu: string }[];
  places: { id: string; slug: string; nameRu: string; category: { nameRu: string } }[];
  events: { id: string; slug: string; titleRu: string; category: { nameRu: string } }[];
  guides: { id: string; slug: string; name: string; languages: string[] }[];
};

export function SearchCommand({ trigger }: { trigger?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const { data, isFetching } = useQuery<SearchResults>({
    queryKey: ["search", debounced],
    enabled: open && debounced.length >= 2,
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debounced)}`);
      if (!res.ok) throw new Error("Ошибка поиска");
      return res.json();
    },
  });

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button
          variant="outline"
          className="w-full max-w-sm justify-start gap-2 text-muted-foreground sm:w-64"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
          Поиск города, места, гида…
          <kbd className="ml-auto hidden rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] sm:inline">
            ⌘K
          </kbd>
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Город, достопримечательность, событие, гид…"
        />
        <CommandList>
          {debounced.length < 2 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Введите минимум 2 символа
            </p>
          )}
          {debounced.length >= 2 && !isFetching && (
            <CommandEmpty>Ничего не найдено</CommandEmpty>
          )}

          {data?.cities && data.cities.length > 0 && (
            <CommandGroup heading="Города">
              {data.cities.map((c) => (
                <CommandItem key={c.id} onSelect={() => go(`/map?city=${c.slug}`)}>
                  <MapPin /> {c.nameRu}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {data?.places && data.places.length > 0 && (
            <CommandGroup heading="Места">
              {data.places.map((p) => (
                <CommandItem key={p.id} onSelect={() => go(`/places/${p.slug}`)}>
                  <Landmark /> {p.nameRu}
                  <span className="ml-auto text-xs text-muted-foreground">{p.category.nameRu}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {data?.events && data.events.length > 0 && (
            <CommandGroup heading="События">
              {data.events.map((e) => (
                <CommandItem key={e.id} onSelect={() => go(`/events/${e.slug}`)}>
                  <CalendarDays /> {e.titleRu}
                  <span className="ml-auto text-xs text-muted-foreground">{e.category.nameRu}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {data?.guides && data.guides.length > 0 && (
            <CommandGroup heading="Гиды">
              {data.guides.map((g) => (
                <CommandItem key={g.id} onSelect={() => go(`/guides/${g.slug}`)}>
                  <Users /> {g.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {g.languages.join(", ").toUpperCase()}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
