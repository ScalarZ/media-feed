import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NextImage from "@/components/common/Image";
import { useUser } from "@/hooks/useUser";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { Loader2, Trash, UserCircle } from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/utils/trpc";
import { handleError } from "@/utils/handleError";
import useImageUrl from "@/hooks/useImageUrl";
import {
  deleteImage,
  updateImage,
  uploadImage,
  supabaseBucketUrl,
} from "@/utils/uploadImage";
import { useSession } from "next-auth/react";
import DeleteAccount from "@/components/DeleteAccount";

const accountFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  displayname: z.string().max(30, {
    message: "Displayname must not be longer than 30 characters.",
  }),
  phone: z.string().regex(/^(\d{10}|)$/, "Phone must be at least 10 digits."),
  image: z.string().optional(),
  email: z.string(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function Settings() {
  const user = useUser();
  const { data: session, update } = useSession();
  const { mutate: updateAccount } = trpc.userRouter.update.useMutation();
  const { mutate: sendEmail, isLoading: isSendingEmail } =
    trpc.userRouter.sendEmail.useMutation();
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const [profilePicture, setProfilePicture] = useState<{
    url?: string | null;
    image: File | null;
  }>({ url: user?.image, image: null });
  const imageUrl = useImageUrl(profilePicture.url ?? "", [profilePicture]);

  const defaultValues: Partial<AccountFormValues> = {
    username: user?.name ?? "",
    displayname: user?.displayname ?? "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
  };

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  });

  async function onSubmit(data: AccountFormValues) {
    if (!user) return;
    setIsUpdatingAccount(true);
    const newProfilePicture = await handleUpdateProfilePicture();
    updateAccount(
      {
        ...data,
        userId: user.id,
        image: newProfilePicture,
        updatedAt: Date.now(),
      },
      {
        onError: (error) => handleError(error),
        onSuccess: ({ message }) => {
          const newSession = {
            ...data,
            image: newProfilePicture !== null ? newProfilePicture : user.image,
          };
          update({
            ...session,
            user: {
              ...user,
              ...newSession,
            },
          });
          toast({
            title: message,
            className: "text-green-500",
          });
        },
        onSettled: () => setIsUpdatingAccount(false),
      }
    );
  }

  async function handleUpdateProfilePicture() {
    let imageURL = supabaseBucketUrl + "/profiles/";
    if (!user) return null;
    if (!profilePicture.image) {
      if (!profilePicture.url) {
        deleteImage("profiles", [user.image]);
        return "";
      }
      return null;
    }

    if (!user.image || !user.image.startsWith(supabaseBucketUrl)) {
      const { data } = await uploadImage(
        "profiles",
        profilePicture.image,
        `${Date.now()}-${user.name}`
      );

      imageURL += data?.path;
      return imageURL;
    }

    await updateImage("profiles", profilePicture.image, user.image);
    return null;
  }

  function handleResetPassword() {
    if (!user) return;
    sendEmail(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        origin: location.origin,
        template: "CHANGE_PASSWORD",
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
    <div className="px-4 pt-4 pb-8">
      <h1 className="text-xl font-semibold">Account</h1>
      <p className="mb-2 text-sm text-muted-foreground">
        Update your account settings
      </p>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="py-4 space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Username</FormLabel>
                <FormControl>
                  <Input readOnly disabled {...field} />
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
                <FormLabel className="font-semibold">Email</FormLabel>
                <FormControl>
                  <Input readOnly disabled {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayname"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Display name</FormLabel>
                <FormControl>
                  <Input placeholder="Your display name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Phone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Your phone number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-x-2">
                  <FormLabel
                    htmlFor="image"
                    className="p-2 border border-input rounded bg-background flex items-center gap-x-4 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                  >
                    Upload your image
                  </FormLabel>
                  {profilePicture.url && (
                    <Trash
                      className="text-gray-500 cursor-pointer hover:text-destructive"
                      onClick={() =>
                        setProfilePicture({ image: null, url: null })
                      }
                    />
                  )}
                </div>
                <FormControl>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...field}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length)
                        setProfilePicture({
                          url: URL.createObjectURL(e.target.files[0]),
                          image: e.target.files[0],
                        });
                    }}
                  />
                </FormControl>
                <div>
                  {profilePicture.url ? (
                    <NextImage
                      src={
                        profilePicture.url === user?.image
                          ? imageUrl
                          : profilePicture.url
                      }
                      height={84}
                      width={84}
                      alt={user?.name!}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle strokeWidth={1} size={84} />
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="flex items-center gap-x-1">
            {isUpdatingAccount ? (
              <>
                Updating
                <Loader2 strokeWidth={2.5} size={14} className="animate-spin" />
              </>
            ) : (
              <>Update account</>
            )}
          </Button>
        </form>
      </Form>
      <Separator />
      <div className="mt-4 f flex justify-between items-center">
        <Button
          type="button"
          variant="destructive"
          className="lex items-center gap-x-1"
          onClick={handleResetPassword}
        >
          {isSendingEmail ? (
            <>
              Change password
              <Loader2 strokeWidth={2.5} size={14} className="animate-spin" />
            </>
          ) : (
            <> Change password</>
          )}
        </Button>
        <DeleteAccount
          userId={user?.id}
          noPassword={user?.provider === "email" ? false : true}
          isEmail={true}
        />
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: {
      user: session?.user,
      session,
    },
  };
};
