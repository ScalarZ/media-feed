import { User } from "@/schema";

export default function getLoadPostsQueryParams(user?: User) {
  return [
    ["postRouter", "loadPosts"],
    {
      input: { userId: user?.id },
      type: "query",
    },
  ];
}
