import { AuthUser } from "next-auth";

export default function getLoadPostsQueryParams(user?: AuthUser) {
  return [
    ["postRouter", "loadPosts"],
    {
      input: { userId: user?.id },
      type: "query",
    },
  ];
}
