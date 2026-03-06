"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  danger?: boolean;
};

export function ConfirmModal({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  loading = false,
  danger = true,
}: Props) {
  if (!open) return null;

  async function handleConfirm() {
    await onConfirm();
    onClose();
  }

  function handleClose() {
    if (!loading) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-modal-fade"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-br-smoke/95 backdrop-blur-xl p-6 shadow-2xl animate-modal-zoom"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-br-pearl">{title}</h2>
        <p className="mt-2 text-sm text-br-white/70">{message}</p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={
              danger
                ? "rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 transition"
                : "admin-btn-primary rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-60"
            }
          >
            {loading ? "…" : confirmLabel}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="admin-btn-secondary rounded-xl px-4 py-2.5 text-sm"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
