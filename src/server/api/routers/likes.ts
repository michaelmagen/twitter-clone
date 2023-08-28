import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter } from "~/server/api/trpc";

import { privateProcedure } from "../trpc";

export const likesRouter = createTRPCRouter({
  create: privateProcedure
    .input(z.object({ postId: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const like = await ctx.prisma.like.create({
          data: {
            userId: ctx.userId,
            post: {
              connect: {
                id: input.postId,
              },
            },
          },
        });
        return like;
      } catch (e) {
        console.log(e);
        throw new TRPCError({ code: "BAD_REQUEST", message: "Error" });
      }
    }),
  delete: privateProcedure
    .input(z.object({ postId: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.like.delete({
          where: {
            postId_userId: {
              postId: input.postId,
              userId: ctx.userId,
            },
          },
        });
        return;
      } catch (e) {
        console.log(e);
        throw new TRPCError({ code: "BAD_REQUEST", message: "Error" });
      }
    }),
});
