"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import request from "@/lib/axios";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GetUserAccounts,
  GetUserBudgets,
  GetUserCategories,
  GetUserNotifications,
} from "@/hooks/useGetFunctions";

export const addTransactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: "amount is required" })
    .min(1, { message: "amount is too low" }),
  type: z.string().trim().nonempty({ message: "Type is required" }),
  description: z
    .string()
    .trim()
    .nonempty({ message: "Description is required" }),
  account_id: z.string().trim().nonempty({ message: "Account is required" }),
  category_id: z.string().trim().nonempty({ message: "Category is required" }),
});

const AddTransaction = ({ refetch }: { refetch: () => void }) => {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof addTransactionSchema>>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      amount: 0.0,
      type: "",
      description: "",
      account_id: "",
      category_id: "",
    },
  });

  const userAccount = GetUserAccounts();
  const userBudgets = GetUserBudgets();
  const userCategories = GetUserCategories();
  const userNotifications = GetUserNotifications();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof addTransactionSchema>) =>
      request.post("/transactions", data),
    onSuccess: async () => {
      toast.success("Transaction added successfully.");
      setOpen(false);
      refetch();
      form.reset();
      await userAccount.refetch();
      await userNotifications.refetch();
      await userBudgets.refetch();
      return;
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onSubmit = async (data: z.infer<typeof addTransactionSchema>) => {
    mutate(data);
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
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Description</FormLabel>
                    <Input placeholder="Description" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {userAccount.data?.map((item: any) => (
                            <SelectItem value={item?.id} key={item?.id}>
                              {item?.name}
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
                          {userCategories.data?.map((item: any) => (
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
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Balance"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
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
};
export default AddTransaction;
