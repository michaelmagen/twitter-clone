import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { privateProcedure } from "../trpc";

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
});
