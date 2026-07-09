"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { tourSchema, type TourFormValues } from "@/features/admin/tours/schema";
import { createTour, updateTour } from "@/features/admin/tours/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function TourForm({
  places,
  guides,
  defaultValues,
  tourId,
}: {
  places: { id: string; nameRu: string }[];
  guides: { id: string; name: string }[];
  defaultValues?: Partial<TourFormValues>;
  tourId?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      slug: "",
      placeId: "",
      guideId: "",
      titleRu: "",
      titleEn: "",
      titleUz: "",
      descriptionRu: "",
      descriptionEn: "",
      descriptionUz: "",
      coverImage: "",
      durationMinutes: 90,
      price: 0,
      currency: "UZS",
      maxGroupSize: 10,
      isPublished: true,
      ...defaultValues,
    },
  });

  async function onSubmit(values: TourFormValues) {
    setIsPending(true);
    const result = tourId ? await updateTour(tourId, values) : await createTour(values);
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
                  <Input placeholder="registan-tour" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Обложка (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="/api/placeholder/tour" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="placeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Место</FormLabel>
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Без привязки</SelectItem>
                    {places.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nameRu}
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
            name="guideId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Гид</FormLabel>
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Без привязки</SelectItem>
                    {guides.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
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
          {(["Ru", "En", "Uz"] as const).map((suffix) => (
            <TabsContent key={suffix} value={suffix.toLowerCase()} className="space-y-4">
              <FormField
                control={form.control}
                name={`title${suffix}` as "titleRu"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название ({suffix.toUpperCase()})</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`description${suffix}` as "descriptionRu"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание ({suffix.toUpperCase()})</FormLabel>
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

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Длительность (мин)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Цена</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Валюта</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="maxGroupSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Максимум человек в группе</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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
              <Label>Опубликована</Label>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {tourId ? "Сохранить изменения" : "Создать экскурсию"}
        </Button>
      </form>
    </Form>
  );
}
