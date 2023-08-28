import { createTRPCRouter } from "~/server/api/trpc";
import { postsRouter } from "./routers/posts";
import { likesRouter } from "./routers/likes";
import { replysRouter } from "./routers/replys";
import { followsRouter } from "./routers/follows";
import { profilesRouter } from "./routers/profiles";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  likes: likesRouter,
  replys: replysRouter,
  follows: followsRouter,
  profiles: profilesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
