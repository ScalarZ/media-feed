import { AuthUser } from "next-auth";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useUser() {
  const { data } = useSession();
  return useMemo(() => {
    const user = data?.user as AuthUser | undefined;
    return user && user.isEmailVerified ? user : undefined;
  }, [data]);
}
