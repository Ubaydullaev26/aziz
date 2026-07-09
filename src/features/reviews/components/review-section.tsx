"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, initials, formatDateTime } from "@/lib/utils";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  user: { name: string | null; image: string | null };
};

export function ReviewSection({
  targetType,
  targetId,
  reviews,
  queryKeyToInvalidate,
}: {
  targetType: "PLACE" | "EVENT" | "GUIDE";
  targetId: string;
  reviews: ReviewItem[];
  queryKeyToInvalidate: unknown[];
}) {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [comment, setComment] = React.useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const key =
        targetType === "PLACE" ? "placeId" : targetType === "EVENT" ? "eventId" : "guideId";
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: targetId, rating, comment: comment || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Не удалось отправить отзыв");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("Спасибо за отзыв!");
      setComment("");
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      {status === "authenticated" && (
        <div className="space-y-3 rounded-2xl border border-border p-4">
          <p className="text-sm font-medium">Оставить отзыв</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(n)}
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    (hoverRating || rating) >= n
                      ? "fill-sunset text-sunset"
                      : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Расскажите о своих впечатлениях…"
            rows={3}
          />
          <Button
            size="sm"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Отправить отзыв
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">Пока нет отзывов — будьте первым!</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="flex gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={review.user.image ?? undefined} />
              <AvatarFallback>{initials(review.user.name ?? "?")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{review.user.name ?? "Гость"}</p>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(review.createdAt)}
                </span>
              </div>
              <div className="mt-0.5 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={cn(
                      "h-3 w-3",
                      review.rating >= n ? "fill-sunset text-sunset" : "text-muted-foreground/40",
                    )}
                  />
                ))}
              </div>
              {review.comment && <p className="mt-1.5 text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
