"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

import { placeSchema, type PlaceFormValues, PRICE_LEVELS, DAY_LABELS } from "@/features/admin/places/schema";
import { createPlace, updatePlace } from "@/features/admin/places/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const DEFAULT_HOURS = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  opensAt: "09:00",
  closesAt: "18:00",
  isClosed: false,
}));

export function PlaceForm({
  cities,
  categories,
  defaultValues,
  placeId,
}: {
  cities: { id: string; nameRu: string }[];
  categories: { id: string; nameRu: string }[];
  defaultValues?: Partial<PlaceFormValues>;
  placeId?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      slug: "",
      cityId: cities[0]?.id ?? "",
      categoryId: categories[0]?.id ?? "",
      nameRu: "",
      nameEn: "",
      nameUz: "",
      shortDescriptionRu: "",
      shortDescriptionEn: "",
      shortDescriptionUz: "",
      descriptionRu: "",
      descriptionEn: "",
      descriptionUz: "",
      historyRu: "",
      historyEn: "",
      historyUz: "",
      address: "",
      latitude: 0,
      longitude: 0,
      priceLevel: "FREE",
      priceFrom: undefined,
      currency: "UZS",
      phone: "",
      website: "",
      coverImage: "",
      isFeatured: false,
      isPublished: true,
      images: [],
      hours: DEFAULT_HOURS,
      ...defaultValues,
    },
  });

  const imagesArray = useFieldArray({ control: form.control, name: "images" });

  async function onSubmit(values: PlaceFormValues) {
    setIsPending(true);
    const result = placeId ? await updatePlace(placeId, values) : await createPlace(values);
    setIsPending(false);
    if (result?.error) toast.error(result.error);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="registan" {...field} />
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
                  <Input placeholder="/api/placeholder/registan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cityId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Город</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities.map((c) => (
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
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Категория</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
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
          {(["Ru", "En", "Uz"] as const).map((suffix) => (
            <TabsContent key={suffix} value={suffix.toLowerCase()} className="space-y-4">
              <FormField
                control={form.control}
                name={`name${suffix}` as "nameRu"}
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
                name={`shortDescription${suffix}` as "shortDescriptionRu"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Краткое описание ({suffix.toUpperCase()})</FormLabel>
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
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`history${suffix}` as "historyRu"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>История ({suffix.toUpperCase()})</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Адрес</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="priceLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Уровень цены</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PRICE_LEVELS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
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
            name="priceFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Цена от</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ""} />
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Телефон</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Сайт</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Галерея (URL изображений)</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => imagesArray.append({ url: "" })}>
              <Plus className="h-3.5 w-3.5" /> Добавить
            </Button>
          </div>
          <div className="space-y-2">
            {imagesArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  placeholder="/api/placeholder/gallery-1"
                  {...form.register(`images.${index}.url` as const)}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => imagesArray.remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Часы работы</Label>
          <div className="space-y-2 rounded-xl border border-border p-3">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <Input type="time" className="w-28" {...form.register(`hours.${i}.opensAt` as const)} />
                <Input type="time" className="w-28" {...form.register(`hours.${i}.closesAt` as const)} />
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Checkbox
                    checked={form.watch(`hours.${i}.isClosed`)}
                    onCheckedChange={(v) => form.setValue(`hours.${i}.isClosed`, !!v)}
                  />
                  Выходной
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label>Рекомендуемое</Label>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-xl border border-border p-3">
                <Label>Опубликовано</Label>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {placeId ? "Сохранить изменения" : "Создать место"}
        </Button>
      </form>
    </Form>
  );
}
