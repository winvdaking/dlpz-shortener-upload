import { X } from "lucide-react";
import { cn } from "../lib/utils";

export function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <div
        className={cn(
          "bg-gray-900/95 dark:bg-gray-900/95 bg-white/95 backdrop-blur-md border border-gray-700 dark:border-gray-700 border-gray-200 rounded-xl p-6 max-w-md w-full shadow-xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground font-poppins">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white p-2 rounded-xl transition-all duration-300 hover:bg-gray-800/50 dark:hover:bg-gray-800/50 hover:bg-gray-100/50"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
