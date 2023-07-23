import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { Post } from "@prisma/client";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { privateProcedure } from "../trpc";
import type { Like } from "@prisma/client";
import { filterUserForClient } from "../helpers/filterUserForClient";

const addUserDataToPost = async (post: Post) => {
  const userId = post.authorId;
  const user = await clerkClient.users.getUser(userId);

  // check that the user exists
  if (!user) {
    console.error("AUTHOR NOT FOUND", post);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`,
    });
  }

  const filteredUser = filterUserForClient(user);

  // check that the use has a username and display name
  if (!filteredUser.username || !filteredUser.displayName) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Author is missing displayName or username: ${user.id}`,
    });
  }

  return {
    post,
    author: {
      ...filteredUser,
    },
  };
};

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

      const postsWithUser = await Promise.all(
        posts.map((post) => addUserDataToPost(post))
      );

      // add likes
      const postsWithUserAndLikes = await Promise.all(
        postsWithUser.map(async (post) => {
          // count number of likes on post
          const likeCount = await ctx.prisma.like.count({
            where: {
              postId: post.post.id,
            },
          });
          // determimne if current user liked the post
          const findUserLike = await ctx.prisma.like.findFirst({
            where: {
              postId: post.post.id,
              userId: ctx.userId ?? "",
            },
          });

          const isLikedByUser = findUserLike ? true : false;

          // get the number of replies that the post has
          const replyCount = await ctx.prisma.reply.count({
            where: {
              postId: post.post.id,
            },
          });

          return {
            post: post.post,
            author: post.author,
            likeCount,
            isLikedByUser,
            replyCount,
          };
        })
      );

      return {
        postsWithUserAndLikes,
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
      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      const postWithUser = await addUserDataToPost(post);

      // count number of likes on post
      const likeCount = await ctx.prisma.like.count({
        where: {
          postId: postWithUser.post.id,
        },
      });

      const findUserLike: Like | null = await ctx.prisma.like.findFirst({
        where: {
          postId: postWithUser.post.id,
          userId: ctx.userId ?? "",
        },
      });

      // determimne if current user liked the post
      const isLikedByUser = findUserLike ? true : false;

      // get the number of replies that the post has
      const replyCount = await ctx.prisma.reply.count({
        where: {
          postId: postWithUser.post.id,
        },
      });

      return {
        post: postWithUser.post,
        author: postWithUser.author,
        likeCount,
        isLikedByUser,
        replyCount,
      };
    }),
});
