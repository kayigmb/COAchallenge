"use client";

import { useQuery } from "@tanstack/react-query";
import request from "@/lib/axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function GetUserAccounts() {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const data: { data: [] } = await request.get(`/accounts`);
      return data?.data;
    },
    staleTime: 1000 * 5 * 60,
  });
  return { data, isPending, refetch };
}

enum Status {
  ACTIVE = "active",
}
enum Type {
  OVERALL = "overall",
  ACCOUNT = "account",
}

export function GetUserBudgets() {
  const searchParams = useSearchParams();
  const [current, setCurrent] = useState(
    () => searchParams.get("account") || null,
  );

  useEffect(() => {
    setCurrent(searchParams.get("account") || null);
  }, [searchParams]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["budgets", current],
    queryFn: async () => {
      const params: {
        status: Status;
        type: Type;
        page: number;
        per_page: number;
        end_date: string;
        account?: string;
      } = {
        status: Status.ACTIVE,
        type: Type.OVERALL,
        page: 1,
        per_page: 2,
        end_date: new Date().toISOString(),
      };

      if (current) {
        params["account"] = current;
        params["type"] = Type.ACCOUNT;
      }

      const cardUrl = new URLSearchParams(params).toString();
      const response: {
        data: {
          amount: number;
          type: string;
          length: number;
          limit: number;
          name: string;
          id: string;
        }[];
      } = await request.get(`/budgets?${cardUrl}`);
      return response.data;
    },
  });

  return { data, isLoading, refetch };
}

export function GetUserCategories() {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await request.get("/categories");
      return data.data;
    },
    staleTime: 1000 * 60 * 5,
  });
  return { data, isPending, refetch };
}

export function GetUserNotifications() {
  const { data: userNotifications, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await request.get("/notifications");
      return data?.data;
    },
  });

  return { userNotifications, refetch };
}

