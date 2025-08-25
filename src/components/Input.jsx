import { cn } from "../lib/utils";

export function Input({ className, type = "text", error, ...props }) {
  return (
    <div className="space-y-2">
      <input
        type={type}
        className={cn(
          "glass-input font-poppins",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-2 font-poppins">
          <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full" />
          {error}
        </p>
      )}
    </div>
  );
}
