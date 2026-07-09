import type { Metadata } from "next";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { CityForm } from "@/features/admin/cities/city-form";

export const metadata: Metadata = { title: "Новый город · Админ" };

export default async function NewCityPage() {
  const countries = await prisma.country.findMany({ select: { id: true, nameRu: true } });

  return (
    <div>
      <AdminPageHeader title="Новый город" />
      <CityForm countries={countries} />
    </div>
  );
}
