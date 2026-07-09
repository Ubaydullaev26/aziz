"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { BookingDialog, type BookingOption } from "@/features/booking/components/booking-dialog";
import { formatDateTime } from "@/lib/utils";

export function GuideBookButton({
  guideName,
  pricePerHour,
  currency,
  availabilities,
}: {
  guideName: string;
  pricePerHour: number | null;
  currency: string;
  availabilities: { id: string; startAt: string | Date; endAt: string | Date; capacity: number; bookedCount: number }[];
}) {
  const [open, setOpen] = React.useState(false);

  const options: BookingOption[] = availabilities.map((a) => ({
    id: a.id,
    title: formatDateTime(a.startAt),
    subtitle: `до ${formatDateTime(a.endAt)}`,
    remaining: a.capacity - a.bookedCount,
    priceEach: pricePerHour ?? 0,
    currency,
  }));

  return (
    <>
      <Button className="w-full" disabled={availabilities.length === 0} onClick={() => setOpen(true)}>
        Забронировать
      </Button>
      <BookingDialog
        open={open}
        onOpenChange={setOpen}
        type="GUIDE"
        title={`Бронирование гида: ${guideName}`}
        options={options}
      />
    </>
  );
}
