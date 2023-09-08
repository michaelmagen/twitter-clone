import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { privateProcedure } from "../trpc";
import { addDataToPost } from "../helpers/addDataToPost";

export const postsRouter = createTRPCRouter({
  getAllInfinite: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        orderBy: [{ createdAt: "desc" }],
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const postsWithData = await Promise.all(
        posts.map(async (post) => {
          const postWithAllData = await addDataToPost(
            post,
            ctx.prisma,
            ctx.userId
          );
          return postWithAllData;
        })
      );

      return {
        postsWithData,
        nextCursor,
      };
    }),
  getAllFollowingInfinite: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      // Find all the userId's of accounts the current user follows
      const userFollows = await ctx.prisma.follow.findMany({
        where: {
          userId: ctx.userId,
        },
      });
      const followedUserIds = userFollows.map((follow) => follow.followingId);
      // Get posts created by accounts the user follows
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        orderBy: [{ createdAt: "desc" }],
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          authorId: {
            in: followedUserIds,
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const postsWithData = await Promise.all(
        posts.map(async (post) => {
          const postWithAllData = await addDataToPost(
            post,
            ctx.prisma,
            ctx.userId
          );
          return postWithAllData;
        })
      );

      return {
        postsWithData,
        nextCursor,
      };
    }),
  getByAuthorIdInfinite: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
        authorId: z.string().nonempty(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input;
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        orderBy: [{ createdAt: "desc" }],
        cursor: cursor ? { id: cursor } : undefined,
        where: {
          authorId: input.authorId,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > limit) {
        const nextItem = posts.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      const postsWithData = await Promise.all(
        posts.map(async (post) => {
          const postWithAllData = await addDataToPost(
            post,
            ctx.prisma,
            ctx.userId
          );
          return postWithAllData;
        })
      );

      return {
        postsWithData,
        nextCursor,
      };
    }),
  create: privateProcedure
    .input(z.object({ content: z.string().min(1).max(256) }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.create({
        data: {
          content: input.content,
          authorId: ctx.userId,
        },
      });

      return post;
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.id,
        },
      });
      // throw error if no post found by that id
      if (!post) throw new TRPCError({ code: "BAD_REQUEST" });

      const postWithData = await addDataToPost(post, ctx.prisma, ctx.userId);

      return postWithData;
    }),
});
