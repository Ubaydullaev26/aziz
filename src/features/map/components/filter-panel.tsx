"use client";

import * as React from "react";
import { SlidersHorizontal, Users, Compass, X } from "lucide-react";

import { useCategories } from "@/features/map/hooks/use-map-data";
import { useMapStore } from "@/features/map/store";
import { getCategoryIcon } from "@/features/map/category-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FilterContent() {
  const { data } = useCategories();
  const categories = data?.categories ?? [];
  const { activeCategories, toggleCategory, setAllCategories, showGuides, toggleGuides, toursOnly, toggleToursOnly, initCategories } =
    useMapStore();

  React.useEffect(() => {
    if (categories.length) initCategories(categories.map((c) => c.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.length]);

  const allActive = activeCategories.length === categories.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Слои карты</h3>
        <button
          className="text-xs font-medium text-primary hover:underline"
          onClick={() => setAllCategories(categories.map((c) => c.key), !allActive)}
        >
          {allActive ? "Скрыть всё" : "Показать всё"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={toggleGuides}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            showGuides
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-secondary",
          )}
        >
          <Users className="h-3.5 w-3.5" /> Гиды
        </button>
        <button
          onClick={toggleToursOnly}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            toursOnly
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-secondary",
          )}
        >
          <Compass className="h-3.5 w-3.5" /> Только с экскурсиями
        </button>
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-1.5">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const active = activeCategories.includes(cat.key);
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.key)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-all",
                active
                  ? "border-transparent shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary",
              )}
              style={active ? { backgroundColor: `${cat.color}1A`, color: cat.color, borderColor: `${cat.color}55` } : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="leading-tight">{cat.nameRu}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FilterPanel() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Desktop floating panel */}
      <div className="glass-panel absolute left-4 top-4 z-10 hidden max-h-[calc(100%-2rem)] w-72 overflow-y-auto rounded-2xl p-5 shadow-xl lg:block">
        <FilterContent />
      </div>

      {/* Mobile trigger + sheet */}
      <div className="absolute left-4 top-4 z-10 lg:hidden">
        <Button variant="glass" size="icon" onClick={() => setOpen(true)} aria-label="Фильтры">
          <SlidersHorizontal className="h-4.5 w-4.5" />
        </Button>
      </div>
      {open && (
        <div className="absolute inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="glass-panel absolute inset-x-0 bottom-0 max-h-[75%] overflow-y-auto rounded-t-3xl p-5 pb-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="mx-auto h-1.5 w-10 rounded-full bg-border" />
              <button
                onClick={() => setOpen(false)}
                className="absolute right-5 top-5 rounded-full p-1.5 hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
}
