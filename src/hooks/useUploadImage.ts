import { useUpdatePost } from "@/context/UpdatePostProvider";
import { ChangeEvent, useState } from "react";

export function useUploadImage(index?: number) {
  const { setDefaultPostImage, setDefaultProducts } = useUpdatePost();
  const [url, setUrl] = useState<string>();
  const [file, setFile] = useState<File>();

  function handleOnChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length) {
      setUrl(URL.createObjectURL(files[0]));
      setFile(files[0]);
    }
  }

  function removeImage() {
    if (typeof index === "number") {
      setDefaultProducts((prev) => {
        prev[index].image = null;
        return [...prev];
      });
    } else {
      setDefaultPostImage("");
    }
    setUrl(undefined);
    setFile(undefined);
  }

  return { url, file, handleOnChange, removeImage };
}
