import { useToggle } from "@/hooks/useToggle";
import { DefaultProduct, Product } from "@/types";
import { ReactNode, createContext, useContext, useState } from "react";
import { string } from "zod";

interface Context {
  postIndex: number;
  setPostIndex: (value: number) => void;
  postId: string;
  setPostId: (value: string) => void;
  postTitle: string;
  setPostTitle: (value: string) => void;
  postCaption: string;
  setDefaultPostCaption: (value: string) => void;
  defaultPostTitle: string;
  setDefaultPostTitle: (value: string) => void;
  defaultPostCaption: string;
  setPostCaption: (value: string) => void;
  postImage: File | null;
  setPostImage: (value: File | null) => void;
  products: Product[];
  setProducts: (cb: (product: Product[]) => Product[]) => void;
  deletedProducts: { id: number; image: string }[];
  setDeletedProducts: (
    cb: (
      product: { id: number; image: string }[]
    ) => { id: number; image: string }[]
  ) => void;
  defaultPostImage: string;
  setDefaultPostImage: (value: string) => void;
  defaultProducts: DefaultProduct[];
  setDefaultProducts: (
    cb: (product: DefaultProduct[]) => DefaultProduct[]
  ) => void;
  toggleValue: boolean;
  toggle: () => void;
  resetStates: () => void;
}

const context = createContext<Context | null>(null);

export default function UpdatePostProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [postIndex, setPostIndex] = useState(-1);
  const [postId, setPostId] = useState<string>("");
  const [postTitle, setPostTitle] = useState("");
  const [defaultPostTitle, setDefaultPostTitle] = useState("");
  const [postCaption, setPostCaption] = useState("");
  const [defaultPostCaption, setDefaultPostCaption] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);
  const [defaultPostImage, setDefaultPostImage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<
    { id: number; image: string }[]
  >([]);
  const [defaultProducts, setDefaultProducts] = useState<DefaultProduct[]>([]);
  const [toggleValue, toggle] = useToggle(false);

  function resetStates() {
    setPostId("");
    setPostTitle("");
    setPostCaption("");
    setPostImage(null);
    setDefaultPostTitle("");
    setDefaultPostCaption("");
    setDefaultPostImage("");
    setProducts([]);
    setDefaultProducts([]);
    setDeletedProducts([]);
  }
  return (
    <context.Provider
      value={{
        postIndex,
        setPostIndex,
        postId,
        setPostId,
        postTitle,
        setPostTitle,
        postCaption,
        setPostCaption,
        postImage,
        setPostImage,
        products,
        setProducts,
        defaultPostTitle,
        setDefaultPostTitle,
        defaultPostCaption,
        setDefaultPostCaption,
        defaultPostImage,
        setDefaultPostImage,
        deletedProducts,
        setDeletedProducts,
        defaultProducts,
        setDefaultProducts,
        toggleValue,
        toggle,
        resetStates,
      }}
    >
      {children}
    </context.Provider>
  );
}

export function useUpdatePost() {
  const store = useContext(context);
  if (!store) throw new Error("useContext must be called inside CreateContext");
  return store;
}
