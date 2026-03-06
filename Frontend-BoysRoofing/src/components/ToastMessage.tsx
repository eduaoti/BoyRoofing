"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error";

type Props = {
  type: ToastType;
  message: string;
  onDismiss: () => void;
  autoHideMs?: number;
};

export function ToastMessage({ type, message, onDismiss, autoHideMs = 5000 }: Props) {
  useEffect(() => {
    if (autoHideMs <= 0) return;
    const t = setTimeout(onDismiss, autoHideMs);
    return () => clearTimeout(t);
  }, [autoHideMs, onDismiss]);

  const isSuccess = type === "success";
  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border px-4 py-3 shadow-lg bg-br-smoke border-br-smoke-light"
      style={{
        backgroundColor: isSuccess ? "rgba(22, 26, 29, 0.98)" : "rgba(26, 26, 26, 0.98)",
        borderColor: isSuccess ? "rgba(186, 24, 27, 0.6)" : "rgba(220, 38, 38, 0.5)",
      }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: isSuccess ? "#22c55e" : "#ef4444" }}
      />
      <p className="flex-1 text-sm font-medium text-br-pearl">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-1 text-br-white/60 hover:bg-br-white/10 hover:text-br-pearl transition"
        aria-label="Cerrar"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
