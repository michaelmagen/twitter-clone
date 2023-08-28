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
import { getAuth } from "@clerk/nextjs/server";
import Head from "next/head";
import { Feed } from "~/components/Feed";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>
) {
  // get the user id of the logged in user
  const req = context.req;
  const session = getAuth(req);
  const userId = session.userId;

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId },
    transformer: superjson,
  });

  const id = context.params?.id as string;

  try {
    const initialPostData = await helpers.posts.getById.fetch({ id });
    return {
      props: {
        trpcState: helpers.dehydrate(),
        id,
        initialPostData,
      },
    };
  } catch (e) {
    // If there is error fetching post, redirect to 404 page
    return {
      notFound: true,
    };
  }
}

const SinglePostPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id, initialPostData }) => {
  const { user, isSignedIn } = useUser();

  const profileImage: string = user?.profileImageUrl ?? "";

  const { data: postData } = api.posts.getById.useQuery(
    {
      id: id,
    },
    {
      initialData: initialPostData,
    }
  );

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
