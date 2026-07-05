import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { PackageSearch, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi } from "@/lib/api/categories";
import { productsApi } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");

  const { data: products, isPending: productsPending } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll,
  });

  const filtered = (products ?? []).filter((product) => {
    if (categoryId !== "all" && product.categoryId !== Number(categoryId)) {
      return false;
    }
    return product.name.toLowerCase().includes(search.trim().toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Catalog</h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8 sm:w-64"
            />
          </div>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {productsPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-6 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-24 text-center">
          <PackageSearch className="size-10 text-muted-foreground" />
          <p className="font-medium">No products found</p>
          <p className="text-sm text-muted-foreground">
            {search || categoryId !== "all"
              ? "Try a different search or category."
              : "The catalog is empty."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardHeader>
                  <CardTitle className="line-clamp-1 text-base">{product.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {product.categoryName}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">
                    {product.description ?? "No description."}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
                  {product.stockQuantity > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {product.stockQuantity} in stock
                    </span>
                  ) : (
                    <Badge variant="destructive">Out of stock</Badge>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
