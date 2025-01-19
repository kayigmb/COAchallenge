"use client";

import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { useMutation, useQuery } from "@tanstack/react-query";
import request from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CircleX } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card } from "./ui/card";
import { GetUserNotifications } from "@/hooks/useGetFunctions";

function Notification({ data, refetch }) {
  const [openNotifications, setOpenNotifications] = useState(0);

  useEffect(() => {
    let notificatins = 0;
    data?.forEach((index) => {
      if (!index.is_read) {
        notificatins++;
      }
    });
    setOpenNotifications(notificatins);
  }, [data]);

  const { mutate } = useMutation({
    mutationFn: async (id: string) => {
      const data = await request.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: DeleteNotification } = useMutation({
    mutationFn: async (id: string) => {
      const data = await request.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      refetch();
    },
  });
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative group">
          <Bell />
          {openNotifications > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center">
              <span
                className={`absolute inset-0 rounded-full ${
                  openNotifications > 0 ? "bg-red-500" : "bg-gray-100"
                } opacity-80`}
              ></span>
              <span className="relative text-xs font-bold z-10 tabular-nums">
                {openNotifications}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[400px] max-h-[700px] p-5 overflow-auto scrollbar-hide">
        <div className={"font-bold"}>Notifications</div>
        <Card className="p-5 flex flex-col gap-3">
          {data?.length === 0 && (
            <div className="text-center">No Notifications</div>
          )}

          {data?.map((index) => (
            <Card
              key={index?.id}
              className={`flex flex-col  p-1 ${!index.is_read ? "bg-gray-100" : "bg-white"} gap-1 cursor-pointer`}
              onClick={(e) => {
                e.preventDefault();
                mutate(index.id);
              }}
            >
              <div className="flex">
                <div>{index.message}</div>
                <Button
                  variant={"link"}
                  onClick={(e) => {
                    e.preventDefault();
                    DeleteNotification(index.id);
                  }}
                >
                  <CircleX />
                </Button>
              </div>
              <div className="text-xs  w-full flex gap-1">
                <p>{new Date(index.created_at).toLocaleDateString()}</p>
                <p>{new Date(index.created_at).toLocaleTimeString()}</p>
              </div>
            </Card>
          ))}
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export default function Header() {
  const { data, isPending } = useQuery({
    queryKey: ["user_profile"],
    queryFn: async () => {
      const data = await request.get("/auth/me");
      return data.data;
    },
  });

  const { userNotifications, refetch } = GetUserNotifications();

  useEffect(() => {
    const user_id = data?.id;
    if (!user_id) return;
    const connection = new WebSocket(
      `ws://127.0.0.1:5001/api/v1/notifications/${user_id}`,
    );
    connection.onmessage = (event) => {
      if (event.data === "transaction") {
        refetch();
      }
    };
    connection.onerror = (error) => {
      console.log(`WebSocket error: ${error}`);
    };
    return () => {
      connection.close();
    };
  }, [data, userNotifications]);

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
            <strong className={"font-bold"}>{data?.name}</strong>
          </h1>
          <div className="flex gap-4 items-center">
            <Notification data={userNotifications} refetch={refetch} />
            <Avatar
              className={
                "w-10 h-10 rounded-full bg-gray-200 flex justify-center items-center"
              }
            >
              <AvatarFallback className="capitalize">
                {data?.name[0] || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </>
  );
}
