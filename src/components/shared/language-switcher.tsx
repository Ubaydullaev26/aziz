"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALES: { code: string; label: string }[] = [
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
  { code: "uz", label: "O'zbekcha" },
];

export function LanguageSwitcher() {
  const router = useRouter();

  function setLocale(code: string) {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Сменить язык">
          <Languages className="h-[18px] w-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => setLocale(l.code)}>
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
