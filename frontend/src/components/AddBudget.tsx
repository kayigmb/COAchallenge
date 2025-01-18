import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import CalendarPicker from "@/components/CalendarPicker";

export const addBudgetSchema = z.object({
  limit: z
    .number({ invalid_type_error: "Limit is required" })
    .min(1, { message: "Limit is too low" }),
  start: z.date({
    required_error: "Start date is required",
    invalid_type_error: "That's not a date!",
  }),
  end: z.date({
    required_error: "End date is required",
    invalid_type_error: "That's not a date!",
  }),
});

const AddBudget = ({
  refetch,
  disabled,
}: {
  refetch: () => void;
  disabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const [currentAccount, setCurrentAccount] = useState("");
  const form = useForm<z.infer<typeof addBudgetSchema>>({
    resolver: zodResolver(addBudgetSchema),
    defaultValues: {
      start: new Date(),
      end: new Date(),
      limit: 0.0,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: z.infer<typeof addBudgetSchema>) =>
      request.post("/budgets", {
        limit: data.limit,
        start_date: data.start,
        end_date: data.end,
      }),
    onSuccess: async () => {
      toast.success("Budget added successfully.");
      setOpen(false);
      form.reset();
      refetch();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const { mutate: mutateAccount, isPending: isPendingAccount } = useMutation({
    mutationFn: ({
      data,
      id,
    }: {
      data: z.infer<typeof addBudgetSchema>;
      id: string;
    }) =>
      request.post(`/budgets/${id}`, {
        limit: data.limit,
        start_date: data.start,
        end_date: data.end,
      }),
    onSuccess: async () => {
      toast.success("Budget added successfully.");
      setOpen(false);
      refetch();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onSubmit = async (data: z.infer<typeof addBudgetSchema>) => {
    if (currentAccount) {
      return mutateAccount({ data, id: currentAccount });
    }
    mutate(data);
  };

  useEffect(() => {
    if (searchParams.get("account")) {
      setCurrentAccount(searchParams.get("account")!);
    }
  }, [searchParams, currentAccount]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            onClick={() => setOpen(true)}
            disabled={disabled}
          >
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
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <CalendarPicker field={field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <CalendarPicker field={field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="limit"
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
              <Button
                type="submit"
                className={"w-full"}
                loading={isPending || isPendingAccount}
              >
                Submit
              </Button>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default AddBudget;
