import React from "react";
import { Input } from "./ui/input";
import ImagePlaceHolder from "./common/ImagePlaceHolder";
import { Image as ImageIcon } from "lucide-react";
import { useUpdatePost } from "@/context/UpdatePostProvider";

export default function UpdatePost() {
  const {
    postImage,
    postTitle,
    postCaption,
    defaultPostImage,
    setPostTitle,
    setPostCaption,
    setPostImage,
    setCropImage,
  } = useUpdatePost();
  return (
    <div className="mb-4 flex flex-col gap-y-2">
      <Input
        placeholder="Add a post title"
        onChange={(e) => setPostTitle(e.target.value)}
        defaultValue={postTitle ?? ""}
      />
      <ImagePlaceHolder
        id="post-image"
        defaultUrl={!!defaultPostImage ? defaultPostImage : undefined}
        postImage={postImage}
        setCropImage={setCropImage}
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length) {
            setPostImage(files[0]);
          }
        }}
      >
        <div className="grid place-items-center">
          <ImageIcon strokeWidth={1} size={84} />
          <h3 className="text-xl font-semibold">Upload a post image</h3>
        </div>
      </ImagePlaceHolder>
      <Input
        placeholder="Add a post caption"
        onChange={(e) => setPostCaption(e.target.value)}
        defaultValue={postCaption ?? ""}
      />
    </div>
  );
}
