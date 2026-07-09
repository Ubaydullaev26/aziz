"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelBooking } from "@/features/booking/actions";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await cancelBooking(bookingId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Бронирование отменено");
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Отменить
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Отменить бронирование?</AlertDialogTitle>
          <AlertDialogDescription>
            Место или билет освободится и снова станет доступен другим пользователям. Это действие
            нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Оставить</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Да, отменить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
