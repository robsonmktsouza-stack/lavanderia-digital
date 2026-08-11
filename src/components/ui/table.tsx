import * as React from "react";
import { cn } from "@/lib/utils";
export const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => <div className="w-full overflow-auto"><table className={cn("w-full text-sm", className)} {...props} /></div>;
export const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn("border-b", className)} {...props} />;
export const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={cn("divide-y", className)} {...props} />;
export const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn("transition-colors hover:bg-slate-50", className)} {...props} />;
export const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className={cn("h-10 px-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500", className)} {...props} />;
export const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
