import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/PageLayout";
import { PostCreator } from "~/components/postCreator";
import { Feed } from "~/components/Feed";
import { api } from "~/utils/api";

const Home: NextPage = () => {
  const { isSignedIn, isLoaded: userLoaded, user } = useUser();

  // infinite query for main feed
  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    api.posts.getAllInfinite.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
      }
    );

  // Return empty div if user isn't loaded
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout pageName="Home">
        <div className="border-b border-zinc-700">
          {!isSignedIn && (
            <div className="flex w-full items-center justify-center p-4 ">
              <SignInButton afterSignUpUrl="/register" afterSignInUrl="/">
                <button className="w-1/2 rounded-full bg-sky-500 p-2 text-lg font-bold hover:bg-sky-600">
                  Sign In
                </button>
              </SignInButton>
            </div>
          )}
          {!!isSignedIn && (
            <PostCreator profileImageUrl={user?.profileImageUrl} />
          )}
        </div>
        <Feed
          posts={data}
          isLoading={isLoading}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
        />
      </PageLayout>
    </>
  );
};

export default Home;
