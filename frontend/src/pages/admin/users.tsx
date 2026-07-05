import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { usersApi } from "@/lib/api/users";
import { useAuth } from "@/lib/auth";
import { toastApiError } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import type { User } from "@/lib/types";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [deleting, setDeleting] = useState<User | null>(null);

  const { data: users, isPending } = useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
  });

  const rolesMutation = useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: string[] }) =>
      usersApi.updateRoles(id, { roles }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Roles updated for ${updated.email}`);
    },
    onError: toastApiError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
      setDeleting(null);
    },
    onError: toastApiError,
  });

  function toggleAdmin(user: User) {
    const isAdmin = user.roles.includes("Admin");
    const roles = isAdmin
      ? user.roles.filter((role) => role !== "Admin")
      : [...user.roles, "Admin"];
    rolesMutation.mutate({ id: user.id, roles });
  }

  const columns: Column<User>[] = [
    { header: "Email", cell: (user) => <span className="font-medium">{user.email}</span> },
    { header: "Created", cell: (user) => formatDate(user.createdAt), hideOnMobile: true },
    {
      header: "Roles",
      cell: (user) => (
        <div className="flex flex-wrap justify-end gap-1 md:justify-start">
          {user.roles.map((role) => (
            <Badge key={role} variant={role === "Admin" ? "default" : "secondary"}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: "Actions",
      className: "w-32 text-right",
      cell: (user) => {
        const isSelf = user.id === currentUser?.id;
        const isAdmin = user.roles.includes("Admin");
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={isAdmin ? "Remove Admin role" : "Assign Admin role"}
              title={isSelf ? "You cannot change your own roles" : isAdmin ? "Remove Admin" : "Make Admin"}
              disabled={isSelf || rolesMutation.isPending}
              onClick={() => toggleAdmin(user)}
            >
              {isAdmin ? <ShieldOff className="size-4" /> : <ShieldCheck className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete user"
              title={isSelf ? "You cannot delete yourself" : "Delete user"}
              disabled={isSelf}
              onClick={() => setDeleting(user)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <DataTable
        columns={columns}
        rows={users}
        loading={isPending}
        getKey={(user) => user.id}
        emptyMessage="No users found."
      />

      <ConfirmDelete
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
        title={`Delete ${deleting?.email}?`}
        description="This permanently removes the user. Users with orders cannot be deleted."
        onConfirm={() => deleteMutation.mutate(deleting!.id)}
        pending={deleteMutation.isPending}
      />
    </div>
  );
}
