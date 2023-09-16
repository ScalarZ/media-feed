import { useToggle } from "@/hooks/useToggle";
import { DefaultProduct, Product } from "@/types";
import { ReactNode, createContext, useContext, useState } from "react";
import { string } from "zod";

interface Context {
  postIndex: number;
  setPostIndex: (value: number) => void;
  postId: string;
  setPostId: (value: string) => void;
  postUserId: string;
  setPostUserId: (value: string) => void;
  postTitle: string | null;
  setPostTitle: (value: string | null) => void;
  postCaption: string | null;
  setDefaultPostCaption: (value: string | null) => void;
  defaultPostTitle: string | null;
  setDefaultPostTitle: (value: string | null) => void;
  defaultPostCaption: string | null;
  setPostCaption: (value: string | null) => void;
  postImage: File | null;
  setPostImage: (value: File | null) => void;
  products: Product[];
  setProducts: (cb: (product: Product[]) => Product[]) => void;
  deletedProducts: { id: number; image: string | null }[];
  setDeletedProducts: (
    cb: (
      product: { id: number; image: string | null }[]
    ) => { id: number; image: string | null }[]
  ) => void;
  defaultPostImage: string;
  setDefaultPostImage: (value: string) => void;
  defaultProducts: DefaultProduct[];
  setDefaultProducts: (
    cb: (product: DefaultProduct[]) => DefaultProduct[]
  ) => void;
  status: "PENDING" | "PUBLISHED" | "REJECTED";
  setStatus: (status: "PENDING" | "PUBLISHED" | "REJECTED") => void;
  toggleValue: boolean;
  toggle: () => void;
  cropImage: boolean;
  setCropImage: () => void;
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
  const [postUserId, setPostUserId] = useState<string>("");
  const [postTitle, setPostTitle] = useState<string | null>(null);
  const [defaultPostTitle, setDefaultPostTitle] = useState<string | null>(null);
  const [postCaption, setPostCaption] = useState<string | null>(null);
  const [defaultPostCaption, setDefaultPostCaption] = useState<string | null>(
    null
  );
  const [postImage, setPostImage] = useState<File | null>(null);
  const [defaultPostImage, setDefaultPostImage] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<
    { id: number; image: string | null }[]
  >([]);
  const [defaultProducts, setDefaultProducts] = useState<DefaultProduct[]>([]);
  const [status, setStatus] = useState<"PENDING" | "PUBLISHED" | "REJECTED">(
    "PENDING"
  );
  const [toggleValue, toggle] = useToggle(false);
  const [cropImage, setCropImage] = useToggle(false);

  function resetStates() {
    setPostIndex(-1);
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
        postUserId,
        setPostUserId,
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
        status,
        setStatus,
        toggle,
        cropImage,
        setCropImage,
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
