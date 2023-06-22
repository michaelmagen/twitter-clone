import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { useEffect } from "react";
import { LoadingSpinner, LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { useInView } from "react-intersection-observer";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/PageLayout";
import { PostCreator } from "~/components/postCreator";

const Feed = () => {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    api.posts.getAllInfinite.useInfiniteQuery(
      {
        limit: 15,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (isLoading)
    return (
      <div className="flex grow">
        <LoadingPage />
      </div>
    );

  return (
    <div className="flex grow flex-col">
      {data &&
        data.pages.map((page) =>
          page.postsWithUser.map((postWithUser) => (
            <PostView {...postWithUser} key={postWithUser.post.id} />
          ))
        )}
      <div ref={ref} className="flex h-full justify-center p-2">
        {isFetchingNextPage ? (
          <LoadingSpinner size={32} />
        ) : hasNextPage ? (
          <div className="h-9" />
        ) : (
          "No posts left!"
        )}
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { isSignedIn, isLoaded: userLoaded, user } = useUser();

  // Return empty div if user isn't loaded
  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout pageName="Home">
        <div className="border-b border-zinc-700">
          {!isSignedIn && (
            <SignInButton afterSignUpUrl="/register" afterSignInUrl="/" />
          )}
          {!!isSignedIn && (
            <PostCreator profileImageUrl={user?.profileImageUrl} />
          )}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
