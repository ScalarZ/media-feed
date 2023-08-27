import { useQueryClient } from "@tanstack/react-query";

export default function useInvalidateQueries() {
  const { invalidateQueries } = useQueryClient();
  return { invalidateQueries };
}
