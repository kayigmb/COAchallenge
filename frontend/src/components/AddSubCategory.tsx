"use client";

import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import request from "@/lib/axios";
import { toast } from "react-toastify";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GetUserCategories } from "@/hooks/useGetFunctions";

const addBudgetSchema = z.object({
  category_id: z.string().trim().nonempty({ message: "Category is required" }),
  name: z.string().trim().nonempty({ message: "name is required" }),
  description: z
    .string()
    .trim()
    .nonempty({ message: "description is required" }),
});

export default function AddSubCategory({ refetch }: { refetch: () => void }) {
  const [open, setOpen] = useState(false);
  const userCategories = GetUserCategories();

  const form = useForm<z.infer<typeof addBudgetSchema>>({
    resolver: zodResolver(addBudgetSchema),
    defaultValues: {
      category_id: "",
      name: "",
      description: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof addBudgetSchema>) => {
      await request.post("/sub_categories", data);
    },
    onSuccess: () => {
      toast.success("Subcategory added successfully!");
      setOpen(false);
      form.reset();
      return refetch();
    },
    onError: (data: { data: { detail: string } }) => {
      toast.error(data?.data?.detail);
    },
  });
  const onSubmit = async (data: z.infer<typeof addBudgetSchema>) => {
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
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {userCategories.data?.map((item) => (
                            <SelectItem
                              value={item?.category.id}
                              key={item?.category.id}
                            >
                              {item?.category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
