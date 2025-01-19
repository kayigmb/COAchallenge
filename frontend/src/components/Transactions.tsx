"use client";

import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import request from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { MoveDownRight, MoveUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import AddTransaction from "@/components/AddTransaction";

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  account: string;
  category: string;
  transaction_time: string;
  type: "income" | "expense";
};

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "type",
    header: "",
    cell: ({ row }) => {
      const type = row.getValue("type") as Transaction["type"];
      const Icon = type === "income" ? MoveDownRight : MoveUpRight;
      const colorClass = type === "income" ? "text-green-500" : "text-red-500";
      return <Icon className={`h-4 w-4 ${colorClass}`} />;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US").format(amount);
      return (
        <div className="font-medium">
          <span className="text-[15px] text-gray-400">RWF</span> {formatted}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "account",
    header: "Account",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "transaction_time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return new Date(row.getValue("transaction_time")).toLocaleString();
    },
  },
];

export function Transactions() {
  const { data, isPending, refetch } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const data: { data: [] } = await request.get("/transactions?per_page=5");
      return data?.data?.map(
        (item: {
          transaction: {
            id: string;
            amount: number;
            description: string;
            transaction_time: string;
            type: "income" | "expense";
          };
          account: {
            name: string;
          };
          category: {
            name: string;
          };
        }) => ({
          id: item.transaction.id,
          amount: item.transaction.amount,
          description: item.transaction.description,
          account: item.account.name,
          category: item.category.name,
          transaction_time: item.transaction.transaction_time,
          type: item.transaction.type,
        }),
      );
    },
  });

  return (
    <Card className="p-5 w-full">
      <div className="flex w-full items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Recent Transactions</h1>
        <AddTransaction refetch={refetch} />
      </div>
      {isPending ? (
        <>
          <Skeleton className="w-full h-[200px] rounded-md" />
        </>
      ) : data && data.length === 0 ? (
        <p className="text-center">No Transactions!</p>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}
    </Card>
  );
}
