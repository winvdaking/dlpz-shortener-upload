import { cn } from "../lib/utils";

const buttonVariants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline:
    "glass-button text-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/30 focus:ring-offset-2",
  ghost:
    "text-foreground hover:bg-white/10 dark:hover:bg-black/10 font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-500/30 focus:ring-offset-2",
};

export function Button({
  variant = "primary",
  size = "default",
  className,
  children,
  disabled = false,
  loading = false,
  ...props
}) {
  const sizeClasses = {
    sm: "py-2 px-4 text-sm",
    default: "py-3 px-6",
    lg: "py-4 px-8 text-lg",
  };

  return (
    <button
      className={cn(
        buttonVariants[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Chargement...
        </div>
      ) : (
        children
      )}
    </button>
  );
}
