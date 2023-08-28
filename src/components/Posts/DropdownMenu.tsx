import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// import { Edit, Loader2, MoreVertical, Trash2 } from "lucide-react";
import { DialogTrigger } from "../ui/dialog";
import { trpc } from "@/utils/trpc";
import { handleError } from "@/utils/handleError";
import { useToast } from "../ui/use-toast";
import { useToggle } from "@/hooks/useToggle";
import { Button } from "../ui/button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultProduct } from "@/types";
import { deleteImage } from "@/utils/uploadImage";

export default function PostSettings({
  postId,
  postImage,
  products,
  setUpEditWindow,
  isUserPost,
}: {
  postId: string;
  postImage: string;
  products: DefaultProduct[];
  isUserPost: boolean;
  setUpEditWindow: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate: deletePost } = trpc.postRouter.deletePost.useMutation();
  const [value, toggle] = useToggle();
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  function handleDeletePost() {
    setIsDeletingPost(true);
    Promise.all([
      deleteImage("posts", [postImage]),
      deleteImage(
        "products",
        products.map(({ defaultImage }) => defaultImage)
      ),
    ]);
    deletePost(
      { postId },
      {
        onError: (err) => handleError(err),
        onSuccess: async ({ message }) => {
          await queryClient.invalidateQueries();
          toast({
            description: message,
            className: "text-destructive",
          });
          toggle();
        },
        onSettled: () => setIsDeletingPost(false),
      }
    );
  }

  if (!isUserPost) return <></>;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {/* <MoreVertical className="cursor-pointer" /> */}
      </DropdownMenuTrigger>
      <AlertDialog open={value} onOpenChange={toggle}>
        <DropdownMenuContent side="left" className="p-2">
          <DialogTrigger asChild>
            <DropdownMenuItem
              className="flex items-center gap-x-2 cursor-pointer"
              onClick={setUpEditWindow}
            >
              <span className="text-base">Edit</span>
              {/* <Edit size={18} /> */}
            </DropdownMenuItem>
          </DialogTrigger>
          <AlertDialogTrigger className="w-full">
            <DropdownMenuItem
              className="flex items-center gap-x-2 cursor-pointer text-destructive"
              onClick={setUpEditWindow}
            >
              <span className="text-base">Delete</span>
              {/* <Trash2 size={18} /> */}
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
        <Alert handleDeletePost={handleDeletePost} isLoading={isDeletingPost} />
      </AlertDialog>
    </DropdownMenu>
  );
}

function Alert({
  isLoading,
  handleDeletePost,
}: {
  isLoading: boolean;
  handleDeletePost: () => void;
}) {
  return (
    <>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this post?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant={"destructive"}
            className="flex items-center gap-x-1"
            onClick={handleDeletePost}
          >
            {isLoading ? (
              <>
                Deleting
                {/* <Loader2 strokeWidth={2.5} size={14} className="animate-spin" /> */}
              </>
            ) : (
              <>Delete</>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </>
  );
}
