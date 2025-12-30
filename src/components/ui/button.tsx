import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-pos-sm hover:shadow-pos-glow",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-border bg-transparent hover:bg-secondary hover:text-secondary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-secondary-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        pos: "bg-pos-surface text-foreground hover:bg-pos-surface-hover border border-border/50 shadow-pos-sm min-h-[56px] min-w-[56px] text-base",
        "pos-primary": "bg-primary text-primary-foreground hover:bg-primary/90 shadow-pos-glow min-h-[56px] text-base font-bold",
        "pos-danger": "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive hover:text-destructive-foreground min-h-[56px] text-base",
        "pos-success": "bg-success text-success-foreground hover:bg-success/90 min-h-[56px] text-base font-bold",
        "pos-category": "min-h-[72px] min-w-[100px] flex-col gap-1 rounded-xl text-sm font-medium border-2 border-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-lg": "h-14 w-14",
        pos: "h-14 px-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
