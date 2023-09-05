import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { GetServerSideProps } from "next";
import { JwtPayload, verify } from "jsonwebtoken";
import { checkTokenValidation } from "@/utils/checkTokenValidation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import { useUser } from "@/hooks/useUser";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { handleError } from "@/utils/handleError";
import { signIn } from "next-auth/react";

const passwordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Password = z.infer<typeof passwordSchema>;

export default function ResetPassword({ payload }: { payload: JwtPayload }) {
  const { replace } = useRouter();
  const { mutate: updatePassword, isLoading: setIsUpdatingPassword } =
    trpc.userRouter.updatePassword.useMutation();

  const form = useForm<Password>({
    resolver: zodResolver(passwordSchema),
  });

  async function handleSignIn(email: string, password: string) {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (!res || !res.ok) throw new Error("Invalid credentials");
    replace("/profile");
  }

  async function onSubmit(data: Password) {
    updatePassword(
      {
        userEmail: payload.email,
        password: data.password,
      },
      {
        onError: (error) => handleError(error),
        onSuccess: async () => handleSignIn(payload.email, data.password),
      }
    );
  }
  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="py-4 space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Your new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="flex items-center gap-x-1">
            {setIsUpdatingPassword ? (
              <>
                Resetting
                <Loader2 strokeWidth={2.5} size={14} className="animate-spin" />
              </>
            ) : (
              <>Reset password</>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (session)
    return {
      redirect: {
        destination: "/profile",
        permanent: false,
      },
    };
  const token = context.query.token as string | undefined;
  if (!token)
    return {
      notFound: true,
    };

  try {
    const payload = verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const isTokenValid = await checkTokenValidation(payload);
    if (!isTokenValid) throw Error("Invalid token");
    return {
      props: {
        session,
        payload,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
