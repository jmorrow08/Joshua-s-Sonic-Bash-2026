"use client";

import { CheckCircle2, XCircle, X } from "lucide-react";
import { useEffect } from "react";

export type ToastVariant = "success" | "error";

type ToastProps = {
  open: boolean;
  variant?: ToastVariant;
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number;
};

export default function Toast({
  open,
  variant = "success",
  title,
  message,
  onClose,
  duration = 5000,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [open, duration, onClose]);

  if (!open) return null;

  const isSuccess = variant === "success";
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md animate-slide-up items-start gap-3 rounded-2xl border border-white/10 bg-sonic-blue p-4 shadow-2xl sm:bottom-6"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          isSuccess ? "bg-sonic-gold/20 text-sonic-gold" : "bg-sonic-red/20 text-sonic-red"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-bold text-white">{title}</p>
        {message && <p className="mt-0.5 text-sm text-white/80">{message}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="-m-1 rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
