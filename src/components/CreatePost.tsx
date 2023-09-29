import React from "react";
import { Input } from "./ui/input";
import ImagePlaceHolder from "./common/ImagePlaceHolder";
import { Image as ImageIcon } from "lucide-react";
import { useCreatePost } from "@/context/CreatePostProvider";

export default function CreatePost() {
  const {
    setPostTitle,
    setPostCaption,
    setPostImage,
    postImage,
    setCropImage,
  } = useCreatePost();
  return (
    <div className="flex flex-col gap-y-2">
      <div className="px-4">
        <Input
          placeholder="Add a post title (24 characters max)"
          onChange={(e) => setPostTitle(e.target.value)}
          maxLength={24}
        />
      </div>
      <ImagePlaceHolder
        id="post-image"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length) {
            setPostImage(files[0]);
          }
        }}
        postImage={postImage}
        setCropImage={setCropImage}
      >
        <div className="grid place-items-center">
          <ImageIcon strokeWidth={1} size={84} />
          <h3 className="text-xl font-semibold">Upload a post image</h3>
        </div>
      </ImagePlaceHolder>
      <div className="px-4">
        <Input
          placeholder="Add a post caption (34 characters max)"
          onChange={(e) => setPostCaption(e.target.value)}
          maxLength={34}
        />
      </div>
    </div>
  );
}
