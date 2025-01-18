"use client";

import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useQuery } from "@tanstack/react-query";
import request from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserProfile } from "@/lib/zustandStore";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";

export default function Header() {
  const { user, getUserProfile } = useUserProfile();
  const { isPending } = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<{ data: { name: string; email: string } }> => {
      const data: { data: { name: string; email: string; id: string } } =
        await request.get("/auth/me");
      getUserProfile(data?.data);
      return data;
    },
    enabled: !user,
    initialData: user ? { data: user } : undefined,
  });

  return (
    <>
      {isPending ? (
        <>
          <div className={"flex justify-between"}>
            <Skeleton className={"w-[100px] h-4"} />
            <Skeleton className={"w-10  h-10 rounded-full"} />
          </div>
        </>
      ) : (
        <div className={"flex justify-between"}>
          <h1 className={"text-xl"}>
            Hello, Welcome!{" "}
            <strong className={"font-bold"}>{user?.name}</strong>
          </h1>
          <div className="flex gap-4 items-center">
            <Button variant="outline">
              <Bell />
            </Button>
            <Avatar
              className={
                "w-10 h-10 rounded-full bg-gray-200 flex justify-center items-center"
              }
            >
              <AvatarFallback className="capitalize">
                {user?.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </>
  );
}
