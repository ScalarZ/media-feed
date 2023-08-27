import { z } from "zod";
import { router } from "../trpc";
import { userRouter } from "./user";
import { postRouter } from "./post";
import { productRouter } from "./product";

export const appRouter = router({
  userRouter,
  postRouter,
  productRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
