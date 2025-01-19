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
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useEffect } from "react";

const loginFormSchema = z.object({
  email: z.string().trim().nonempty({ message: "Email is required" }),
  password: z.string().trim().nonempty({ message: "Password is required" }),
});

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    let auth: string | null;
    if (typeof window !== "undefined") {
      auth = localStorage.getItem("auth");
      if (auth) {
        router.push("/");
      }
    }
  }, [router]);

  const { mutate, isPending } = useMutation({
    // @ts-ignore
    mutationFn: (data: { email: string; password: string }) =>
      request.post("/auth/signin", data),
    onSuccess: (res: { data: { access_token: string } }) => {
      const token: string = res?.data?.access_token;
      localStorage.setItem("auth", token);
      // window.location.href = "/";
      router.push("/");
      return;
    },
    onError: () => {
      toast.error("Invalid Username or password");
      return;
    },
  });

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(form: z.infer<typeof loginFormSchema>) {
    mutate(form);
  }

  return (
    <>
      <div className={"w-[100%] sm:w-[100%] md:w-[70%] lg:w-[50%]"}>
        <h1 className={"text-3xl font-bold text-center"}>Login</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          Don&#39;t have an account?{" "}
          <Link
            href="/register"
            className={"text-opacity-70 text-right font-bold"}
          >
            Register
          </Link>
        </p>
      </div>
    </>
  );
}
