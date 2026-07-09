"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export function useFavoriteToggle(targetType: "PLACE" | "EVENT") {
  const { status } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      if (status !== "authenticated") {
        throw new Error("Войдите, чтобы сохранять избранное");
      }
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
      if (!res.ok) throw new Error("Не удалось обновить избранное");
      return res.json() as Promise<{ favorited: boolean }>;
    },
    onSuccess: (data) => {
      toast.success(data.favorited ? "Добавлено в избранное" : "Удалено из избранного");
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
