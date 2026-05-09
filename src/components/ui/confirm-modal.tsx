"use client";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Bold heading shown at the top */
  title: string;
  /** Explanatory sentence below the title */
  description: string;
  /** Label for the confirm action button (default: "Confirm") */
  confirmLabel?: string;
  /** Label for the cancel button (default: "Cancel") */
  cancelLabel?: string;
  /**
   * When true the confirm button is styled red and a warning icon is shown.
   * Use for irreversible / destructive actions (delete, ban, etc.).
   */
  destructive?: boolean;
  /** Shows a spinner and disables both buttons while an async action is running */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] px-4"
      onClick={(e) => {
        // Close on backdrop click (only when not loading)
        if (!loading && e.target === e.currentTarget) onCancel();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="bg-foreground border border-accent rounded-[22px] shadow-lg px-8 py-7 w-full max-w-sm"
      >
        <div className="flex flex-col items-center text-center gap-1">
          {/* Warning icon — only for destructive actions */}
          {destructive && (
            <div className="mb-2 p-3 rounded-full bg-error/10">
              <AlertTriangle size={22} className="text-error" />
            </div>
          )}

          <h3 className="text-primary font-bold text-base">{title}</h3>

          <p className="text-secondary text-sm mt-1 mb-5 max-w-xs leading-relaxed">
            {description}
          </p>

          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>

            <Button
              className={
                destructive
                  ? "flex-1 bg-error hover:bg-error/90 text-white"
                  : "flex-1"
              }
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Please wait…
                </span>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
