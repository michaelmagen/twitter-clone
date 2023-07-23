import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter } from "~/server/api/trpc";

import { privateProcedure, publicProcedure } from "../trpc";
import { filterUserForClient } from "../helpers/filterUserForClient";

export const replysRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        postId: z.string().nonempty(),
        content: z
          .string()
          .min(1, { message: "Reply can not be emtpy" })
          .max(255, { message: "Reply can not exceed 255 characters" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const reply = await ctx.prisma.reply.create({
          data: {
            content: input.content,
            userId: ctx.userId,
            post: {
              connect: {
                id: input.postId,
              },
            },
          },
        });
        return reply;
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not create reply",
        });
      }
    }),
  getAllInfiniteById: publicProcedure
    .input(
      z.object({
        postId: z.string().min(1, { message: "Must provide post ID" }),
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, postId } = input;
      const replys = await ctx.prisma.reply.findMany({
        where: {
          postId: postId,
        },
        take: limit + 1,
        orderBy: [{ createdAt: "desc" }],
        cursor: cursor ? { id: cursor } : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (replys.length > limit) {
        const nextItem = replys.pop(); // return the last item from the array
        nextCursor = nextItem?.id;
      }

      // add user data to reply
      const replysWithUser = await Promise.all(
        replys.map(async (reply) => {
          const userId = reply.userId;
          const user = await clerkClient.users.getUser(userId);

          // check that the user exists
          if (!user) {
            console.error("AUTHOR NOT FOUND", reply);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Author for post not found. REPLY ID: ${reply.id}, USER ID: ${reply.userId}`,
            });
          }

          const filteredUser = filterUserForClient(user);

          return {
            reply,
            author: {
              ...filteredUser,
            },
          };
        })
      );

      // ensure to handle the case where a post has 0 replys !!!!!!!!

      return {
        replysWithUser,
        nextCursor,
      };
    }),
});
