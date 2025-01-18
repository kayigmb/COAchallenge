"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { Card } from "./ui/card";
import request from "@/lib/axios";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { toast } from "react-toastify";
import { GetUserCategories } from "@/hooks/useGetFunctions";
import { CircleX } from "lucide-react";

export const addCategorySchema = z.object({
  name: z.string().trim().nonempty({ message: "name is required" }),
  description: z
    .string()
    .trim()
    .nonempty({ message: "description is required" }),
});

function AddCategory({ refetch }: { refetch: () => void }) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof addCategorySchema>>({
    resolver: zodResolver(addCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof addCategorySchema>) => {
      await request.post("/categories", data);
    },
    onSuccess: () => {
      toast.success("Categories added successfully!");
      setOpen(false);
      form.reset();
      return refetch();
    },
    onError: (data: { data: { detail: string } }) => {
      toast.error(data?.data?.detail);
    },
  });

  const onSubmit = async (data: z.infer<typeof addCategorySchema>) => {
    return mutate(data);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant={"outline"} onClick={() => setOpen(true)}>
            +
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogDescription>Add Category</DialogDescription>
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className={"w-full"} loading={isPending}>
                Submit
              </Button>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Categories() {
  const { data, isPending, refetch } = GetUserCategories();

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: (id: string) => request.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success("Category successfully deleted!");
      refetch();
    },
  });

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between w-full">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
        <AddCategory refetch={refetch} />
      </div>
      <div className="gap-2 overflow-auto max-h-[300px] scrollbar-hide">
        {isPending ? (
          <Skeleton className="w-full min-h-[50px] rounded-2xl" />
        ) : (
          <div className=" flex flex-col gap-4">
            <Card
              className={
                "w-full flex items-center justify-between p-5 sticky top-0 bg-gray-200"
              }
            >
              <p className="font-bold capitalize">Name</p>
              <p>Description</p>
              <p>Action</p>
            </Card>
            {data?.map((category: any) => (
              <Card
                key={category?.category?.id}
                className={"w-full flex items-center justify-between p-5"}
              >
                <p className="font-bold capitalize">{category.category.name}</p>
                <p>{category.category.description}</p>

                <Button
                  className={"text-red-800"}
                  variant={"link"}
                  onClick={(e) => {
                    e.preventDefault();
                    mutate(category.category.id!);
                  }}
                  loading={isLoading}
                >
                  <CircleX />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
