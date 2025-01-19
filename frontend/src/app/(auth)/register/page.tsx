"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/passwordinput";
import { useMutation } from "@tanstack/react-query";
import request from "@/lib/axios";
import { toast } from "react-toastify";

const registerFormSchema = z.object({
  name: z.string().trim().nonempty({ message: "Name is required" }),
  email: z
    .string()
    .trim()
    .nonempty({ message: "Email is required" })
    .email({ message: "Enter a valid email" }),
  password: z
    .string()
    .trim()
    .nonempty({ message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(15, { message: "Password must be at most 15 characters long" })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d!@#$&]{6,15}$/, {
      message: "Password must contain at least one letter, at least one number",
    }),
});

export default function RegisterPage() {
  const { mutate, isPending } = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      request.post("/auth/signup", data),
    onSuccess: () => {
      toast.success("Sign up successfully");
      window.location.href = "/login";
      return;
    },
    onError: (error: { data: { detail: string } }) => {
      toast.error(error?.data?.detail);
      return;
    },
  });

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(form: z.infer<typeof registerFormSchema>) {
    console.log(form);
    mutate(form);
  }

  return (
    <>
      <div className={"w-[100%] sm:w-[100%] md:w-[70%] lg:w-[50%]"}>
        <h1 className={"text-3xl font-bold text-center"}>Register</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="Password" {...field} />
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
        <p className={"text-right mt-5"}>
          Do you have an account?{" "}
          <Link
            href="/login"
            className={"text-opacity-70 text-right font-bold"}
          >
            Login
          </Link>
        </p>
      </div>
    </>
  );
}
