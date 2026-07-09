"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { BookingDialog, type BookingOption } from "@/features/booking/components/booking-dialog";

export function EventTicketButton({
  title,
  ticketTypes,
  disabled,
}: {
  title: string;
  ticketTypes: { id: string; name: string; price: number; currency: string; totalQuantity: number; soldQuantity: number }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  const options: BookingOption[] = ticketTypes.map((t) => ({
    id: t.id,
    title: t.name,
    remaining: t.totalQuantity - t.soldQuantity,
    priceEach: t.price,
    currency: t.currency,
  }));

  return (
    <>
      <Button className="w-full" disabled={disabled} onClick={() => setOpen(true)}>
        Купить билет
      </Button>
      <BookingDialog open={open} onOpenChange={setOpen} type="EVENT" title={title} options={options} />
    </>
  );
}
