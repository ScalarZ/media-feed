import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import zod from "zod";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const schema = zod.object({
  username: zod.string().min(2, "Username must be at least 2 characters"),
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().min(8, "Password must be at least 8 characters"),
});

type RegisterData = zod.infer<typeof schema>;

export default function Register() {
  const { toast } = useToast();
  const { mutate, isLoading } = trpc.userRouter.register.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(schema),
  });
  async function onSubmit(data: RegisterData) {
    mutate(
      { ...data, createdAt: Date.now() },
      {
        onSuccess: ({ message }) => {
          toast({
            description: message,
          });
        },
        onError: ({ message }) => {
          console.log({ message });
        },
      }
    );
  }
  return (
    <div className="px-4 min-h-screen grid place-items-center">
      <Card className="mx-auto pb-4 max-w-lg w-full border shadow-slate-200 shadow-md dark:shadow-slate-950">
        <CardHeader>
          <CardTitle className="text-center">Sign up</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <Label
              htmlFor="username"
              label="Username"
              error={errors.username?.message}
            >
              <Input id="username" {...register("username")} />
            </Label>
            <Label htmlFor="email" label="Email" error={errors.email?.message}>
              <Input id="email" {...register("email")} />
            </Label>
            <Label
              htmlFor="password"
              label="Password"
              error={errors.password?.message}
            >
              <Input type="password" id="password" {...register("password")} />
            </Label>
            <Button type="submit" className="mt-2 flex gap-x-2 font-semibold">
              {isLoading && (
                <Loader2 size={16} strokeWidth={3} className="animate-spin" />
              )}
              Create
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="">
              Sing in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Label({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: keyof RegisterData;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col">
      <p className="mb-2 font-medium opacity-70">{label}</p>
      {children}
      <ErrorHandler message={error} />
    </label>
  );
}

function ErrorHandler({ message }: { message?: string }) {
  return <p className="mt-1 text-sm font-normal text-red-500">{message}</p>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  // if (session) {
  //   return {
  //     redirect: {
  //       destination: "/",
  //       permanent: false,
  //     },
  //   };
  // }
  return {
    props: {
      session,
    },
  };
};
