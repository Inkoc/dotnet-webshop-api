import { Outlet } from "react-router";
import { Navbar } from "@/components/layout/navbar";

export function RootLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
