import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { Post } from "@prisma/client";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import type { User } from "@clerk/nextjs/dist/api";
import { privateProcedure } from "../trpc";
const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.unsafeMetadata.username as string,
    displayName: user.unsafeMetadata.displayName as string,
    profileImageUrl: user.profileImageUrl,
  };
};

const addUserDataToPosts = async (posts: Post[]) => {
  const userId = posts.map((post) => post.authorId);
  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
      limit: 110,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author) {
      console.error("AUTHOR NOT FOUND", post);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`,
      });
    }
    if (!author.username || !author.displayName) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author is missing displayName or username: ${author.id}`,
      });
    }
    return {
      post,
      author: {
        ...author,
        username: author.username ?? "(username not found)",
      },
    };
  });
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),
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

      const postsWithUser = await addUserDataToPosts(posts);
      return {
        postsWithUser,
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
});
