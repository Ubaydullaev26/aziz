"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { citySchema, type CityFormValues } from "@/features/admin/cities/schema";
import { createCity, updateCity } from "@/features/admin/cities/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function CityForm({
  countries,
  defaultValues,
  cityId,
}: {
  countries: { id: string; nameRu: string }[];
  defaultValues?: Partial<CityFormValues>;
  cityId?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<CityFormValues>({
    resolver: zodResolver(citySchema),
    defaultValues: {
      slug: "",
      countryId: countries[0]?.id ?? "",
      nameRu: "",
      nameEn: "",
      nameUz: "",
      descriptionRu: "",
      descriptionEn: "",
      descriptionUz: "",
      coverImage: "",
      latitude: 0,
      longitude: 0,
      defaultZoom: 13,
      timezone: "Asia/Samarkand",
      isPublished: true,
      ...defaultValues,
    },
  });

  async function onSubmit(values: CityFormValues) {
    setIsPending(true);
    const result = cityId ? await updateCity(cityId, values) : await createCity(values);
    setIsPending(false);
    if (result?.error) toast.error(result.error);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="samarkand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="countryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Страна</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nameRu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Tabs defaultValue="ru">
          <TabsList>
            <TabsTrigger value="ru">RU</TabsTrigger>
            <TabsTrigger value="en">EN</TabsTrigger>
            <TabsTrigger value="uz">UZ</TabsTrigger>
          </TabsList>
          {(["ru", "en", "uz"] as const).map((locale) => (
            <TabsContent key={locale} value={locale} className="space-y-4">
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
              <FormField
                control={form.control}
                name={`description${locale === "ru" ? "Ru" : locale === "en" ? "En" : "Uz"}` as "descriptionRu"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание ({locale.toUpperCase()})</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          ))}
        </Tabs>

        <FormField
          control={form.control}
          name="coverImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Обложка (URL)</FormLabel>
              <FormControl>
                <Input placeholder="/api/placeholder/city-slug или https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Широта</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Долгота</FormLabel>
                <FormControl>
                  <Input type="number" step="any" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultZoom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zoom карты</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Часовой пояс</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-xl border border-border p-3">
              <Label>Опубликован</Label>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {cityId ? "Сохранить изменения" : "Создать город"}
        </Button>
      </form>
    </Form>
  );
}
