"use client";

import SidebarComponent from "@/components/Sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Suspense, useState } from "react";
import { columns, Transaction } from "@/components/Transactions";
import { useQuery } from "@tanstack/react-query";
import request from "@/lib/axios";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

function ReportPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data, isPending } = useQuery<Transaction[]>({
    queryKey: ["transactions", startDate, endDate],
    queryFn: async () => {
      let url = "/transactions";
      const params = new URLSearchParams();

      if (startDate) {
        params.append("start_date", startDate);
      }
      if (endDate) {
        params.append("end_date", endDate);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const data: { data: [] } = await request.get(url);
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

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };
  return (
    <>
      <SidebarComponent>
        <SidebarTrigger />
        <div className={"p-3 w-full"}>
          {/*Header*/}
          <Header />
          <Card className={"p-5 mt-5 h-[70vh] overflow-auto scrollbar-hide"}>
            <div>
              <p>Full Transactions report</p>
            </div>
            <div className="mt-5 flex gap-4">
              <div>
                {" "}
                <p>Start Date</p>
                <Input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </div>
              <div>
                {" "}
                <p>Ending Date</p>
                <Input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>
            <div className="mt-5">
              {isPending ? (
                <>
                  <Skeleton className="w-full h-[200px] rounded-md" />
                </>
              ) : data && data.length === 0 ? (
                <p className="text-center">No Transactions!</p>
              ) : (
                <DataTable columns={columns} data={data || []} />
              )}
            </div>
          </Card>
        </div>
      </SidebarComponent>
    </>
  );
}

export default function Reports() {
  return (
    <Suspense>
      <ReportPage />
    </Suspense>
  );
}
