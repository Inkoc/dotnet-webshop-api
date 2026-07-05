import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/password-input";
import { useAuth } from "@/lib/auth";
import { applyApiErrors } from "@/lib/errors";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginForm) {
    try {
      await login(data);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      navigate(from ?? "/", { replace: true });
      toast.success("Welcome back!");
    } catch (error) {
      applyApiErrors(error, form.setError, ["email", "password"]);
    }
  }

  const errors = form.formState.errors;

  return (
    <div className="mx-auto max-w-sm py-10">
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>Enter your credentials to continue.</CardDescription>
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
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logging in…" : "Log in"}
              </Button>
            </FieldGroup>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
