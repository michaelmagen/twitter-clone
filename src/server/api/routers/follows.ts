import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { privateProcedure } from "../trpc";

export const followsRouter = createTRPCRouter({
  getFollowers: publicProcedure
    .input(z.object({ userId: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      // get all the follows that follow the input user
      const follows = await ctx.prisma.follow.findMany({
        where: {
          followingId: input.userId,
        },
      });

      return follows;
    }),
  getFollowing: publicProcedure
    .input(z.object({ userId: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      // get all the input user if following
      const follows = await ctx.prisma.follow.findMany({
        where: {
          userId: input.userId,
        },
      });

      return follows;
    }),
  create: privateProcedure
    .input(z.object({ followingId: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      // ensure that user can not follow themselves
      if (input.followingId === ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User can not follow themselves",
        });
      }

      try {
        const follow = await ctx.prisma.follow.create({
          data: {
            userId: ctx.userId,
            followingId: input.followingId,
          },
        });
        return follow;
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to follow",
        });
      }
    }),
  delete: privateProcedure
    .input(z.object({ followingId: z.string().nonempty() }))
    .mutation(async ({ ctx, input }) => {
      // ensure that user can not follow themselves
      if (input.followingId === ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User can not follow themselves",
        });
      }

      try {
        const follow = await ctx.prisma.follow.delete({
          where: {
            userId_followingId: {
              userId: ctx.userId,
              followingId: input.followingId,
            },
          },
        });
        return follow;
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to unfollow",
        });
      }
    }),
});
