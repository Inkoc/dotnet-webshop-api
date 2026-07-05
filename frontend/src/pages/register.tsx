import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { useAuth } from "@/lib/auth";
import { applyApiErrors } from "@/lib/errors";

const registerSchema = z
  .object({
    email: z.email("Enter a valid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a digit"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: registerUser, login } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: RegisterForm) {
    try {
      await registerUser(data);
      await login({ email: data.email, password: data.password });
      toast.success("Welcome! Your account is ready.");
      navigate("/");
    } catch (error) {
      applyApiErrors(error, form.setError, ["email", "password", "confirmPassword"]);
    }
  }

  const errors = form.formState.errors;

  return (
    <div className="mx-auto max-w-sm py-10">
      <Card>
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create an account to start shopping.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...form.register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <PasswordInput
                  id="password"
                  autoComplete="new-password"
                  {...form.register("password")}
                />
                <FieldDescription>
                  Minimum 8 characters with an uppercase letter, a lowercase letter and a digit.
                </FieldDescription>
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                <PasswordInput
                  id="confirmPassword"
                  autoComplete="new-password"
                  {...form.register("confirmPassword")}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </Field>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating account…" : "Register"}
              </Button>
            </FieldGroup>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
