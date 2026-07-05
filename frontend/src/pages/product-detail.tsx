import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { cartApi } from "@/lib/api/cart";
import { productsApi } from "@/lib/api/products";
import { reviewsApi } from "@/lib/api/reviews";
import { useAuth } from "@/lib/auth";
import { applyApiErrors, toastApiError } from "@/lib/errors";
import { formatDate, formatPrice } from "@/lib/format";
import type { Review } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={
            index < Math.round(rating)
              ? "size-4 fill-amber-400 text-amber-400"
              : "size-4 text-muted-foreground/40"
          }
        />
      ))}
    </span>
  );
}

const reviewSchema = z.object({
  rating: z.coerce.number<number>().min(1, "Pick a rating").max(5),
  comment: z.string().max(2000, "Max 2000 characters").optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

function ReviewSection({ productId }: { productId: number }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: reviews, isPending } = useQuery({
    queryKey: ["reviews", productId],
    queryFn: () => reviewsApi.getForProduct(productId),
  });

  const ownReview = reviews?.find((review) => review.userId === user?.id);
  const average =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  const form = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  useEffect(() => {
    if (editing && ownReview) {
      form.reset({ rating: ownReview.rating, comment: ownReview.comment ?? "" });
    }
  }, [editing, ownReview, form]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
  }

  const createMutation = useMutation({
    mutationFn: (data: ReviewForm) =>
      reviewsApi.create({ productId, rating: data.rating, comment: data.comment || null }),
    onSuccess: () => {
      invalidate();
      form.reset({ rating: 0, comment: "" });
      toast.success("Review added");
    },
    onError: (error) => applyApiErrors(error, form.setError, ["rating", "comment"]),
  });

  const updateMutation = useMutation({
    mutationFn: (data: ReviewForm) =>
      reviewsApi.update(ownReview!.id, { rating: data.rating, comment: data.comment || null }),
    onSuccess: () => {
      invalidate();
      setEditing(false);
      toast.success("Review updated");
    },
    onError: (error) => applyApiErrors(error, form.setError, ["rating", "comment"]),
  });

  const deleteMutation = useMutation({
    mutationFn: () => reviewsApi.remove(ownReview!.id),
    onSuccess: () => {
      invalidate();
      setDeleteOpen(false);
      setEditing(false);
      form.reset({ rating: 0, comment: "" });
      toast.success("Review deleted");
    },
    onError: toastApiError,
  });

  const showForm = user && (!ownReview || editing);
  const pending = createMutation.isPending || updateMutation.isPending;
  const errors = form.formState.errors;

  function onSubmit(data: ReviewForm) {
    if (editing && ownReview) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {average !== null && (
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <Stars rating={average} />
            {average.toFixed(1)} · {reviews!.length} review{reviews!.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review: Review) => (
            <Card key={review.id}>
              <CardContent className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Stars rating={review.rating} />
                    {review.userId === user?.id && <Badge variant="secondary">Your review</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="text-sm">{review.comment}</p>}
                {review.userId === user?.id && (
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      )}

      {!user && (
        <p className="text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
            Log in
          </Link>{" "}
          to write a review.
        </p>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editing ? "Edit your review" : "Write a review"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="rating">Rating</FieldLabel>
                  <Select
                    value={form.watch("rating") ? String(form.watch("rating")) : ""}
                    onValueChange={(value) =>
                      form.setValue("rating", Number(value), { shouldValidate: true })
                    }
                  >
                    <SelectTrigger id="rating" className="w-40">
                      <SelectValue placeholder="Pick a rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map((value) => (
                        <SelectItem key={value} value={String(value)}>
                          {value} star{value === 1 ? "" : "s"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.rating]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="comment">Comment (optional)</FieldLabel>
                  <Textarea id="comment" rows={3} {...form.register("comment")} />
                  <FieldError errors={[errors.comment]} />
                </Field>
                <div className="flex gap-2">
                  <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : editing ? "Save changes" : "Post review"}
                  </Button>
                  {editing && (
                    <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      )}

      <ConfirmDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete review?"
        description="This will permanently remove your review."
        onConfirm={() => deleteMutation.mutate()}
        pending={deleteMutation.isPending}
      />
    </section>
  );
}

export function ProductDetailPage() {
  const params = useParams();
  const productId = Number(params.id);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isPending } = useQuery({
    queryKey: ["products", productId],
    queryFn: () => productsApi.getById(productId),
    enabled: Number.isFinite(productId),
  });

  const addToCart = useMutation({
    mutationFn: () => cartApi.addItem({ productId, quantity }),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      toast.success("Added to cart");
    },
    onError: toastApiError,
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <p className="font-medium">Product not found.</p>
        <Button variant="link" asChild>
          <Link to="/">Back to catalog</Link>
        </Button>
      </div>
    );
  }

  const inStock = product.stockQuantity > 0;

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/">
          <ArrowLeft className="size-4" />
          Catalog
        </Link>
      </Button>

      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
            <Badge variant="secondary">{product.categoryName}</Badge>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
            {inStock ? (
              <p className="text-sm text-muted-foreground">{product.stockQuantity} in stock</p>
            ) : (
              <Badge variant="destructive">Out of stock</Badge>
            )}
          </div>
        </div>

        {product.description && (
          <p className="max-w-2xl text-muted-foreground">{product.description}</p>
        )}

        {user ? (
          inStock && (
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <Button onClick={() => addToCart.mutate()} disabled={addToCart.isPending}>
                <ShoppingCart className="size-4" />
                {addToCart.isPending ? "Adding…" : "Add to cart"}
              </Button>
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
              Log in
            </Link>{" "}
            to add this product to your cart.
          </p>
        )}
      </div>

      <Separator />

      <ReviewSection productId={productId} />
    </div>
  );
}
