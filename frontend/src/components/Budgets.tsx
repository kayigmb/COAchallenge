"use client";

import { PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { Card } from "@/components/ui/card";
import AddBudget from "@/components/AddBudget";
import { Skeleton } from "./ui/skeleton";
import { GetUserBudgets } from "@/hooks/useGetFunctions";

export default function Budgets() {
  const { data, isLoading, refetch } = GetUserBudgets();

  return (
    <Card className="p-5 w-full">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-2xl font-bold mb-4">Budget</h2>
        <AddBudget
          refetch={refetch}
          disabled={Boolean(data && data?.length > 0)}
        />
      </div>
      {isLoading ? (
        <div className="w-full justify-center items-center flex flex-col gap-5">
          <Skeleton className="w-[100px] h-[100px] rounded-full" />
          <Skeleton className="w-[100px] h-5 rounded-2xl" />
        </div>
      ) : data?.length === 0 ? (
        <div className="text-center text-gray-500">No Budget!</div>
      ) : (
        <div className=" flex justify-center items-center">
          {data?.map((budget) => {
            const chartData = [
              {
                name: "Spent",
                value: budget.amount,
                fill: "black",
              },
              {
                name: "Remaining",
                value: budget.limit - budget.amount,
                fill: "blue",
              },
            ];

            // @ts-ignore
            return (
              <Card key={budget.id} className="p-4 w-full flex">
                <div className="w-full m-auto flex flex-col justify-center items-center">
                  <RadialBarChart
                    width={150}
                    height={150}
                    innerRadius="60%"
                    outerRadius="80%"
                    data={chartData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar background dataKey="value" cornerRadius={5} />
                    <PolarRadiusAxis tick={false} />
                  </RadialBarChart>
                  <p className="uppercase">{budget.type}</p>
                  <p className="mt-4 text-sm">
                    <span className="font-bold text-red-500">
                      {budget.amount.toLocaleString()}
                    </span>{" "}
                    /{" "}
                    <span className="font-bold text-gray-600">
                      {budget.limit.toLocaleString()}
                    </span>
                  </p>
                  <p className="flex gap-2">
                    {new Date(budget?.start_date).toLocaleDateString()}
                    <span>-</span>
                    {new Date(budget?.end_date).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Card>
  );
}
