import { Badge } from "@/components/ui/badge";

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Shipped: "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  Cancelled: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="secondary" className={statusStyles[status] ?? ""}>
      {status}
    </Badge>
  );
}
