import React from "react";
import { Input } from "../ui/input";
import ImagePlaceHolder from "../common/ImagePlaceHolder";
import { Image as ImageIcon, Trash, XCircle } from "lucide-react";
import { Product } from "@/types";

export default function CreateProduct({
  i,
  setProducts,
}: {
  i: number;
  setProducts: (cb: (product: Product[]) => Product[]) => void;
}) {
  return (
    <div className="relative pr-2 flex gap-x-2">
      {i !== 0 && (
        <Trash
          className="absolute top-1 -right-4 z-10 text-slate-500 hover:text-rose-500 cursor-pointer"
          onClick={() => {
            setProducts((prev) => prev.filter((_, index) => index !== i));
          }}
        />
      )}
      <div className="w-24">
        <ImagePlaceHolder
          id={`product-image-${i}`}
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length) {
              setProducts((prev) => {
                prev[i].image = files[0];
                return [...prev];
              });
            }
          }}
        >
          <div className="grid place-items-center">
            <ImageIcon strokeWidth={2} size={28} />
            <h3 className="text-xs">Upload image</h3>
          </div>
        </ImagePlaceHolder>
      </div>
      <div className="flex-grow space-y-2">
        <Input
          placeholder="Add a product title (24 characters max)"
          maxLength={24}
          onChange={(e) =>
            setProducts((prev) => {
              prev[i].title = e.target.value;
              return [...prev];
            })
          }
        />
        <Input
          placeholder="Add a product link (24 characters max)"
          maxLength={24}
          onChange={(e) =>
            setProducts((prev) => {
              prev[i].link = e.target.value;
              return [...prev];
            })
          }
        />
      </div>
    </div>
  );
}
