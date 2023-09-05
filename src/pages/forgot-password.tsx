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
import { useState } from "react";
import { handleError } from "@/utils/handleError";

const emailSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
});

type Email = zod.infer<typeof emailSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();

  const { mutate: sendEmail, isLoading: isSendingEmail } =
    trpc.userRouter.sendEmail.useMutation();

  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm<Email>({
    resolver: zodResolver(emailSchema),
  });
  async function onSubmit(data: Email) {
    sendEmail(
      {
        email: data.email,
        origin: location.origin,
        template: "RESET_PASSWORD",
      },
      {
        onError: (error) => handleError(error),
        onSuccess: ({ message }) => {
          toast({
            title: message,
            className: "text-green-500",
          });
        },
      }
    );
  }

  return (
    <div className="px-4 py-10 grid place-items-center">
      <Card className="mx-auto pb-4 max-w-lg w-full border shadow-slate-200 shadow-md dark:shadow-slate-950">
        <CardHeader>
          <CardTitle className="text-center">Forgot password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
            <Label htmlFor="email" label="Email" error={errors.email?.message}>
              <Input id="email" {...register("email")} />
            </Label>
            <Button type="submit" className="mt-2 flex gap-x-2 font-semibold">
              {isSendingEmail && (
                <Loader2 size={16} strokeWidth={3} className="animate-spin" />
              )}
              Send email
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/login" className="text-sm">
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
  htmlFor: keyof Email;
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
  if (session) {
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};
