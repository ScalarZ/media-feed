import { Post, _Product } from "@/types";
import NextImage from "../common/Image";
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogContent,
} from "../ui/dialog";
import { useState } from "react";
import useImageUrl from "@/hooks/useImageUrl";
import { DialogClose } from "@radix-ui/react-dialog";

export default function GridView({ posts }: { posts: Post[] }) {
  const [post, setPost] = useState<Post>();
  return (
    <Dialog>
      <div className="mt-4 grid grid-cols-2 gap-1">
        {posts.map((post) => (
          <DialogTrigger key={post.id} onClick={() => setPost(post)}>
            <div className="relative aspect-square cursor-pointer hover:opacity-90">
              <NextImage
                src={post.image.url}
                alt={post.title ?? "#"}
                fill={true}
                className="object-cover"
              />
            </div>
          </DialogTrigger>
        ))}
      </div>
      {post && <PostView post={post} />}
    </Dialog>
  );
}

function PostView({
  post: { title, image, caption, product: products },
}: {
  post: Post;
}) {
  return (
    <DialogContent className="overflow-y-auto px-0 py-4 h-screen border-none flex flex-col">
      <DialogHeader className="px-4 py-2">
        <div className="flex justify-between items-center">
          <DialogTitle>{title}</DialogTitle>
        </div>
      </DialogHeader>
      <NextImage src={image.url} height={300} width={600} alt={title ?? "#"} />
      <p className="px-4">{caption}</p>
      <div className="px-4 flex-grow">
        {products.map((product) => (
          <a href={product.link ?? "#"} target="_blank" key={product.id}>
            <Product {...product} />
          </a>
        ))}
      </div>
      <div className="flex justify-center">
        <DialogClose className="justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-primary-foreground hover:bg-destructive/90 h-10 px-4 py-2 flex items-center gap-x-1">
          Close
        </DialogClose>
      </div>
    </DialogContent>
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
