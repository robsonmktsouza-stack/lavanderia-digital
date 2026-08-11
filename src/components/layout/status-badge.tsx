import { Badge } from "@/components/ui/badge";
import { orderStatusLabel } from "@/lib/order-status";
export function StatusBadge({ status }: { status: string }) {
  const variant = status === "DELIVERED" ? "success" : status === "CANCELED" ? "danger" : ["AWAITING_PAYMENT","IN_ANALYSIS"].includes(status) ? "warning" : "default";
  return <Badge variant={variant as any}>{orderStatusLabel[status] ?? status}</Badge>;
}
