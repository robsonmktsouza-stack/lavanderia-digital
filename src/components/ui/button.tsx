import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-50",
  { variants: {
      variant: {
        default: "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]",
        secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-slate-200",
        outline: "border bg-white hover:bg-slate-50",
        ghost: "hover:bg-slate-100",
        destructive: "bg-red-600 text-white hover:bg-red-700"
      },
      size: { default: "h-10 px-4", sm: "h-8 px-3 text-xs", lg: "h-11 px-5", icon: "h-9 w-9" }
    }, defaultVariants: { variant: "default", size: "default" } }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
export { buttonVariants };
