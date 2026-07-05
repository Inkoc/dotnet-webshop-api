import { toast } from "sonner";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/api/client";

function toCamelCase(key: string) {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

export function applyApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: string[],
): boolean {
  if (error instanceof ApiError && error.errors) {
    let applied = false;
    for (const [key, messages] of Object.entries(error.errors)) {
      const field = toCamelCase(key);
      if (fields.includes(field) && messages.length > 0) {
        setError(field as Path<T>, { type: "server", message: messages[0] });
        applied = true;
      }
    }
    if (applied) {
      return true;
    }
  }
  toastApiError(error);
  return false;
}

export function toastApiError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.errors) {
      const first = Object.values(error.errors)[0]?.[0];
      toast.error(first ?? error.message);
    } else {
      toast.error(error.message);
    }
  } else {
    toast.error("Something went wrong. Is the API running?");
  }
}
