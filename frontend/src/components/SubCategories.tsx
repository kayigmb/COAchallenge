"use client";

import React from "react";
import { Card } from "./ui/card";
import { useMutation, useQuery } from "@tanstack/react-query";
import request from "@/lib/axios";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { CircleX } from "lucide-react";
import { toast } from "react-toastify";
import AddSubCategory from "@/components/AddSubCategory";

const SubCategories = () => {
  const { data, isPending, refetch } = useQuery({
    queryKey: ["sub_categories"],
    queryFn: async () => {
      const data: { data: any[] } = await request.get("/sub_categories");
      return data.data;
    },
  });

  const { mutate } = useMutation({
    mutationFn: (id: string) => request.delete(`/sub_categories/${id}`),
    onSuccess: () => {
      toast.success("Sub Category successfully deleted!");
      refetch();
    },
  });

  return (
    <Card className={"p-5"}>
      <div className="flex items-center justify-between w-full">
        <h2 className="text-2xl font-bold mb-4">SubCategories</h2>
        <AddSubCategory refetch={refetch} />
      </div>
      <div className="gap-2 overflow-auto max-h-[300px] scrollbar-hide">
        {isPending ? (
          <Skeleton className="w-full min-h-[50px] rounded-2xl" />
        ) : data && data.length === 0 ? (
          <div>
            <p className="text-center">No Sub Category </p>
          </div>
        ) : (
          <div className=" flex flex-col gap-4">
            <Card
              className={
                "w-full flex items-center justify-between p-5 bg-gray-200"
              }
            >
              <p className="font-bold capitalize">Name</p>
              <p>Description</p>
              <p>Category</p>
              <p>Action</p>
            </Card>
            {data?.map(
              (category: {
                sub_category: {
                  id: string;
                  description: string;
                  name: string;
                };
                category: {
                  name: string;
                };
              }) => (
                <Card
                  key={category?.sub_category.id}
                  className={"w-full flex items-center justify-between p-5"}
                >
                  <p className="font-bold capitalize">
                    {category.sub_category.name}
                  </p>
                  <p>{category?.sub_category.description}</p>
                  <p>{category?.category?.name}</p>

                  <Button
                    className={"text-red-800"}
                    variant={"link"}
                    onClick={(e) => {
                      e.preventDefault();
                      mutate(category?.sub_category?.id);
                    }}
                    loading={isPending}
                  >
                    <CircleX />
                  </Button>
                </Card>
              ),
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SubCategories;
