"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { categorySchema, type CategoryFormValues } from "@/features/admin/categories/schema";
import { createCategory, updateCategory } from "@/features/admin/categories/actions";
import { CATEGORY_ICONS, getCategoryIcon } from "@/features/map/category-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function CategoryForm({
  defaultValues,
  categoryId,
}: {
  defaultValues?: Partial<CategoryFormValues>;
  categoryId?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      key: "",
      nameRu: "",
      nameEn: "",
      nameUz: "",
      icon: "Compass",
      color: "#0EA5A4",
      isEventCategory: false,
      position: 0,
      ...defaultValues,
    },
  });

  const Icon = getCategoryIcon(form.watch("icon"));

  async function onSubmit(values: CategoryFormValues) {
    setIsPending(true);
    const result = categoryId ? await updateCategory(categoryId, values) : await createCategory(values);
    setIsPending(false);
    if (result?.error) toast.error(result.error);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ключ (используется в фильтрах)</FormLabel>
              <FormControl>
                <Input placeholder="historical" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Tabs defaultValue="ru">
          <TabsList>
            <TabsTrigger value="ru">RU</TabsTrigger>
            <TabsTrigger value="en">EN</TabsTrigger>
            <TabsTrigger value="uz">UZ</TabsTrigger>
          </TabsList>
          {(["ru", "en", "uz"] as const).map((locale) => (
            <TabsContent key={locale} value={locale}>
              <FormField
                control={form.control}
                name={`name${locale === "ru" ? "Ru" : locale === "en" ? "En" : "Uz"}` as "nameRu"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название ({locale.toUpperCase()})</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Иконка</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(CATEGORY_ICONS).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Цвет</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input type="color" className="h-10 w-14 p-1" {...field} />
                  </FormControl>
                  <Input value={field.value} onChange={field.onChange} className="flex-1" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Порядок сортировки</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isEventCategory"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <Label>Категория событий</Label>
                <p className="text-xs text-muted-foreground">Концерты, фестивали и т.п. — применяется к Event, не к Place</p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {categoryId ? "Сохранить изменения" : "Создать категорию"}
        </Button>
      </form>
    </Form>
  );
}
