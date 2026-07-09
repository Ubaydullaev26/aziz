"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, Landmark, CalendarDays, Users, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type SearchResults = {
  cities: { id: string; slug: string; nameRu: string; coverImage: string | null }[];
  places: {
    id: string;
    slug: string;
    nameRu: string;
    coverImage: string;
    category: { nameRu: string };
    city: { slug: string };
  }[];
  events: {
    id: string;
    slug: string;
    titleRu: string;
    coverImage: string;
    startAt: string;
    category: { nameRu: string };
  }[];
  guides: { id: string; slug: string; name: string; avatar: string; languages: string[] }[];
};

export function SearchPageContent() {
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useQuery<SearchResults>({
    queryKey: ["search-page", debounced],
    enabled: debounced.length >= 2,
    queryFn: async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(debounced)}`);
      if (!res.ok) throw new Error("Ошибка поиска");
      return res.json();
    },
  });

  const hasResults =
    data && (data.cities.length || data.places.length || data.events.length || data.guides.length);

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto px-4 py-8 sm:px-6">
      <h1 className="mb-6 font-display text-2xl font-semibold sm:text-3xl">Поиск</h1>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Город, достопримечательность, событие, гид, ресторан…"
          className="h-12 pl-11 text-base"
        />
      </div>

      <div className="mt-8 space-y-8">
        {debounced.length < 2 && (
          <p className="text-sm text-muted-foreground">Введите минимум 2 символа, чтобы начать поиск.</p>
        )}

        {isFetching && (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {!isFetching && debounced.length >= 2 && !hasResults && (
          <p className="text-sm text-muted-foreground">Ничего не найдено по запросу «{debounced}»</p>
        )}

        {data && data.cities.length > 0 && (
          <ResultGroup title="Города" icon={MapPin}>
            {data.cities.map((c) => (
              <ResultRow
                key={c.id}
                href={`/map?city=${c.slug}`}
                image={c.coverImage}
                title={c.nameRu}
                subtitle="Город"
              />
            ))}
          </ResultGroup>
        )}

        {data && data.places.length > 0 && (
          <ResultGroup title="Места" icon={Landmark}>
            {data.places.map((p) => (
              <ResultRow
                key={p.id}
                href={`/places/${p.slug}`}
                image={p.coverImage}
                title={p.nameRu}
                subtitle={p.category.nameRu}
              />
            ))}
          </ResultGroup>
        )}

        {data && data.events.length > 0 && (
          <ResultGroup title="События" icon={CalendarDays}>
            {data.events.map((e) => (
              <ResultRow
                key={e.id}
                href={`/events/${e.slug}`}
                image={e.coverImage}
                title={e.titleRu}
                subtitle={e.category.nameRu}
              />
            ))}
          </ResultGroup>
        )}

        {data && data.guides.length > 0 && (
          <ResultGroup title="Гиды" icon={Users}>
            {data.guides.map((g) => (
              <ResultRow
                key={g.id}
                href={`/guides/${g.slug}`}
                image={g.avatar}
                title={g.name}
                subtitle={g.languages.join(", ").toUpperCase()}
                round
              />
            ))}
          </ResultGroup>
        )}
      </div>
    </div>
  );
}

function ResultGroup({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
        <Icon className="h-4 w-4" /> {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ResultRow({
  href,
  image,
  title,
  subtitle,
  round,
}: {
  href: string;
  image: string | null;
  title: string;
  subtitle: string;
  round?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border p-3 transition-colors hover:bg-secondary"
    >
      <div className={`relative h-12 w-12 shrink-0 overflow-hidden bg-secondary ${round ? "rounded-full" : "rounded-xl"}`}>
        {image && <Image src={image} alt="" fill className="object-cover" />}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  );
}
