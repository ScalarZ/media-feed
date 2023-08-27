import { QueryKey, useQueryClient } from "@tanstack/react-query";

export default function useSetQueryData<T>(
  queryParams: QueryKey,
  order: "asc" | "desc" = "desc"
) {
  const queryClient = useQueryClient();

  function typeGuard(data: unknown): data is T[] {
    return !!data && typeof data === "object" && Array.isArray(data);
  }
  function setQueryData(newData: T) {
    queryClient.setQueryData(queryParams, (oldData) => {
      if (typeGuard(oldData)) {
        if (order === "desc") return [newData, ...oldData];
        return [...oldData, newData];
      }
      return oldData;
    });
  }

  return { setQueryData };
}
