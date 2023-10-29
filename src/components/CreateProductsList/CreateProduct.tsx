import React from "react";
import { Input } from "../ui/input";
import ImagePlaceHolder from "../common/ImagePlaceHolder";
import { Image as ImageIcon, Trash, XCircle } from "lucide-react";
import { Product } from "@/types";
import { useUser } from "@/hooks/useUser";

export default function CreateProduct({
  i,
  setProducts,
}: {
  i: number;
  setProducts: (cb: (product: Product[]) => Product[]) => void;
}) {
  const user = useUser();
  return (
    <div className="relative pr-2 flex items-center gap-x-2">
      {user?.isAdmin ? (
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
      ) : null}
      <div className="flex-grow space-y-2">
        {user?.isAdmin ? (
          <Input
            placeholder="Add a product display URL (24 characters max)"
            maxLength={24}
            onChange={(e) =>
              setProducts((prev) => {
                prev[i].title = e.target.value;
                return [...prev];
              })
            }
          />
        ) : null}
        <Input
          placeholder="Add a product URL (24 characters max)"
          onChange={(e) =>
            setProducts((prev) => {
              prev[i].link = e.target.value;
              return [...prev];
            })
          }
        />
      </div>
      {i !== 0 && (
        <Trash
          className="text-slate-500 hover:text-rose-500 cursor-pointer"
          onClick={() => {
            setProducts((prev) => prev.filter((_, index) => index !== i));
          }}
        />
      )}
    </div>
  );
}
