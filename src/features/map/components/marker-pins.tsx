"use client";

import Image from "next/image";

import { getCategoryIcon } from "@/features/map/category-icons";
import { cn } from "@/lib/utils";

export function PlacePin({
  color,
  icon,
  featured,
  active,
}: {
  color: string;
  icon: string;
  featured?: boolean;
  active?: boolean;
}) {
  const Icon = getCategoryIcon(icon);
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform",
        featured ? "h-10 w-10" : "h-8 w-8",
        active && "scale-125 ring-4 ring-white/60",
      )}
      style={{ backgroundColor: color }}
    >
      <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
    </div>
  );
}

export function EventPin({
  color,
  icon,
  isLiveNow,
  active,
}: {
  color: string;
  icon: string;
  isLiveNow: boolean;
  active?: boolean;
}) {
  const Icon = getCategoryIcon(icon);
  return (
    <div className={cn("relative", active && "scale-125")}>
      {isLiveNow && (
        <span
          className="absolute inset-0 animate-pulse-live rounded-full"
          style={{ backgroundColor: color, opacity: 0.5 }}
        />
      )}
      <div
        className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-lg"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
      </div>
      {isLiveNow && (
        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 rounded-full border-2 border-white bg-sunset" />
      )}
    </div>
  );
}

export function GuidePin({ avatar, active }: { avatar: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "relative h-9 w-9 overflow-hidden rounded-full border-2 border-primary shadow-lg transition-transform",
        active && "scale-125",
      )}
    >
      <Image src={avatar} alt="" fill className="object-cover" sizes="36px" />
    </div>
  );
}

export function UserLocationDot() {
  return (
    <div className="relative flex h-5 w-5 items-center justify-center">
      <span className="absolute h-5 w-5 animate-pulse-live rounded-full bg-primary/40" />
      <span className="relative h-3 w-3 rounded-full border-2 border-white bg-primary shadow" />
    </div>
  );
}
