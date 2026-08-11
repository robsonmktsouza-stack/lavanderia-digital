import * as React from "react";
import { cn } from "@/lib/utils";
export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) { return <input type={type} className={cn("h-10 w-full rounded-[var(--radius)] border bg-white px-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100", className)} {...props} />; }
