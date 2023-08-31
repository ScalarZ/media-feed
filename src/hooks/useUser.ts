import { AuthUser } from "next-auth";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useUser() {
  const { data } = useSession();
  const user = useMemo(() => data?.user, [data]) as AuthUser | undefined;
  return user;
}
