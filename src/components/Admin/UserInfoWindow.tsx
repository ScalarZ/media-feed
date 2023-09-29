import { Loader2, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogDescription } from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataUser } from "@/pages/admin-portal/users";
import { Label } from "../ui/label";
import NextImage from "../common/Image";
import clsx from "clsx";
import { trpc } from "@/utils/trpc";
import { handleError } from "@/utils/handleError";
import { useToast } from "../ui/use-toast";
import { Dispatch, SetStateAction } from "react";
import DeleteAccount from "../DeleteAccount";
import Link from "next/link";

export default function UserInfoWindow({
  userInfo,
  setUserInfo,
  toggleValue,
  toggle,
  setData,
}: {
  userInfo: DataUser | null;
  toggleValue: boolean;
  setUserInfo: (userInfo: DataUser | null) => void;
  toggle: () => void;
  setData: Dispatch<SetStateAction<DataUser[]>>;
}) {
  const { toast } = useToast();
  const { mutate: verify, isLoading } = trpc.userRouter.verify.useMutation();

  function handleVerify() {
    if (!userInfo) return;
    verify(
      {
        userId: userInfo.id,
        verifyStatus: !userInfo.isEmailVerified,
      },
      {
        onSuccess: ({ message }) => {
          toast({
            description: message,
          });
          setUserInfo(null);
          if (userInfo.index !== undefined) {
            setData((prev) => {
              prev[userInfo.index!].isEmailVerified = !userInfo.isEmailVerified;
              return [...prev];
            });
          }
          toggle();
        },
        onError: (err) => handleError(err),
      }
    );
  }
  return (
    <Dialog open={toggleValue} onOpenChange={toggle}>
      <DialogContent className="overflow-y-auto rounded-none h-screen max-w-md flex flex-col">
        <DialogHeader>
          <div className="pr-4 flex justify-between items-center">
            <DialogTitle>User information</DialogTitle>
            <span
              className={clsx("text-sm font-semibold", {
                "text-green-500": userInfo?.isEmailVerified,
                "text-destructive": !userInfo?.isEmailVerified,
              })}
            >
              {userInfo?.isEmailVerified ? "Verified" : "Not Verified"}
            </span>
          </div>
        </DialogHeader>
        <DialogDescription className="flex-grow">
          <div className="flex flex-col justify-center items-center">
            {userInfo?.image ? (
              <NextImage
                src={userInfo.image}
                height={80}
                width={80}
                alt={userInfo?.name!}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <UserCircle strokeWidth={1} size={80} />
            )}
            <Link href={`/${userInfo?.name}`}>
              <span className="text-xl font-semibold hover:text-blue-600">
                {userInfo?.name}
              </span>
            </Link>
          </div>
          <div className="mt-4 grid gap-y-4">
            {Object.keys(userInfo ?? {}).map((key, i) =>
              !["image", "name", "isEmailVerified", "index"].includes(key) ? (
                <div key={i} className="space-y-1">
                  <Label className="font-semibold">
                    {key.replace(key[0], key[0].toUpperCase())}
                  </Label>
                  <div
                    className={clsx("p-2 border rounded", {
                      "bg-gray-100 text-muted-foreground":
                        userInfo?.[key as keyof DataUser] === null,
                    })}
                  >
                    {userInfo?.[key as keyof DataUser] ?? "None"}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </DialogDescription>
        <DialogFooter>
          <div className="w-full flex justify-end gap-x-2">
            <DialogClose className="h-10 px-4 py-2 border rounded-md">
              Cancel
            </DialogClose>
            <DeleteAccount userId={userInfo?.id} noPassword={true} />
            <Button
              className="bg-destructive flex items-center gap-x-1 hover:bg-red-600"
              disabled={!userInfo?.isEmailVerified}
              onClick={handleVerify}
            >
              {isLoading && !!userInfo?.isEmailVerified ? (
                <>
                  Un-Verifying
                  <Loader2
                    strokeWidth={2.5}
                    size={14}
                    className="animate-spin"
                  />
                </>
              ) : (
                <>Un-Verify</>
              )}
            </Button>
            <Button
              className="bg-green-500 flex items-center gap-x-1 hover:bg-green-600"
              disabled={!!userInfo?.isEmailVerified}
              onClick={handleVerify}
            >
              {isLoading && !userInfo?.isEmailVerified ? (
                <>
                  Verifying
                  <Loader2
                    strokeWidth={2.5}
                    size={14}
                    className="animate-spin"
                  />
                </>
              ) : (
                <>Verify</>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
