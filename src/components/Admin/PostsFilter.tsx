import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import RangeDatePicker from "@/components/Admin/RangeDatePicker";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthUser } from "next-auth";
import { trpc } from "@/utils/trpc";
import { handleError } from "@/utils/handleError";
import { DataPost } from "@/pages/admin-portal/posts";
import { statusList } from "./Constants";
import { Loader2 } from "lucide-react";

const filterSchema = z.object({
  username: z.string().optional(),
  dateRange: z.object({ from: z.date(), to: z.date() }).optional(),
  status: z.enum(["PENDING", "PUBLISHED", "REJECTED"]).optional(),
});

export type FilterSchema = z.infer<typeof filterSchema>;

export default function PostsFilter({
  user,
  setData,
}: {
  user?: AuthUser;
  setData: (data: DataPost[]) => void;
}) {
  const { mutate: searchPosts, isLoading: isSearchingPosts } =
    trpc.postRouter.searchPosts.useMutation();
  const form = useForm<FilterSchema>({
    resolver: zodResolver(filterSchema),
  });
  async function onSubmit(data: FilterSchema) {
    if (!user) return;
    searchPosts(
      {
        ...data,
        dateRange: data.dateRange
          ? {
              from: data.dateRange.from.toString(),
              to: data.dateRange.to.toString(),
            }
          : undefined,
      },
      {
        onSuccess: (posts) => {
          setData(posts as unknown as DataPost[]);
        },
        onError: (err) => handleError(err),
      }
    );
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
          name="dateRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Date range</FormLabel>
              <FormControl>
                <RangeDatePicker field={field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Status</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusList.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="flex items-center gap-x-1">
          {isSearchingPosts ? (
            <>
              Searching
              <Loader2 strokeWidth={2.5} size={14} className="animate-spin" />
            </>
          ) : (
            <>Search Posts</>
          )}
        </Button>
      </form>
    </Form>
  );
}
