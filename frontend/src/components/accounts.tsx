"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleX, CreditCard } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import request from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";

interface SingleAccountProps {
  id: string;
  name: string;
  type?: string;
  refetch?: () => void;
}

interface setNewParamsProps{
    name: string;
    value: string;
    searchParams: URLSearchParams;
    pathname: string;
    router: AppRouterInstance;
}

function setNewParams({name,value,searchParams,pathname,router}: setNewParamsProps) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl);
}

function SingleAccount({ id, name, type, refetch }: SingleAccountProps) {
  const searchParams = useSearchParams();
  const getSearchParams = searchParams.get("account") || null;
  const router = useRouter();
  const pathname = usePathname()

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      return await request.delete(`/accounts/${id}`);
    },
    onSuccess: () => {
      if (refetch) {
        refetch();
      }
      toast.success("Account successfully deleted!");
    },
  });

  return (
    <div
      className={`w-full min-h-[50px] p-5 flex border rounded-2xl ${getSearchParams === id ? "bg-gray-200" : ""}`}
      onClick={(e) => {
          e.preventDefault()
          setNewParams({
              name: "account",
              value: id,
              searchParams: new URLSearchParams(searchParams.toString()),
              pathname,
              router
          });
      }}
    >
      <div className={"flex gap-5 w-full items-center"}>
        <div className={"flex gap-5"}>
          <CreditCard />
          <p className={"uppercase"}>{name}</p>
        </div>
        <p className={"capitalize"}>{type}</p>
        <Button
          className={"text-red-800"}
          variant={"link"}
          onClick={(e) => {
            e.preventDefault();
            deleteAccount.mutate(id!);
          }}
        >
          <CircleX />
        </Button>
      </div>
    </div>
  );
}

const addAccountSchema = z.object({
  name: z.string().trim().nonempty({ message: "Name is required" }),
  type: z.string().trim().nonempty({ message: "Type is required" }),
  balance: z
    .number({ invalid_type_error: "Balance is required" })
    .min(1, { message: "Balance is too low" }),
});

function AddAccount({ refetch }: { refetch?: () => void }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof addAccountSchema>) =>
      request.post("/accounts", data),
    onSuccess: () => {
      toast.success("Account successfully added!");
      if (refetch) {
        refetch();
      }
      setOpen(false);
    },
    onError: (error) => {
      console.log(error);
      toast.error("Failed to add account");
    },
  });

  const form = useForm<z.infer<typeof addAccountSchema>>({
    resolver: zodResolver(addAccountSchema),
    defaultValues: {
      name: "",
      type: "",
      balance: 0.0,
    },
  });

  function onSubmit(form: z.infer<typeof addAccountSchema>) {
    mutate(form);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"} onClick={() => setOpen(true)}>
          +
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add Account</DialogTitle>
        <Form {...form}>
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
                        <SelectItem value="momo">Mobile Money</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank">Bank</SelectItem>
                        <SelectItem value="saving">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance</FormLabel>
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Accounts() {

    const searchParams = new URLSearchParams();
    const pathname = usePathname();
    const router = useRouter();

  const { data, isPending, refetch } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const data = await request.get(`/accounts`);
        setNewParams({
            name: "account",
            value: data?.data[0].id,
            searchParams: new URLSearchParams(searchParams.toString()),
            pathname,
            router
        });
        return data?.data;
    },
    staleTime: 1000 * 5 * 60,
  });

  return (
    <Card className={"p-5 space-y-4"}>
      <div className={"flex w-full items-center justify-between"}>
        <h1 className={"font-bold"}>Accounts</h1>
        <AddAccount refetch={refetch} />
      </div>
      <div className={"space-y-3"}>
        {isPending ? (
          <div className="space-y-6">
            <Skeleton className="w-full h-10 rounded-2xl" />
            <Skeleton className="w-full h-10 rounded-2xl" />
            <Skeleton className="w-full h-10 rounded-2xl" />
          </div>
        ) : (
          <>
            {data?.map((item: SingleAccountProps) => (
              <SingleAccount
                key={item.id}
                id={item.id}
                name={item.name}
                type={item.type}
                refetch={refetch}
              />
            ))}
          </>
        )}
      </div>
    </Card>
  );
}
