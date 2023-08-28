import React, { ChangeEvent } from "react";
import { Label } from "../ui/label";
import Image, { ImageLoaderProps } from "next/image";
import { useUploadImage } from "@/hooks/useUploadImage";
// import { Upload, } from "lucide-react";
import useImageUrl from "@/hooks/useImageUrl";

export default function ImagePlaceHolder({
  id,
  index,
  defaultUrl,
  children,
  onChange,
}: {
  id: string;
  index?: number;
  defaultUrl?: string;
  children: React.ReactNode;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  const { url, handleOnChange, removeImage } = useUploadImage(index);
  const imageUrl = useImageUrl(defaultUrl || "");

  return (
    <div
      className={`overflow-hidden relative w-full aspect-square border rounded${
        !url && "opacity-60 hover:opacity-100"
      }`}
    >
      {!!url || defaultUrl ? (
        <>
          <Label
            htmlFor={id}
            className="absolute inset-0 grid place-items-center place-content-center cursor-pointer"
          >
            {/* <Upload className="absolute top-1 right-1 z-10 text-slate-500 hover:text-blue-500 cursor-pointer" /> */}
          </Label>
          <Image
            loader={({ src }: ImageLoaderProps) => src}
            src={url || imageUrl}
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
