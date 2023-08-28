import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { findUserFromClerk } from "../helpers/findUserFromClerk";
import { attachFollowData } from "../helpers/attachFollowData";

export const profilesRouter = createTRPCRouter({
  getProfileById: publicProcedure
    .input(z.object({ userId: z.string().nonempty() }))
    .query(async ({ ctx, input }) => {
      const userWithNoFollowData = await findUserFromClerk(input.userId);
      const userProfile = await attachFollowData(
        userWithNoFollowData,
        ctx.prisma,
        ctx.userId
      );
      return userProfile;
    }),
});
