import React, { ChangeEvent, useMemo } from "react";
import { Label } from "../ui/label";
import Image, { ImageLoaderProps } from "next/image";
import { useUploadImage } from "@/hooks/useUploadImage";
import { Crop, Upload } from "lucide-react";
import useImageUrl from "@/hooks/useImageUrl";

export default function ImagePlaceHolder({
  id,
  index,
  defaultUrl,
  children,
  onChange,
  postImage,
  setCropImage,
}: {
  id: string;
  index?: number;
  defaultUrl?: string;
  postImage?: File | null;
  children: React.ReactNode;
  setCropImage?: () => void;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const { url, handleOnChange, removeImage } = useUploadImage(index);
  const imageUrl = useImageUrl(defaultUrl || "");
  const croppedImageUrl = useMemo(
    () => (postImage ? URL.createObjectURL(postImage) : ""),
    [postImage]
  );

  return (
    <div
      className={`overflow-hidden relative w-full aspect-square border rounded${
        !url && "opacity-60 hover:opacity-100"
      }`}
    >
      {!!url || !!croppedImageUrl || defaultUrl ? (
        <>
          <Label
            htmlFor={id}
            className="absolute inset-0 grid place-items-center place-content-center cursor-pointer"
          >
            <Upload className="absolute top-1 right-1 p-1 z-10 text-slate-500 bg-white hover:text-blue-500 cursor-pointer box-content" />
          </Label>

          {setCropImage ? (
            <Crop
              className="absolute top-1 left-1 p-1 z-10 text-slate-500 bg-white hover:text-blue-500 cursor-pointer box-content"
              onClick={setCropImage}
            />
          ) : null}
          <Image
            loader={({ src }: ImageLoaderProps) => src}
            src={url || croppedImageUrl || imageUrl}
            fill
            alt={url || defaultUrl || "#"}
            className="object-cover"
            unoptimized
          />
        </>
      ) : (
        <Label
          htmlFor={id}
          className="absolute inset-0 grid place-items-center place-content-center cursor-pointer"
        >
          {children}
        </Label>
      )}
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={(e) => {
          handleOnChange(e);
          if (onChange) onChange(e);
        }}
        hidden={true}
        className="absolute opacity-0"
      />
    </div>
  );
}
