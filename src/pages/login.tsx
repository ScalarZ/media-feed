import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import zod from "zod";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { useRouter } from "next/router";
// import { Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const schema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string(),
});

type RegisterData = zod.infer<typeof schema>;

export default function Register() {
  const { push } = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(schema),
  });
  const [isLoading, setIsLoading] = useState(false);
  async function onSubmit(data: RegisterData) {
    setIsLoading((prev) => !prev);
    const res = await signIn("credentials", { ...data, redirect: false });
    setIsLoading((prev) => !prev);
    push("/profile");
  }
  return (
    <div className="px-4 min-h-screen grid place-items-center">
      <Card className="mx-auto pb-4 max-w-lg w-full border shadow-slate-200 shadow-md dark:shadow-slate-950">
        <CardHeader>
          <CardTitle className="text-center">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-y-4"
          >
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
                // <Loader2 size={18} strokeWidth={3} className="animate-spin" />
                <>loading...</>
              )}
              Login
            </Button>
          </form>
          <hr className="my-2" />
          <Button
            type="submit"
            variant="secondary"
            className="w-full border flex gap-x-2 font-semibold"
            onClick={() => signIn("google")}
          >
            Google
          </Button>
          <Button
            type="submit"
            variant="secondary"
            className="mt-2 w-full border flex gap-x-2 font-semibold"
            onClick={() => signIn("github")}
          >
            Github
          </Button>
          <div className="mt-4 text-center">
            <Link href="/register" className="text-sm">
              Sing up
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
  if (session) {
    return {
      redirect: {
        destination: "/",
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
