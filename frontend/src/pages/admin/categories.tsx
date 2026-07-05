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
import { Textarea } from "@/components/ui/textarea";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FormDialog } from "@/components/admin/form-dialog";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { categoriesApi } from "@/lib/api/categories";
import { applyApiErrors, toastApiError } from "@/lib/errors";
import type { Category } from "@/lib/types";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Max 100 characters"),
  description: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

const emptyForm: CategoryForm = { name: "", description: "" };

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Category | null;
}

function CategoryFormDialog({ open, onOpenChange, editing }: CategoryFormDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    values: editing
      ? { name: editing.name, description: editing.description ?? "" }
      : emptyForm,
  });

  const mutation = useMutation({
    mutationFn: async (data: CategoryForm) => {
      const payload = { name: data.name, description: data.description || null };
      if (editing) {
        await categoriesApi.update(editing.id, payload);
      } else {
        await categoriesApi.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(editing ? "Category updated" : "Category created");
      onOpenChange(false);
      form.reset(emptyForm);
    },
    onError: (error) => applyApiErrors(error, form.setError, ["name", "description"]),
  });

  const errors = form.formState.errors;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit category" : "New category"}
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : editing ? "Save changes" : "Create category"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  const { data: categories, isPending } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
      setDeleting(null);
    },
    onError: toastApiError,
  });

  const columns: Column<Category>[] = [
    { header: "Name", cell: (category) => <span className="font-medium">{category.name}</span> },
    {
      header: "Description",
      cell: (category) => (
        <span className="text-muted-foreground">{category.description ?? "—"}</span>
      ),
    },
    {
      header: "Actions",
      className: "w-24 text-right",
      cell: (category) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Edit"
            onClick={() => {
              setEditing(category);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete"
            onClick={() => setDeleting(category)}
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
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          New category
        </Button>
      </div>

      <DataTable
        columns={columns}
        rows={categories}
        loading={isPending}
        getKey={(category) => category.id}
        emptyMessage="No categories yet. Create the first one."
      />

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditing(null);
          }
        }}
        editing={editing}
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
        title={`Delete "${deleting?.name}"?`}
        description="This will permanently remove the category."
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        pending={deleteMutation.isPending}
      />
    </div>
  );
}
