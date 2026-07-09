"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";

import { eventSchema, type EventFormValues } from "@/features/admin/events/schema";
import { createEvent, updateEvent } from "@/features/admin/events/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export function EventForm({
  cities,
  categories,
  places,
  defaultValues,
  eventId,
}: {
  cities: { id: string; nameRu: string }[];
  categories: { id: string; nameRu: string }[];
  places: { id: string; nameRu: string }[];
  defaultValues?: Partial<EventFormValues>;
  eventId?: string;
}) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      slug: "",
      cityId: cities[0]?.id ?? "",
      categoryId: categories[0]?.id ?? "",
      placeId: "",
      titleRu: "",
      titleEn: "",
      titleUz: "",
      descriptionRu: "",
      descriptionEn: "",
      descriptionUz: "",
      coverImage: "",
      organizer: "",
      address: "",
      latitude: 0,
      longitude: 0,
      startAt: "",
      endAt: "",
      timezone: "Asia/Samarkand",
      isFeatured: false,
      isPublished: true,
      images: [],
      ticketTypes: [{ name: "Стандарт", price: 0, currency: "UZS", totalQuantity: 100 }],
      ...defaultValues,
    },
  });

  const imagesArray = useFieldArray({ control: form.control, name: "images" });
  const ticketsArray = useFieldArray({ control: form.control, name: "ticketTypes" });

  async function onSubmit(values: EventFormValues) {
    setIsPending(true);
    const result = eventId ? await updateEvent(eventId, values) : await createEvent(values);
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
                  <Input placeholder="summer-festival" {...field} />
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
                  <Input placeholder="/api/placeholder/summer-festival" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
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
          <FormField
            control={form.control}
            name="placeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Место проведения</FormLabel>
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
                      <Textarea rows={4} {...field} />
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
            name="organizer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Организатор</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Начало</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Окончание</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
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
                <Input placeholder="/api/placeholder/gallery-1" {...form.register(`images.${index}.url` as const)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => imagesArray.remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>Типы билетов</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => ticketsArray.append({ name: "", price: 0, currency: "UZS", totalQuantity: 50 })}
            >
              <Plus className="h-3.5 w-3.5" /> Добавить
            </Button>
          </div>
          <div className="space-y-2">
            {ticketsArray.fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-[1fr_120px_90px_120px_auto] items-center gap-2">
                <input type="hidden" {...form.register(`ticketTypes.${index}.ticketTypeId` as const)} />
                <Input placeholder="Название" {...form.register(`ticketTypes.${index}.name` as const)} />
                <Input type="number" placeholder="Цена" {...form.register(`ticketTypes.${index}.price` as const)} />
                <Input placeholder="Валюта" {...form.register(`ticketTypes.${index}.currency` as const)} />
                <Input
                  type="number"
                  placeholder="Кол-во"
                  {...form.register(`ticketTypes.${index}.totalQuantity` as const)}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => ticketsArray.remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {form.formState.errors.ticketTypes?.message && (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.ticketTypes.message}</p>
          )}
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
          {eventId ? "Сохранить изменения" : "Создать событие"}
        </Button>
      </form>
    </Form>
  );
}
