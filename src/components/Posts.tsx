import Post from "./Posts/Post";
import { trpc } from "@/utils/trpc";
import { Loader2 } from "lucide-react";
import EditPostWindow from "./EditPostWindow";
import { Dialog } from "./ui/dialog";
import { useUpdatePost } from "@/context/UpdatePostProvider";
import { AuthUser } from "next-auth";
import { useUser } from "@/hooks/useUser";

export default function Posts({
  user,
  view = "scroll",
  handleView,
}: {
  user: AuthUser;
  view?: "scroll" | "grid";
  handleView?: (view: "scroll" | "grid") => void;
}) {
  const loggedUser = useUser();

  const {
    data,
    isLoading: isLoadingPosts,
    refetch,
  } = trpc.postRouter.loadPosts.useQuery({ userId: user.id });
  const { resetStates, toggle, toggleValue } = useUpdatePost();

  if (isLoadingPosts)
    return (
      <div className="py-4 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!data) return <div className="py-4 text-center">No posts to view</div>;
  return (
    <div
      className={`mt-4 grid ${
        view === "scroll" ? " grid-cols-1 gap-y-4" : " grid-cols-2 gap-1"
      }`}
    >
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
          <Post
            key={post.id}
            {...post}
            index={i}
            user={loggedUser}
            view={view}
            handleView={handleView}
          />
        ))}
        <EditPostWindow refetch={refetch} />
      </Dialog>
    </div>
  );
}
