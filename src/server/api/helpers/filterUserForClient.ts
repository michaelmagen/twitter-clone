import type { User } from "@clerk/nextjs/dist/api";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.unsafeMetadata.username as string,
    displayName: user.unsafeMetadata.displayName as string,
    profileImageUrl: user.profileImageUrl,
  };
};
