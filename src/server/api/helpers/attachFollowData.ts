import type { MyPrismaClient, UserID } from "./addDataToPost";
import type { AuthorWithNoFollowingData } from "./findUserFromClerk";

export const attachFollowData = async (
  author: AuthorWithNoFollowingData,
  prisma: MyPrismaClient,
  userId: UserID
) => {
  // get the amount of follower the post author has
  const authorFollowerCount = await prisma.follow.count({
    where: {
      followingId: author.id,
    },
  });

  // get the count of how many profiles the post author has
  const authorFollowingCount = await prisma.follow.count({
    where: {
      userId: author.id,
    },
  });

  // determine if current user is following post author
  const findUserFollow = await prisma.follow.findFirst({
    where: {
      userId: userId ?? "",
      followingId: author.id,
    },
  });
  const isFollowingAuthor = findUserFollow ? true : false;

  // create author object that contains follow data
  const authorWithFollowingData = {
    ...author,
    followers: authorFollowerCount,
    following: authorFollowingCount,
    isFollowing: isFollowingAuthor,
  };

  return authorWithFollowingData;
};
