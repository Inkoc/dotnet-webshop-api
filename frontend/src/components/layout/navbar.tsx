import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Menu, Moon, Package, ShoppingCart, Store, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cartApi } from "@/lib/api/cart";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const adminLinks = [
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/users", label: "Users" },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  );
}

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.get,
    enabled: !!user,
  });

  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/");
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    return cn(
      "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-foreground",
      isActive ? "bg-accent text-foreground" : "text-muted-foreground",
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="relative mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Store className="size-5" />
          WebShop
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Catalog
          </NavLink>
          {user && (
            <NavLink to="/orders" className={navLinkClass}>
              Orders
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />

          {user && (
            <Button variant="ghost" size="icon" asChild aria-label="Cart">
              <Link to="/cart" className="relative">
                <ShoppingCart className="size-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full px-1 text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Package className="size-4" />
                  Admin
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {adminLinks.map((link) => (
                  <DropdownMenuItem key={link.to} onSelect={() => navigate(link.to)}>
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:inline-flex" aria-label="Account">
                  <UserRound className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="max-w-52 truncate">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1 md:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle>WebShop</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-3 px-4">
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  Catalog
                </Link>
                {user && (
                  <>
                    <Link to="/cart" onClick={() => setMenuOpen(false)}>
                      Cart {cartCount > 0 && `(${cartCount})`}
                    </Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)}>
                      Orders
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <>
                    <Separator />
                    <span className="text-xs font-medium uppercase text-muted-foreground">Admin</span>
                    {adminLinks.map((link) => (
                      <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}>
                        {link.label}
                      </Link>
                    ))}
                  </>
                )}
                <Separator />
                {user ? (
                  <button type="button" className="text-left" onClick={handleLogout}>
                    Log out
                  </button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)}>
                      Register
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
