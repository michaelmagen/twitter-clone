import type { NextPage } from "next";
import { PageLayout } from "~/components/PageLayout";
import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { api } from "~/utils/api";
import { PostView } from "~/components/postview";
import { useUser } from "@clerk/nextjs";
import { PostCreator } from "~/components/postCreator";

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });
  const id = context.params?.id as string;
  // prefetch the post for this page
  await helpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
    revalidate: 1,
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    select: {
      id: true,
    },
  });
  return {
    paths: posts.map((post) => ({
      params: {
        id: post.id,
      },
    })),
    // https://nextjs.org/docs/pages/api-reference/functions/get-static-paths#fallback-blocking
    fallback: "blocking",
  };
};

const SinglePostPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ id }) => {
  const { data } = api.posts.getById.useQuery({ id });
  const { user } = useUser();
  const profileImage: string = user?.profileImageUrl ?? "";

  // todo: make this something better
  if (!data) return <div>404</div>;

  return (
    <PageLayout pageName="Post">
      <PostView {...data} />
      <PostCreator profileImageUrl={profileImage} postIdToReplyTo={id} />
    </PageLayout>
  );
};

export default SinglePostPage;
