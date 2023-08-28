import type { PrismaClient, Prisma } from "@prisma/client";
import type { Post, Like } from "@prisma/client";
import { attachFollowData } from "./attachFollowData";
import { findUserFromClerk } from "./findUserFromClerk";

// Define types for function parameter
export type UserID = string | null;
export type MyPrismaClient = PrismaClient<
  Prisma.PrismaClientOptions,
  never,
  Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
>;

export const addDataToPost = async (
  post: Post,
  prisma: MyPrismaClient,
  userId: UserID
) => {
  // get the author's user profile from clerk
  const author = await findUserFromClerk(post.authorId);

  const authorWithFollowingData = await attachFollowData(
    author,
    prisma,
    userId
  );

  // count number of likes on post
  const likeCount = await prisma.like.count({
    where: {
      postId: post.id,
    },
  });

  const findUserLike: Like | null = await prisma.like.findFirst({
    where: {
      postId: post.id,
      userId: userId ?? "",
    },
  });

  // determimne if current user liked the post
  const isLikedByUser = findUserLike ? true : false;

  // get the number of replies that the post has
  const replyCount = await prisma.reply.count({
    where: {
      postId: post.id,
    },
  });

  return {
    post: post,
    author: authorWithFollowingData,
    likeCount,
    isLikedByUser,
    replyCount,
  };
};
