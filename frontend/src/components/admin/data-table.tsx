import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  loading: boolean;
  getKey: (row: T) => string | number;
  emptyMessage: string;
}

export function DataTable<T>({ columns, rows, loading, getKey, emptyMessage }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.header} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={getKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.header} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <Card key={getKey(row)}>
            <CardContent className="space-y-2">
              {columns
                .filter((column) => !column.hideOnMobile)
                .map((column) => (
                  <div key={column.header} className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">{column.header}</span>
                    <span className="text-right">{column.cell(row)}</span>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
