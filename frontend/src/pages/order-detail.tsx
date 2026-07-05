import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { ordersApi } from "@/lib/api/orders";
import { formatDate, formatPrice } from "@/lib/format";

export function OrderDetailPage() {
  const params = useParams();
  const orderId = Number(params.id);

  const { data: order, isPending } = useQuery({
    queryKey: ["orders", orderId],
    queryFn: () => ordersApi.getById(orderId),
    enabled: Number.isFinite(orderId),
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center">
        <p className="font-medium">Order not found.</p>
        <Button variant="link" asChild>
          <Link to="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/orders">
          <ArrowLeft className="size-4" />
          My Orders
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle>Order #{order.id}</CardTitle>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <Link to={`/products/${item.productId}`} className="font-medium hover:underline">
                  {item.productName}
                </Link>
                <p className="text-muted-foreground">
                  {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <span className="font-medium">{formatPrice(item.lineTotal)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold">{formatPrice(order.totalAmount)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
