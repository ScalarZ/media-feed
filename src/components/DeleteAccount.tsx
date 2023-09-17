import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useToggle } from "@/hooks/useToggle";
import { Loader2 } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { FormEvent, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";

export default function DeleteAccount({
  userId,
  noPassword,
  isEmail,
}: {
  userId?: string;
  noPassword?: boolean;
  isEmail?: boolean;
}) {
  const { replace, reload } = useRouter();
  const [toggleValue, toggle] = useToggle();
  const [password, setPassword] = useState("");
  const [invalidPassword, setInvalidPassword] = useState(false);
  const { mutate: deleteAccount, isLoading: isDeletingAccount } =
    trpc.userRouter.deleteAccount.useMutation();

  function handleDeleteAccount(e: FormEvent) {
    e.preventDefault();
    setInvalidPassword(false);
    if (!userId || (!password && !noPassword)) return;
    deleteAccount(
      {
        userId,
        password: noPassword ? password : undefined,
      },
      {
        onSuccess: async () => {
          if (noPassword && !isEmail) {
            reload();
          }
          await signOut({ redirect: false });
          replace("/");
        },
        onError: (err) => {
          if (err.message === "Invalid password") setInvalidPassword(true);
        },
      }
    );
  }
  return (
    <AlertDialog open={toggleValue} onOpenChange={toggle}>
      <Button
        variant="outline"
        className="border-destructive text-destructive hover:bg-destructive hover:text-white"
        onClick={toggle}
      >
        Delete Account
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete your account?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your post
          and remove your data from our servers.
        </AlertDialogDescription>
        <form onSubmit={handleDeleteAccount}>
          {!noPassword ? (
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Type your password..."
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              {invalidPassword && (
                <p className="text-destructive text-sm">Invalid password</p>
              )}
            </div>
          ) : null}
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <Button
              type="submit"
              variant={"destructive"}
              className="flex items-center gap-x-1"
            >
              {isDeletingAccount ? (
                <>
                  Deleting
                  <Loader2
                    strokeWidth={2.5}
                    size={14}
                    className="animate-spin"
                  />
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
