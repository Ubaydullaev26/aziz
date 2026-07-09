"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sun, Moon, Monitor } from "lucide-react";

import { updatePreferences } from "@/features/account/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "dark", label: "Тёмная", icon: Moon },
  { value: "system", label: "Системная", icon: Monitor },
];

const LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
  { value: "uz", label: "O'zbekcha" },
];

export function PreferencesForm({ initialLocale }: { initialLocale: string }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [locale, setLocale] = React.useState(initialLocale);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  async function handleTheme(value: string) {
    setTheme(value);
    await updatePreferences({ themePreference: value });
  }

  async function handleLocale(value: string) {
    setLocale(value);
    document.cookie = `NEXT_LOCALE=${value}; path=/; max-age=31536000`;
    await updatePreferences({ locale: value });
    toast.success("Язык обновлён");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 text-sm font-semibold">Тема оформления</h2>
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <Button
              key={t.value}
              type="button"
              variant="outline"
              className={cn(mounted && theme === t.value && "border-primary bg-primary/5 text-primary")}
              onClick={() => handleTheme(t.value)}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Язык интерфейса</h2>
        <div className="flex gap-2">
          {LOCALES.map((l) => (
            <Button
              key={l.value}
              type="button"
              variant="outline"
              className={cn(locale === l.value && "border-primary bg-primary/5 text-primary")}
              onClick={() => handleLocale(l.value)}
            >
              {l.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
