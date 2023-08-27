import Link from "next/link";
import React from "react";
import { useUpdatePost } from "@/context/UpdatePostProvider";
import useImageUrl from "@/hooks/useImageUrl";
import PostSettings from "./DropdownMenu";
import { User } from "@/schema";
import NextImage from "../common/Image";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Post, _Product } from "@/types";

export default function Post({
  index,
  id: postId,
  title,
  caption,
  image: { id, url },
  product: products,
  userId,
  user,
}: Post & { index: number; user?: User }) {
  const {
    setPostIndex,
    setPostId,
    setPostTitle,
    setPostCaption,
    setDefaultPostImage,
    setDefaultProducts,
    setDefaultPostTitle,
    setDefaultPostCaption,
    defaultPostImage,
    defaultProducts,
  } = useUpdatePost();
  const imageUrl = useImageUrl(url);
  async function setUpEditWindow() {
    setPostIndex(index);
    setPostId(postId);
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
  }

  return (
    <Card className="w-full rounded-none">
      <NextImage src={imageUrl} height={300} width={500} alt={title} />
      <CardContent className="pl-4 pr-3 py-2 space-y-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          <PostSettings
            postId={postId}
            postImage={defaultPostImage}
            products={defaultProducts}
            setUpEditWindow={setUpEditWindow}
            isUserPost={user ? user.id === userId : false}
          />
        </div>
        <p>{caption}</p>
      </CardContent>
      <CardFooter className="px-4 py-0">
        {products.length ? <Products products={products} /> : null}
      </CardFooter>
    </Card>
  );
}

function Products({ products }: { products: _Product[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="mt-2 pt-0 hover:no-underline">
          Products
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-y-4">
            {products.map((product) => (
              <a href={product.link ?? "#"} target="_blank" key={product.id}>
                <Product {...product} />
              </a>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function Product({ id, image, title }: _Product) {
  const imageUrl = useImageUrl(image ?? "");
  return (
    <div className="p-2 border flex gap-x-4 hover:bg-slate-100">
      <div className="relative w-16">
        <NextImage
          src={imageUrl}
          height={300}
          width={500}
          alt={id.toString()}
        />
      </div>
      <div className="flex-grow space-y-2 flex items-center">
        <h3 className="font-medium">{title}</h3>
      </div>
    </div>
  );
}
