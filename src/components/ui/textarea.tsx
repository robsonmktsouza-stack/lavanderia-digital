import * as React from "react";
import { cn } from "@/lib/utils";
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className={cn("min-h-24 w-full rounded-[var(--radius)] border bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-blue-100", className)} {...props} />; }
