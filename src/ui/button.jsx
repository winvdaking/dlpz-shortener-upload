import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "bg-background/20 backdrop-blur-lg border border-white/20 text-foreground hover:bg-background/40 hover:border-white/40 hover:shadow-lg hover:shadow-black/10 hover:scale-105 active:scale-95",
        glassPrimary:
          "bg-primary/20 backdrop-blur-lg border border-primary/30 text-primary-foreground hover:bg-primary/40 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95",
        glassSecondary:
          "bg-secondary/20 backdrop-blur-lg border border-secondary/30 text-secondary-foreground hover:bg-secondary/40 hover:border-secondary/60 hover:shadow-lg hover:shadow-secondary/20 hover:scale-105 active:scale-95",
        glassMuted:
          "bg-muted/20 backdrop-blur-lg border border-muted/30 text-muted-foreground hover:bg-muted/40 hover:border-muted/60 hover:shadow-lg hover:shadow-muted/20 hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? "div" : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
