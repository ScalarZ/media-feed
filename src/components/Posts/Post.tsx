import React, { useEffect, useRef } from "react";
import { useUpdatePost } from "@/context/UpdatePostProvider";
import useImageUrl from "@/hooks/useImageUrl";
import PostSettings from "./DropdownMenu";
import NextImage from "../common/Image";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { AuthUser } from "next-auth";
import type { Post, _Product } from "@/types";
import clsx from "clsx";

export default function Post({
  index,
  id: postId,
  title,
  caption,
  image: { id, url },
  product: products,
  userId,
  view,
  handleView,
  status,
  user,
}: Post & {
  index: number;
  user?: AuthUser;
  view: "scroll" | "grid";
  handleView?: (view: "scroll" | "grid") => void;
}) {
  const {
    setPostIndex,
    setPostId,
    setPostUserId,
    setPostTitle,
    setPostCaption,
    setDefaultPostImage,
    setDefaultProducts,
    setDefaultPostTitle,
    setDefaultPostCaption,
    defaultPostImage,
    defaultProducts,
    postIndex,
    setStatus,
  } = useUpdatePost();
  const imgref = useRef<HTMLImageElement>(null);
  const imageUrl = useImageUrl(url);
  async function setUpEditWindow() {
    setPostIndex(index);
    setPostId(postId);
    setPostUserId(userId);
    setPostTitle(title);
    setPostCaption(caption);
    setDefaultPostTitle(title);
    setDefaultPostCaption(caption);
    setDefaultPostImage(url);
    setDefaultProducts(() =>
      products.map(({ id, title, link, image }) => ({
        id,
        title,
        link,
        image: null,
        defaultTitle: title,
        defaultLink: link,
        defaultImage: image,
      }))
    );
    setStatus(status);
  }

  function scrollToPost() {
    if (imgref && imgref.current)
      if (index === postIndex) {
        window.scrollTo({
          top: imgref.current.getClientRects()[0].y - 40,
        });
        setPostIndex(-1);
      }
  }
  useEffect(() => {
    scrollToPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  if ((!user || user.id !== userId) && status !== "PUBLISHED") return <></>;

  return (
    <Card
      className={
        view === "scroll" ? "pb-4 w-full rounded-none" : "p-0 rounded-none"
      }
    >
      <div
        className={
          view === "grid"
            ? "relative aspect-square cursor-pointer hover:opacity-90"
            : ""
        }
      >
        <NextImage
          imgref={imgref}
          src={imageUrl}
          {...(view === "scroll"
            ? { height: 300, width: 500 }
            : { fill: true })}
          alt={title ?? "#"}
          className={view === "grid" ? "object-cover" : ""}
          onClick={() => {
            if (!handleView || view === "scroll") return;
            handleView("scroll");
            setPostIndex(index);
          }}
        />
      </div>
      {view === "scroll" ? (
        <>
          <CardContent className="pl-4 pr-3 py-2 space-y-1">
            {user?.id === userId && (
              <span
                className={clsx("text-xs", {
                  "text-muted-foreground": status === "PENDING",
                  "text-green-500": status === "PUBLISHED",
                  "text-destructive": status === "REJECTED",
                })}
              >
                {status}
              </span>
            )}
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{title}</CardTitle>
              <PostSettings
                postId={postId}
                postImage={defaultPostImage}
                products={defaultProducts}
                setUpEditWindow={setUpEditWindow}
                isUserPost={user ? user.id === userId || user.isAdmin : false}
              />
            </div>
            <p className="opacity-70">{caption}</p>
          </CardContent>
          <CardFooter className="px-4 py-0">
            {products.length ? <Products products={products} /> : null}
          </CardFooter>
        </>
      ) : null}
    </Card>
  );
}

function Products({ products }: { products: _Product[] }) {
  return (
    <div className="mt-2 w-full grid gap-y-4">
      {products.map((product) => (
        <a href={product.link ?? "#"} target="_blank" key={product.id}>
          <Product {...product} />
        </a>
      ))}
    </div>
  );
}

function Product({ id, image, title, link }: _Product) {
  const imageUrl = useImageUrl(image ?? "");
  return (
    <div className="p-2 border flex gap-x-4 hover:bg-slate-100">
      {image ? (
        <div className="relative w-16">
          <NextImage
            src={imageUrl}
            height={300}
            width={500}
            alt={id.toString()}
          />
        </div>
      ) : null}
      <div className="flex-grow space-y-2 flex items-center">
        <h3 className="font-medium">{title || link}</h3>
      </div>
    </div>
  );
}
