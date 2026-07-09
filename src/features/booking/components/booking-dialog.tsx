"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import { Minus, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatPrice } from "@/lib/utils";

export type BookingOption = {
  id: string;
  title: string;
  subtitle?: string;
  remaining: number;
  priceEach: number;
  currency: string;
};

const FIELD_BY_TYPE = {
  TOUR: "tourAvailabilityId",
  EVENT: "eventTicketTypeId",
  GUIDE: "guideAvailabilityId",
} as const;

export function BookingDialog({
  open,
  onOpenChange,
  type,
  title,
  options,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "TOUR" | "EVENT" | "GUIDE";
  title: string;
  options: BookingOption[];
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [optionId, setOptionId] = React.useState(options[0]?.id ?? "");
  const [quantity, setQuantity] = React.useState(1);
  const [contactName, setContactName] = React.useState(session?.user?.name ?? "");
  const [contactPhone, setContactPhone] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setOptionId(options[0]?.id ?? "");
      setQuantity(1);
      setSuccess(false);
      setContactName(session?.user?.name ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selected = options.find((o) => o.id === optionId);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Выберите вариант");
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          [FIELD_BY_TYPE[type]]: selected.id,
          quantity,
          contactName,
          contactPhone,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Не удалось создать бронирование");
      return body;
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success("Бронирование подтверждено");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const total = selected ? selected.priceEach * quantity : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {success ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <h3 className="font-display text-lg font-semibold">Готово!</h3>
            <p className="text-sm text-muted-foreground">
              Бронирование подтверждено. Детали доступны в разделе «Мои бронирования».
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Закрыть
              </Button>
              <Button onClick={() => router.push("/account/bookings")}>Мои бронирования</Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>Выберите вариант и укажите контактные данные</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setOptionId(opt.id)}
                    disabled={opt.remaining <= 0}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      optionId === opt.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary",
                    )}
                  >
                    <div>
                      <p className="font-medium">{opt.title}</p>
                      {opt.subtitle && <p className="text-xs text-muted-foreground">{opt.subtitle}</p>}
                      <p className="text-xs text-muted-foreground">Осталось: {opt.remaining}</p>
                    </div>
                    <span className="font-semibold">{formatPrice(opt.priceEach, opt.currency)}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Label>Количество</Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-6 text-center font-medium">{quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setQuantity((q) => Math.min(selected?.remaining ?? 20, q + 1))
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Имя</Label>
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Телефон</Label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Итого: <span className="font-semibold text-foreground">{formatPrice(total, selected?.currency)}</span>
              </p>
              <Button
                disabled={!selected || !contactName || !contactPhone || mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Подтвердить бронирование
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
