"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { updateProfile } from "@/features/account/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { initials } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(80),
  image: z.string().min(1, "Введите ссылку или путь к изображению").optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

export function ProfileForm({
  user,
}: {
  user: { name: string | null; email: string; image: string | null };
}) {
  const [isPending, setIsPending] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name ?? "", image: user.image ?? "" },
  });

  const preview = form.watch("image");

  async function onSubmit(values: FormValues) {
    setIsPending(true);
    const result = await updateProfile(values);
    setIsPending(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Профиль обновлён");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={preview || undefined} />
            <AvatarFallback className="text-lg">{initials(user.name ?? "U")}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ссылка на аватар</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} />
              </FormControl>
              <FormDescription>Вставьте ссылку на изображение — оно появится выше.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Сохранить изменения
        </Button>
      </form>
    </Form>
  );
}
