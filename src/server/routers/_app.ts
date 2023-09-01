import { router } from "../trpc";
import { userRouter } from "./user";
import { postRouter } from "./post";

export const appRouter = router({
  userRouter,
  postRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
