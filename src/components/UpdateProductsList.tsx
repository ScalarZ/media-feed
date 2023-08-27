import React, { useState } from "react";
import UpdateProduct from "./UpdateProductsList/UpdateProduct";
import { CardTitle } from "./ui/card";
import { useUpdatePost } from "@/context/UpdatePostProvider";

function CreateProductsList() {
  const { products, setProducts, defaultProducts, setDefaultProducts } =
    useUpdatePost();
  return (
    <div>
      <CardTitle className="mb-2 py-2">Products</CardTitle>
      <div className="flex flex-col gap-y-3">
        {defaultProducts.map((defaultProduct, i) => (
          <UpdateProduct
            key={defaultProduct.id}
            i={i}
            defaultProduct={defaultProduct}
            setDefaultProducts={setDefaultProducts}
            setProducts={setProducts}
          />
        ))}
        {products.map((_, i) => (
          <UpdateProduct key={i} i={i} setProducts={setProducts} />
        ))}
      </div>
    </div>
  );
}

export default CreateProductsList;
