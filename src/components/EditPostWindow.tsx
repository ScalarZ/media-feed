import { Dispatch, SetStateAction, useMemo, useState } from "react";
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
import clsx from "clsx";
import { DataPost } from "@/pages/admin-portal/posts";
import EditImageCropper from "./EditImageCropper";

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

export default function EditPostWindow({
  setData,
  refetch,
}: {
  setData?: Dispatch<SetStateAction<DataPost[]>>;
  refetch?: () => void;
}) {
  const user = useUser();
  const { toast } = useToast();
  const {
    postIndex,
    postUserId,
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
    status,
    cropImage,
  } = useUpdatePost();
  const queryClient = useQueryClient();
  const { mutate: updatePost } = trpc.postRouter.updatePost.useMutation();
  const { mutate: updateStatus, isLoading: isUpdatingStatus } =
    trpc.postRouter.updateStatus.useMutation();
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [updatedStatus, setUpdatedStatus] = useState<
    "PENDING" | "PUBLISHED" | "REJECTED"
  >("PENDING");
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
        postTitle:
          postTitle && postTitle !== defaultPostTitle ? postTitle : undefined,
        postCaption:
          postCaption && postCaption !== defaultPostCaption
            ? postCaption
            : undefined,
        postImage: updatedImage,
        userId: postUserId,
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
          if (refetch) {
            refetch();
          }
          toast({
            description: message,
            className: "text-green-500",
          });
          toggle();
          resetStates();
        },
        onError: handleError,
        onSettled: () => setIsUpdatingPost(false),
      }
    );
  }
  function handleUpdateStatus(status: "PENDING" | "PUBLISHED" | "REJECTED") {
    setUpdatedStatus(status);
    updateStatus(
      {
        postId,
        status,
      },
      {
        onSuccess: async ({ message }) => {
          toast({
            description: message,
          });
          resetStates();
          toggle();
          if (setData)
            setData((prev) => {
              prev[postIndex].status = status;
              return [...prev];
            });
          if (refetch) {
            refetch();
          }
        },
        onError: handleError,
        onSettled: () => setUpdatedStatus("PUBLISHED"),
      }
    );
  }
  return cropImage ? (
    <DialogContent className="px-0 overflow-y-auto h-screen max-w-md flex flex-col gap-y-2">
      <DialogTitle className="px-4">Crop Image</DialogTitle>
      <EditImageCropper />
    </DialogContent>
  ) : (
    <DialogContent className="overflow-y-auto h-screen max-w-md">
      <DialogHeader>
        <div className="flex justify-between items-center">
          <DialogTitle>Edit post</DialogTitle>
          <span
            className={clsx("px-4 text-sm", {
              "text-green-500": status === "PUBLISHED",
              "text-destructive": status === "REJECTED",
            })}
          >
            {status}
          </span>
        </div>
        {user?.isAdmin && (
          <div className="w-full flex justify-center gap-x-2">
            <Button
              className="bg-destructive flex items-center gap-x-1 hover:bg-red-600"
              onClick={() => handleUpdateStatus("REJECTED")}
              disabled={status === "REJECTED"}
            >
              {updatedStatus === "REJECTED" && isUpdatingStatus ? (
                <>
                  Rejecting
                  <Loader2
                    strokeWidth={2.5}
                    size={14}
                    className="animate-spin"
                  />
                </>
              ) : (
                <>Reject</>
              )}
            </Button>
            <Button
              className="bg-green-500 flex items-center gap-x-1 hover:bg-green-600"
              onClick={() => handleUpdateStatus("PUBLISHED")}
              disabled={status === "PUBLISHED"}
            >
              {updatedStatus === "PUBLISHED" && isUpdatingStatus ? (
                <>
                  Publishing
                  <Loader2
                    strokeWidth={2.5}
                    size={14}
                    className="animate-spin"
                  />
                </>
              ) : (
                <>Publish</>
              )}
            </Button>
          </div>
        )}
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
