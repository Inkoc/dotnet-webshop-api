import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { cartApi } from "@/lib/api/cart";
import { ordersApi } from "@/lib/api/orders";
import { toastApiError } from "@/lib/errors";
import { formatPrice } from "@/lib/format";
import type { Cart } from "@/lib/types";

export function CartPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [clearOpen, setClearOpen] = useState(false);

  const { data: cart, isPending } = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.get,
  });

  function setCart(next: Cart) {
    queryClient.setQueryData(["cart"], next);
  }

  const updateItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      cartApi.updateItem(productId, { quantity }),
    onSuccess: setCart,
    onError: toastApiError,
  });

  const removeItem = useMutation({
    mutationFn: (productId: number) => cartApi.removeItem(productId),
    onSuccess: setCart,
    onError: toastApiError,
  });

  const clearCart = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setClearOpen(false);
      toast.success("Cart cleared");
    },
    onError: toastApiError,
  });

  const checkout = useMutation({
    mutationFn: ordersApi.checkout,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Order #${order.id} placed!`);
      navigate(`/orders/${order.id}`);
    },
    onError: toastApiError,
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <ShoppingCart className="size-10 text-muted-foreground" />
        <p className="font-medium">Your cart is empty</p>
        <Button asChild>
          <Link to="/">Browse the catalog</Link>
        </Button>
      </div>
    );
  }

  const busy = updateItem.isPending || removeItem.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Cart</h1>
        <Button variant="ghost" size="sm" onClick={() => setClearOpen(true)}>
          Clear cart
        </Button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <Link
                  to={`/products/${item.productId}`}
                  className="font-medium hover:underline"
                >
                  {item.productName}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(item.unitPrice)} each
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md border">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Decrease quantity"
                    disabled={busy || item.quantity <= 1}
                    onClick={() =>
                      updateItem.mutate({ productId: item.productId, quantity: item.quantity - 1 })
                    }
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Increase quantity"
                    disabled={busy}
                    onClick={() =>
                      updateItem.mutate({ productId: item.productId, quantity: item.quantity + 1 })
                    }
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <span className="w-20 text-right font-medium">{formatPrice(item.lineTotal)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove item"
                  disabled={busy}
                  onClick={() => removeItem.mutate(item.productId)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <p className="text-lg">
          Total: <span className="font-semibold">{formatPrice(cart!.total)}</span>
        </p>
        <Button size="lg" onClick={() => checkout.mutate()} disabled={checkout.isPending}>
          {checkout.isPending ? "Placing order…" : "Checkout"}
        </Button>
      </div>

      <ConfirmDelete
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear cart?"
        description="This removes all items from your cart."
        onConfirm={() => clearCart.mutate()}
        pending={clearCart.isPending}
      />
    </div>
  );
}
