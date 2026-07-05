import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { ordersApi } from "@/lib/api/orders";
import { formatDate, formatPrice } from "@/lib/format";

export function OrdersPage() {
  const { data: orders, isPending } = useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.getMine,
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <ReceiptText className="size-10 text-muted-foreground" />
        <p className="font-medium">No orders yet</p>
        <Button asChild>
          <Link to="/">Browse the catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Orders</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)} · {order.items.length} item
                    {order.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
