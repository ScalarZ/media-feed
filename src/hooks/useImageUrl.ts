import { useMemo } from "react";

export default function useImageUrl(url: string, args?: any[]) {
  return useMemo(() => `${url}?q=${Date.now()}`, [url, ...(args ? args : [])]);
}
