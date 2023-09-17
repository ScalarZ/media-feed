import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { AuthUser } from "next-auth";
import { trpc } from "@/utils/trpc";
import { handleError } from "@/utils/handleError";
import { Loader2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { DataUser } from "@/pages/admin-portal/users";

const filterSchema = z.object({
  username: z.string().optional(),
  email: z.string().optional(),
  verified: z.boolean(),
});

export type FilterSchema = z.infer<typeof filterSchema>;

export default function PostsFilter({
  user,
  setData,
}: {
  user?: AuthUser;
  setData: (data: DataUser[]) => void;
}) {
  const { mutate: searchUsers, isLoading: isSearchingUsers } =
    trpc.userRouter.searchUsers.useMutation();

  const form = useForm<FilterSchema>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      verified: false,
    },
  });

  async function onSubmit(data: FilterSchema) {
    if (!user) return;
    searchUsers(data, {
      onSuccess: (users) => {
        setData(users as unknown as DataUser[]);
      },
      onError: handleError,
    });
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="py-4 space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Username</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
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
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="verified"
          render={({ field }) => (
            <FormItem className="flex items-center gap-x-2 space-y-0">
              <FormLabel className="font-semibold">Verified</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="flex items-center gap-x-1">
          {isSearchingUsers ? (
            <>
              Searching
              <Loader2 strokeWidth={2.5} size={14} className="animate-spin" />
            </>
          ) : (
            <>Search Users</>
          )}
        </Button>
      </form>
    </Form>
  );
}
