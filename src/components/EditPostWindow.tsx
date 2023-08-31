import { useMemo, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { getImageUrl } from "@/utils/getImageUrl";
import { handleError } from "@/utils/handleError";
import { trpc } from "@/utils/trpc";
import { deleteImage, updateImage, uploadImage } from "@/utils/uploadImage";
import { Loader2, X } from "lucide-react";
import UpdatePost from "./UpdatePost";
import Divider from "./common/Divider";
import UpdateProductsList from "./UpdateProductsList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { useUpdatePost } from "@/context/UpdatePostProvider";
import { useToast } from "./ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Post, _Product } from "@/types";
import getLoadPostsQueryParams from "@/QueryParams/getLoadPostsQueryParams";

type AddedProduct = {
  title: string;
  link: string;
  image: string;
};
type UpdatedProduct = {
  id: number;
  title: string;
  link: string;
  image: string;
};

function isPostList(data: unknown): data is Post[] {
  return !!data && typeof data === "object" && Array.isArray(data);
}

export default function CreatePostWindow() {
  const user = useUser();
  const { toast } = useToast();
  const {
    postIndex,
    postId,
    postTitle,
    postCaption,
    postImage,
    setProducts,
    products,
    defaultPostTitle,
    defaultPostCaption,
    defaultPostImage,
    defaultProducts,
    deletedProducts,
    toggle,
    resetStates,
  } = useUpdatePost();
  const queryClient = useQueryClient();
  const { mutate: updatePost } = trpc.postRouter.updatePost.useMutation();
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);

  const loadPostsQueryParams = useMemo(
    () => getLoadPostsQueryParams(user),
    [user]
  );
  function checkForEmptyInputs() {
    return (
      !user ||
      !postId ||
      (!postImage && !defaultPostImage) ||
      (!!products.length && products.some(({ link }) => !link)) ||
      (!!defaultProducts.length && defaultProducts.some(({ link }) => !link))
    );
  }
  async function handleUpdatePost() {
    if (checkForEmptyInputs()) {
      toast({
        description: "Please fill in all the fields",
        className: "text-destructive",
      });
      return;
    }
    setIsUpdatingPost(true);
    //updating/inserting images
    const res = await Promise.all([
      !!postImage
        ? updateImage("posts", postImage, defaultPostImage)
        : undefined,
      ...defaultProducts.map(({ image, defaultImage }) => {
        if (!image || !defaultImage) return;
        return updateImage("products", image, defaultImage);
      }),
      ...products.map(({ image }) => {
        if (!image) return;
        return uploadImage("products", image, `${Date.now()}-${image.name}`);
      }),
      deleteImage(
        "products",
        deletedProducts.map(({ image }) => image)
      ),
    ]);
    const updatedImage = getImageUrl("posts", res[0]?.data?.path);
    // checking for any product updates whether on title, link or image
    let updatedProducts = defaultProducts
      .map(
        ({ id, title, link, defaultTitle, defaultLink, defaultImage }, i) => {
          if (!res[i + 1] && title === defaultTitle && link === defaultLink)
            return;
          return {
            id,
            title,
            link,
            image:
              getImageUrl("products", res[i + 1]?.data?.path) ?? defaultImage,
          };
        }
      )
      .filter((product) => product !== undefined);
    const addedProducts = products
      .map(({ title, link }, i) => {
        if (!res[i + 1 + defaultProducts.length]) return;
        return {
          title,
          link,
          image:
            getImageUrl(
              "products",
              res[i + 1 + defaultProducts.length]?.data?.path
            ) ?? "",
        };
      })
      .filter((product) => product !== undefined);

    updatePost(
      {
        postId,
        postTitle: postTitle !== defaultPostTitle ? postTitle : undefined,
        postCaption:
          postCaption !== defaultPostCaption ? postCaption : undefined,
        postImage: updatedImage,
        userId: user?.id!,
        addedProducts: addedProducts.length
          ? (addedProducts as AddedProduct[])
          : undefined,
        updatedProducts: updatedProducts.length
          ? (updatedProducts as UpdatedProduct[])
          : undefined,
        deletedProducts: deletedProducts.length ? deletedProducts : undefined,
      },
      {
        onSuccess: async ({ message }) => {
          await queryClient.invalidateQueries({
            queryKey: loadPostsQueryParams,
          });
          toast({
            description: message,
            className: "text-green-500",
          });
          resetStates();
          toggle();
          setIsUpdatingPost(false);
        },
        onError: handleError,
      }
    );
  }

  return (
    <DialogContent className="overflow-y-auto h-screen max-w-md">
      <DialogHeader>
        <div className="flex justify-between items-center">
          <DialogTitle>Create poste</DialogTitle>
        </div>
      </DialogHeader>
      <UpdatePost />
      <Divider />
      <UpdateProductsList />
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
              onClick={handleUpdatePost}
            >
              {isUpdatingPost ? (
                <>
                  Updating
                  <Loader2
                    strokeWidth={2.5}
                    size={14}
                    className="animate-spin"
                  />
                </>
              ) : (
                <>Update</>
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
