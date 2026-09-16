import React from "react";
import { create } from "zustand";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  durationMs?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = "toast_" + Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    const duration = toast.durationMs ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().addToast({ type: "success", title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().addToast({ type: "error", title, description }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().addToast({ type: "warning", title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().addToast({ type: "info", title, description }),
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((item) => {
        const config = {
          success: {
            icon: CheckCircle2,
            iconClass: "text-emerald-600 dark:text-emerald-400",
            borderClass: "border-emerald-500/30 bg-card/95",
            glowClass: "bg-emerald-500/10",
          },
          error: {
            icon: AlertCircle,
            iconClass: "text-rose-600 dark:text-rose-400",
            borderClass: "border-rose-500/30 bg-card/95",
            glowClass: "bg-rose-500/10",
          },
          warning: {
            icon: AlertTriangle,
            iconClass: "text-amber-600 dark:text-amber-400",
            borderClass: "border-amber-500/30 bg-card/95",
            glowClass: "bg-amber-500/10",
          },
          info: {
            icon: Info,
            iconClass: "text-blue-600 dark:text-blue-400",
            borderClass: "border-blue-500/30 bg-card/95",
            glowClass: "bg-blue-500/10",
          },
        }[item.type];

        const Icon = config.icon;

        return (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto p-3.5 rounded-xl border shadow-lg backdrop-blur-md flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200",
              config.borderClass
            )}
          >
            <div className={cn("p-1.5 rounded-lg shrink-0", config.glowClass)}>
              <Icon className={cn("h-4 w-4", config.iconClass)} />
            </div>

            <div className="flex-1 min-w-0 pr-1 pt-0.5">
              <p className="text-xs font-semibold text-foreground leading-tight">
                {item.title}
              </p>
              {item.description && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {item.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer shrink-0"
              title="Đóng thông báo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
