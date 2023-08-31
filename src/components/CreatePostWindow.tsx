import { useMemo, useState } from "react";
import { useCreatePost } from "@/context/CreatePostProvider";
import { useUser } from "@/hooks/useUser";
import { getImageUrl } from "@/utils/getImageUrl";
import { handleError } from "@/utils/handleError";
import { trpc } from "@/utils/trpc";
import { uploadImage } from "@/utils/uploadImage";
import { Loader2, X } from "lucide-react";
import CreatePost from "./CreatePost";
import Divider from "./common/Divider";
import CreateProductsList from "./CreateProductsList";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import getLoadPostsQueryParams from "@/QueryParams/getLoadPostsQueryParams";

export default function CreatePostWindow() {
  const user = useUser();

  const { toast } = useToast();
  const {
    postTitle,
    postCaption,
    postImage,
    products,
    setProducts,
    toggleValue,
    toggle,
    resetStates,
  } = useCreatePost();
  const { mutate: createPost } = trpc.postRouter.createPost.useMutation();
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  const loadPostsQueryParams = useMemo(
    () => getLoadPostsQueryParams(user),
    [user]
  );

  // const { setQueryData } = useSetQueryData<Post>(loadPostsQueryParams);
  const queryClient = useQueryClient();

  function checkForEmptyInputs() {
    return !user || !postImage || products.some(({ link }) => !link);
  }

  async function handleCreatePost() {
    if (checkForEmptyInputs()) {
      toast({
        description: "Please fill in all the fields",
        className: "text-destructive",
      });
      return;
    }
    setIsCreatingPost(true);
    try {
      const res = await Promise.all([
        uploadImage("posts", postImage!, `${Date.now()}-${postImage!.name}`),
        ...products.map(({ image }) => {
          if (!image) return { data: null, error: null };
          return uploadImage("products", image, `${Date.now()}-${image?.name}`);
        }),
      ]);

      if (res[0].error) throw res[0].error;

      const productsList = products.map(({ title, link }, i) => ({
        title,
        link,
        image: getImageUrl("products", res[i + 1].data?.path) ?? "",
      }));

      createPost(
        {
          userId: user!.id,
          postTitle,
          postCaption,
          postImage: getImageUrl("posts", res[0].data?.path) ?? "",
          products: productsList,
          createdAt: Date.now(),
        },
        {
          onError: ({ message }) => console.log(message),
          onSuccess: ({ message }) => {
            setIsCreatingPost(false);
            queryClient.invalidateQueries({ queryKey: loadPostsQueryParams });
            toast({
              description: message,
              className: "text-green-500",
            });
            resetStates();
            toggle();
          },
        }
      );
    } catch (err) {
      handleError(err);
      setIsCreatingPost(false);
    }
  }

  return (
    <Dialog open={toggleValue} onOpenChange={toggle}>
      <DialogTrigger asChild>
        <Button>Create post</Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-scroll h-screen max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Create poste</DialogTitle>
          </div>
        </DialogHeader>
        <CreatePost />
        <Divider />
        <CreateProductsList />
        <DialogFooter>
          <div className="w-full flex justify-between">
            <Button
              variant="outline"
              onClick={() =>
                setProducts((prev) => [
                  ...prev,
                  { title: "", link: "", image: null },
                ])
              }
            >
              Add product
            </Button>
            <div className="flex gap-x-2">
              <DialogClose className="justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-primary-foreground hover:bg-destructive/90 h-10 px-4 py-2 flex items-center gap-x-1">
                Cancel
              </DialogClose>
              <Button
                className="flex items-center gap-x-1"
                onClick={handleCreatePost}
              >
                {isCreatingPost ? (
                  <>
                    Creating
                    <Loader2
                      strokeWidth={2.5}
                      size={14}
                      className="animate-spin"
                    />
                  </>
                ) : (
                  <>Create</>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
