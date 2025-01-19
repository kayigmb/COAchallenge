"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import React, { ReactNode } from "react";
import { ClipboardPlus, HomeIcon, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import request from "@/lib/axios";
import { toast } from "react-toastify";
import { useUserProfile } from "@/lib/zustandStore";

interface SidebarComponentProps {
  children: ReactNode;
}

function SidebarLinks({
  link,
  name,
  icon: Icon,
}: {
  link: string;
  name: string;
  icon: React.ComponentType;
}) {
  const path: string = usePathname();
  const router = useRouter();
  return (
    <div
      className={`flex cursor-pointer gap-3 w-full h-10 hover:bg-gray-300 justify-center items-center rounded-2xl ${path === link ? "bg-gray-300" : "bg-gray-100"}`}
      onClick={(e) => {
        e.preventDefault();
        router.push(link);
      }}
    >
      <Icon />
      <p>{name}</p>
    </div>
  );
}

const SidebarComponent: React.FC<SidebarComponentProps> = ({ children }) => {
  const router = useRouter();
  const { removeUserProfile } = useUserProfile();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      await request.get("/auth/logout");
    },
    onSuccess: () => {
      removeUserProfile();
      localStorage.removeItem("auth");
      toast.success("Logout successful");
      return router.push("/login");
    },
  });

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader />
        <SidebarContent className={"p-5"}>
          <SidebarLinks name={"Home"} link={"/"} icon={HomeIcon} />
          <SidebarLinks name={"Report"} link={"/report"} icon={ClipboardPlus} />
          <SidebarFooter className={"mt-10"}>
            <div>
              <Button
                variant={"link"}
                className={"w-full"}
                loading={isPending}
                onClick={(e) => {
                  e.preventDefault();
                  mutate();
                }}
              >
                <LogOut />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
      <main className={"w-full"}>{children}</main>
    </SidebarProvider>
  );
};

export default SidebarComponent;
