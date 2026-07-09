"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { BookingDialog, type BookingOption } from "@/features/booking/components/booking-dialog";
import { formatDateTime } from "@/lib/utils";

export function TourBookButton({
  title,
  price,
  currency,
  availabilities,
}: {
  title: string;
  price: number;
  currency: string;
  availabilities: { id: string; startAt: string | Date; capacity: number; bookedCount: number }[];
}) {
  const [open, setOpen] = React.useState(false);

  if (availabilities.length === 0) {
    return <p className="text-xs text-muted-foreground">Нет доступных дат</p>;
  }

  const options: BookingOption[] = availabilities.map((a) => ({
    id: a.id,
    title: formatDateTime(a.startAt),
    remaining: a.capacity - a.bookedCount,
    priceEach: price,
    currency,
  }));

  return (
    <>
      <Button size="sm" className="w-full" onClick={() => setOpen(true)}>
        Забронировать
      </Button>
      <BookingDialog open={open} onOpenChange={setOpen} type="TOUR" title={title} options={options} />
    </>
  );
}
