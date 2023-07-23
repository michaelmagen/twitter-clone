import type { NextPage } from "next";
import { PageLayout } from "~/components/PageLayout";
import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
} from "next";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { api } from "~/utils/api";
import { PostView } from "~/components/contentViews";
import { useUser } from "@clerk/nextjs";
import { PostCreator } from "~/components/postCreator";
import { LoadingSpinner } from "~/components/loading";
import { getAuth } from "@clerk/nextjs/server";
import Head from "next/head";
import { Feed } from "~/components/Feed";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>
) {
  // if the user id of the logged in user
  const req = context.req;
  const session = getAuth(req);
  const userId = session.userId;

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId },
    transformer: superjson,
  });

  const id = context.params?.id as string;

  await helpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
}

const SinglePostPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const { data: postData } = api.posts.getById.useQuery({ id });
  const { user, isSignedIn } = useUser();

  const profileImage: string = user?.profileImageUrl ?? "";

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    api.replys.getAllInfiniteById.useInfiniteQuery(
      {
        postId: id,
        limit: 15,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  // this will not get hit because of ssr, change to 404
  if (!postData)
    return (
      <PageLayout pageName="Post">
        <div className="flex w-full items-center justify-center pt-10">
          <LoadingSpinner size={40} />
        </div>
      </PageLayout>
    );

  return (
    <>
      <Head>
        <title>{`${postData.author.username}: "${postData.post.content}"`}</title>
      </Head>
      <PageLayout pageName="Post">
        <PostView {...postData} />
        {isSignedIn && (
          <PostCreator profileImageUrl={profileImage} postIdToReplyTo={id} />
        )}
        <Feed
          replys={data}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;
