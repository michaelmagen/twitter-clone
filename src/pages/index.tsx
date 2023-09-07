import { SignInButton, useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { PageLayout } from "~/components/PageLayout";
import { PostCreator } from "~/components/postCreator";
import { Feed } from "~/components/Feed";
import { api } from "~/utils/api";
import * as Tabs from "@radix-ui/react-tabs";
import clsx from "clsx";
import { toast } from "react-hot-toast";
interface PostWizardProps {
  profileImageUrl: string | undefined;
}

const PostWizard = ({ profileImageUrl }: PostWizardProps) => {
  return (
    <div className="border-b border-zinc-700">
      <SignedOut>
        <div className="flex w-full items-center justify-center p-4 ">
          <SignInButton afterSignUpUrl="/register" afterSignInUrl="/">
            <button className="w-1/2 rounded-full bg-sky-500 p-2 text-lg font-bold hover:bg-sky-600">
              Sign In
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      {profileImageUrl && (
        <SignedIn>
          <PostCreator profileImageUrl={profileImageUrl} />
        </SignedIn>
      )}
    </div>
  );
};

const LatestFeed = () => {
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

  return (
    <Feed
      posts={data}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
};

const FollowingFeed = () => {
  const { isSignedIn } = useUser();

  if (!isSignedIn) {
    toast.error("Sign in to start following users!", {
      id: "following feed error",
    });
    return <></>;
  }

  const { data, fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } =
    api.posts.getAllFollowingInfinite.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        refetchOnWindowFocus: false,
      }
    );

  return (
    <>
      <Feed
        posts={data}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />
    </>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, user } = useUser();

  const TabTriggerStyles = clsx(
    "w-full h-12 flex items-center justify-center font-bold hover:bg-zinc-900 data-[state=active]:border-b-4 border-sky-500"
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
        <Tabs.Root defaultValue="latest">
          <Tabs.List className="flex border-b border-zinc-700">
            <Tabs.Trigger value="latest" className={TabTriggerStyles}>
              Latest
            </Tabs.Trigger>
            <Tabs.Trigger value="following" className={TabTriggerStyles}>
              Following
            </Tabs.Trigger>
          </Tabs.List>
          <PostWizard profileImageUrl={user?.profileImageUrl} />
          <Tabs.Content value="latest">
            <LatestFeed />
          </Tabs.Content>
          <Tabs.Content value="following">
            <FollowingFeed />
          </Tabs.Content>
        </Tabs.Root>
      </PageLayout>
    </>
  );
};

export default Home;
