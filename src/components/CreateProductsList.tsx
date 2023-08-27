import React, { useState } from "react";
import CreateProduct from "./CreateProductsList/CreateProduct";
import { CardTitle } from "./ui/card";
import { useCreatePost } from "@/context/CreatePostProvider";

function CreateProductsList() {
  const { products, setProducts } = useCreatePost();
  return (
    <div>
      <CardTitle className="mb-2 py-2">Products</CardTitle>
      <div className="flex flex-col gap-y-3">
        {products.map((_, i) => (
          <CreateProduct key={i} i={i} setProducts={setProducts} />
        ))}
      </div>
    </div>
  );
}

export default CreateProductsList;
