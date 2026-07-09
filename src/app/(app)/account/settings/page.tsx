import type { Metadata } from "next";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PreferencesForm } from "@/features/account/components/preferences-form";

export const metadata: Metadata = { title: "Настройки" };

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { locale: true },
  });

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-semibold">Настройки</h1>
      <PreferencesForm initialLocale={user?.locale ?? "ru"} />
    </div>
  );
}
