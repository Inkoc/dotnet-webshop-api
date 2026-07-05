import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { categoriesApi } from "@/lib/api/categories";
import { productsApi } from "@/lib/api/products";
import { applyApiErrors, toastApiError } from "@/lib/errors";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Max 200 characters"),
  description: z.string().optional(),
  price: z.coerce.number<number>().min(0, "Price must be 0 or more"),
  stockQuantity: z.coerce
    .number<number>()
    .int("Whole number required")
    .min(0, "Stock must be 0 or more"),
  categoryId: z.coerce.number<number>().positive("Pick a category"),
});

type ProductForm = z.infer<typeof productSchema>;

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: 0,
  stockQuantity: 0,
  categoryId: 0,
};

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Product | null;
  categories: Category[];
}

function ProductFormDialog({ open, onOpenChange, editing, categories }: ProductFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    values: editing
      ? {
          name: editing.name,
          description: editing.description ?? "",
          price: editing.price,
          stockQuantity: editing.stockQuantity,
          categoryId: editing.categoryId,
        }
      : emptyForm,
  });

  const mutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const payload = { ...data, description: data.description || null };
      if (editing) {
        await productsApi.update(editing.id, payload);
      } else {
        await productsApi.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(editing ? "Product updated" : "Product created");
      onOpenChange(false);
      form.reset(emptyForm);
    },
    onError: (error) =>
      applyApiErrors(error, form.setError, [
        "name",
        "description",
        "price",
        "stockQuantity",
        "categoryId",
      ]),
  });

  const errors = form.formState.errors;
  const categoryId = form.watch("categoryId");

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit product" : "New product"}
    >
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input id="name" {...form.register("name")} />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
            <Textarea id="description" rows={3} {...form.register("description")} />
            <FieldError errors={[errors.description]} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="price">Price</FieldLabel>
              <Input id="price" type="number" step="0.01" min="0" {...form.register("price")} />
              <FieldError errors={[errors.price]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="stockQuantity">Stock</FieldLabel>
              <Input
                id="stockQuantity"
                type="number"
                step="1"
                min="0"
                {...form.register("stockQuantity")}
              />
              <FieldError errors={[errors.stockQuantity]} />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="categoryId">Category</FieldLabel>
            <Select
              value={categoryId ? String(categoryId) : ""}
              onValueChange={(value) =>
                form.setValue("categoryId", Number(value), { shouldValidate: true })
              }
            >
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Pick a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.categoryId]} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : editing ? "Save changes" : "Create product"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const { data: products, isPending } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      setDeleting(null);
    },
    onError: toastApiError,
  });

  const columns: Column<Product>[] = [
    { header: "Name", cell: (product) => <span className="font-medium">{product.name}</span> },
    { header: "Category", cell: (product) => product.categoryName },
    { header: "Price", cell: (product) => formatPrice(product.price), className: "text-right" },
    { header: "Stock", cell: (product) => product.stockQuantity, className: "text-right" },
    {
      header: "Actions",
      className: "w-24 text-right",
      cell: (product) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit"
            onClick={() => {
              setEditing(product);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete"
            onClick={() => setDeleting(product)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New product
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={products}
        loading={isPending}
        getKey={(product) => product.id}
        emptyMessage="No products yet. Create the first one."
      />

      <ProductFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
          }
        }}
        editing={editing}
        categories={categories ?? []}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
        title={`Delete "${deleting?.name}"?`}
        description="This will permanently remove the product."
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        pending={deleteMutation.isPending}
      />
    </div>
  );
}
