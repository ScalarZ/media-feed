import React, { useMemo } from "react";
import Post from "./Posts/Post";
import { trpc } from "@/utils/trpc";
import { User } from "@/types";
import { Loader2 } from "lucide-react";
import EditPostWindow from "./EditPostWindow";
import { Dialog } from "./ui/dialog";
import { useUpdatePost } from "@/context/UpdatePostProvider";
import { useUser } from "@/hooks/useUser";
import GridView from "./Posts/GridView";
import { Post as PostType } from "@/types";

export default function Posts({
  user,
  view = "scroll",
}: {
  user: User;
  view?: "scroll" | "grid";
}) {
  const { data, isLoading: isLoadingPosts } =
    trpc.postRouter.loadPosts.useQuery({ userId: user.id });
  const { resetStates, toggle, toggleValue } = useUpdatePost();
  const userSession = useUser();

  if (isLoadingPosts)
    return (
      <div className="py-4 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!data) return <div className="py-4 text-center">No posts to view</div>;

  if (view === "grid")
    return <GridView posts={data as unknown as PostType[]} />;

  return (
    <div className="mt-4 grid grid-cols-1 gap-y-4">
      <Dialog
        onOpenChange={(state) => {
          if (!state) {
            resetStates();
          }
          toggle();
        }}
        open={toggleValue}
      >
        {data?.map((post, i) => (
          <Post key={post.id} {...post} index={i} user={userSession} />
        ))}
        <EditPostWindow />
      </Dialog>
    </div>
  );
}
