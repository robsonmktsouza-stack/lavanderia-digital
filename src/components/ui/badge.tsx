import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", { variants: { variant: { default: "bg-blue-50 text-[var(--brand)]", secondary: "bg-slate-100 text-slate-700", success: "bg-emerald-50 text-emerald-700", warning: "bg-amber-50 text-amber-700", danger: "bg-red-50 text-red-700" } }, defaultVariants: { variant: "default" } });
export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) { return <span className={cn(badgeVariants({ variant }), className)} {...props} />; }
