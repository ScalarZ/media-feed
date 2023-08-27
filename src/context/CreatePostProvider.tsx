import { useToggle } from "@/hooks/useToggle";
import { Product } from "@/types";
import { ReactNode, createContext, useContext, useState } from "react";

interface Context {
  postTitle: string;
  setPostTitle: (value: string) => void;
  postCaption: string;
  setPostCaption: (value: string) => void;
  postImage: File | null;
  setPostImage: (value: File | null) => void;
  products: Product[];
  setProducts: (cb: (product: Product[]) => Product[]) => void;
  toggleValue: boolean;
  toggle: () => void;
  resetStates: () => void;
}

const context = createContext<Context | null>(null);

export default function CreatePostProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [postTitle, setPostTitle] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([
    { title: "", image: null, link: "" },
  ]);
  const [toggleValue, toggle] = useToggle(false);
  function resetStates() {
    setPostTitle("");
    setPostCaption("");
    setPostImage(null);
    setProducts([]);
  }
  return (
    <context.Provider
      value={{
        postTitle,
        setPostTitle,
        postCaption,
        setPostCaption,
        postImage,
        setPostImage,
        products,
        setProducts,
        toggleValue,
        toggle,
        resetStates,
      }}
    >
      {children}
    </context.Provider>
  );
}

export function useCreatePost() {
  const store = useContext(context);
  if (!store) throw new Error("useContext must be called inside CreateContext");
  return store;
}
