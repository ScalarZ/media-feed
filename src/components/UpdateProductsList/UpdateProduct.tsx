import React from "react";
import { Input } from "../ui/input";
import ImagePlaceHolder from "../common/ImagePlaceHolder";
import { Image as ImageIcon, Trash } from "lucide-react";
import { DefaultProduct, Product } from "@/types";
import { useUpdatePost } from "@/context/UpdatePostProvider";
import { useUser } from "@/hooks/useUser";

export default function UpdateProduct({
  defaultProduct,
  i,
  setProducts,
  setDefaultProducts,
}: {
  defaultProduct?: DefaultProduct;
  i: number;
  setProducts: (cb: (product: Product[]) => Product[]) => void;
  setDefaultProducts?: (
    cb: (product: DefaultProduct[]) => DefaultProduct[]
  ) => void;
}) {
  const { products, defaultProducts, setDeletedProducts } = useUpdatePost();
  const user = useUser();
  return (
    <div className="relative pr-2 flex items-center gap-x-2">
      {user?.isAdmin ? (
        <div className="w-24">
          <ImagePlaceHolder
            id={`product-image-${(Math.random() * 36).toString(36)}`}
            index={i}
            defaultUrl={defaultProduct?.defaultImage || ""}
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length) {
                setDefaultProducts
                  ? setDefaultProducts((prev) => {
                      prev[i].image = files[0];
                      return [...prev];
                    })
                  : setProducts((prev) => {
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
            placeholder="Add a product title (34 character max)"
            maxLength={34}
            onChange={(e) =>
              setDefaultProducts
                ? setDefaultProducts((prev) => {
                    prev[i].title = e.target.value;
                    return [...prev];
                  })
                : setProducts((prev) => {
                    prev[i].title = e.target.value;
                    return [...prev];
                  })
            }
            defaultValue={defaultProduct?.title ?? ""}
          />
        ) : null}
        <Input
          placeholder="Add a product link (34 character max)"
          maxLength={34}
          onChange={(e) =>
            setDefaultProducts
              ? setDefaultProducts((prev) => {
                  prev[i].link = e.target.value;
                  return [...prev];
                })
              : setProducts((prev) => {
                  prev[i].link = e.target.value;
                  return [...prev];
                })
          }
          defaultValue={defaultProduct?.link}
        />
      </div>
      {i !== 0 || defaultProducts.length ? (
        <Trash
          className="z-10 text-slate-500 hover:text-rose-500 cursor-pointer"
          onClick={() => {
            if (defaultProducts.length <= 1 && products.length < 1) {
              setProducts(() => [{ title: "", link: "", image: null }]);
            }
            if (setDefaultProducts && defaultProduct) {
              setDefaultProducts((prev) =>
                prev.filter((_, index) => index !== i)
              );
              setDeletedProducts((prev) => [
                ...prev,
                { id: defaultProduct.id, image: defaultProduct.defaultImage },
              ]);
            } else {
              setProducts((prev) => prev.filter((_, index) => index !== i));
            }
          }}
        />
      ) : null}
    </div>
  );
}
