"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateBookingStatus } from "@/features/admin/bookings/actions";
import type { BookingStatus } from "@prisma/client";

const STATUSES: { value: BookingStatus; label: string }[] = [
  { value: "PENDING", label: "Ожидает" },
  { value: "CONFIRMED", label: "Подтверждено" },
  { value: "CANCELLED", label: "Отменено" },
  { value: "COMPLETED", label: "Завершено" },
];

export function StatusSelect({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, value);
      if (result.error) toast.error(result.error);
      else toast.success("Статус обновлён");
    });
  }

  return (
    <Select defaultValue={status} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
