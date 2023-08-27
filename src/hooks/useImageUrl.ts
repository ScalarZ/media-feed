import { useMemo } from "react";

export default function useImageUrl(url: string) {
  return useMemo(() => `${url}?q=${Date.now()}`, [url]);
}
