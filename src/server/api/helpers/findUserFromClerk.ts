import clerkClient from "@clerk/clerk-sdk-node";
import { TRPCError } from "@trpc/server";
import type { User } from "@clerk/nextjs/dist/api";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.unsafeMetadata.username as string,
    displayName: user.unsafeMetadata.displayName as string,
    profileImageUrl: user.profileImageUrl,
  };
};

export type AuthorWithNoFollowingData = ReturnType<typeof filterUserForClient>;

export const findUserFromClerk = async (userId: string) => {
  const user = await clerkClient.users.getUser(userId);

  // check that the user exists
  if (!user) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `User not found`,
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

  return filteredUser;
};
