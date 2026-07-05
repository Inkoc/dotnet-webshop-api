import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Column } from "@/components/admin/data-table";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { ordersApi } from "@/lib/api/orders";
import { toastApiError } from "@/lib/errors";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUSES, type Order } from "@/lib/types";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders, isPending } = useQuery({
    queryKey: ["orders", "all"],
    queryFn: ordersApi.getAll,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      ordersApi.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order status updated");
    },
    onError: toastApiError,
  });

  const columns: Column<Order>[] = [
    { header: "Order", cell: (order) => <span className="font-medium">#{order.id}</span> },
    { header: "Date", cell: (order) => formatDate(order.createdAt) },
    { header: "User", cell: (order) => order.userId, hideOnMobile: true },
    {
      header: "Items",
      cell: (order) => order.items.reduce((sum, item) => sum + item.quantity, 0),
      hideOnMobile: true,
    },
    { header: "Total", cell: (order) => formatPrice(order.totalAmount), className: "text-right" },
    { header: "Status", cell: (order) => <OrderStatusBadge status={order.status} /> },
    {
      header: "Change status",
      className: "w-40",
      cell: (order) => (
        <Select
          value={order.status}
          onValueChange={(status) => statusMutation.mutate({ id: order.id, status })}
          disabled={statusMutation.isPending}
        >
          <SelectTrigger size="sm" aria-label={`Change status of order ${order.id}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
      <DataTable
        columns={columns}
        rows={orders}
        loading={isPending}
        getKey={(order) => order.id}
        emptyMessage="No orders yet."
      />
    </div>
  );
}
