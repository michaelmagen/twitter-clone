import { createServerSideHelpers } from "@trpc/react-query/server";
import type {
  InferGetServerSidePropsType,
  GetServerSidePropsContext,
} from "next";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { getAuth } from "@clerk/nextjs/server";
import Head from "next/head";
import type { NextPage } from "next";
import { PageLayout } from "~/components/PageLayout";
import Image from "next/image";
import { FollowButton } from "~/components/FollowButton";
import { Feed } from "~/components/Feed";
import { api } from "~/utils/api";

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

  const profileId = context.params?.id as string;

  try {
    const initialProfileData = await helpers.profiles.getProfileById.fetch({
      userId: profileId,
    });

    return {
      props: {
        trpcState: helpers.dehydrate(),
        initialProfileData,
        userId,
        profileId,
      },
    };
  } catch (e) {
    // If there is error fetching profile, redirect to 404 page
    return {
      notFound: true,
    };
  }
}

const Profile: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ initialProfileData, userId, profileId }) => {
  const { data: profile } = api.profiles.getProfileById.useQuery(
    {
      userId: profileId,
    },
    {
      // Pass in initial data from ssr, then let the data be updated like normal from client
      initialData: initialProfileData,
    }
  );

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    api.posts.getByAuthorIdInfinite.useInfiniteQuery(
      {
        limit: 15,
        authorId: profile.id,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <>
      <Head>
        <title>{`${profile.displayName} (@${profile.username})`}</title>
      </Head>
      <PageLayout pageName="Profile">
        <div className="h-24 w-full bg-sky-600 md:h-32 lg:h-40" />
        <div className="flex flex-col gap-3 p-4">
          <div className="flex h-10 items-end justify-between gap-12">
            <Image
              src={profile.profileImageUrl}
              alt={"profile Image"}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border-4 border-black"
            />
            <div className="mr-2 w-40 md:mr-5">
              {userId !== profile.id && (
                <FollowButton
                  isFollowing={profile.isFollowing}
                  authorId={profile.id}
                  isSignedIn={userId !== null}
                />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-0">
            <span className="truncate text-xl font-bold">
              {profile.displayName}
            </span>
            <span className="truncate text-gray-500">{`  @${profile.username}`}</span>
          </div>
          <div className="flex gap-5">
            <div>
              <span className="font-bold">{profile.following}</span>
              <span className="text-gray-500"> Following</span>
            </div>

            <div>
              <span className="font-bold">{profile.followers}</span>
              <span className=" text-gray-500"> Followers</span>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-center border-b border-zinc-700 pb-2">
          <span className="font-bold">Posts</span>
        </div>
        <Feed
          posts={data}
          fetchNextPage={fetchNextPage}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
        />
      </PageLayout>
    </>
  );
};

export default Profile;
