import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { CategoryForm } from "@/features/admin/categories/category-form";

export const metadata: Metadata = { title: "Редактировать категорию · Админ" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader title={`Редактировать: ${category.nameRu}`} />
      <CategoryForm categoryId={category.id} defaultValues={category} />
    </div>
  );
}
