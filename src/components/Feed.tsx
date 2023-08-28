import { useEffect } from "react";
import { LoadingSpinner } from "~/components/loading";
import { PostView, ReplyView } from "~/components/contentViews";
import { useInView } from "react-intersection-observer";
import type { RouterOutputs } from "~/utils/api";
import type {
  InfiniteData,
  InfiniteQueryObserverResult,
} from "@tanstack/react-query";

// TYPES FOR PROPS
type PostsWithData = RouterOutputs["posts"]["getAllInfinite"];

type ReplysWithUser = RouterOutputs["replys"]["getAllInfiniteById"];

interface FeedBasics {
  fetchNextPage: () => Promise<InfiniteQueryObserverResult>;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
}

interface PostsFeed extends FeedBasics {
  posts: InfiniteData<PostsWithData> | undefined;
}

interface ReplysFeed extends FeedBasics {
  replys: InfiniteData<ReplysWithUser> | undefined;
}

type FeedProps = PostsFeed | ReplysFeed;

export const Feed = (props: FeedProps) => {
  const { ref, inView } = useInView();
  const { fetchNextPage, isLoading, isFetchingNextPage, hasNextPage } = props;

  useEffect(() => {
    if (inView) {
      void fetchNextPage();
    }
  }, [inView, fetchNextPage]);

  if (isLoading)
    return (
      <div className="flex justify-center pt-10">
        <LoadingSpinner size={40} />
      </div>
    );

  return (
    <div className="flex grow flex-col">
      {"posts" in props &&
        props.posts &&
        props.posts.pages.map((page) =>
          page.postsWithData.map((post) => (
            <PostView {...post} key={post.post.id} />
          ))
        )}

      {"replys" in props &&
        props.replys &&
        props.replys.pages.map((page) =>
          page.replysWithUser.map((reply) => (
            <ReplyView {...reply} key={reply.reply.id} />
          ))
        )}
      <div ref={ref} className="flex h-full justify-center p-2">
        {isFetchingNextPage ? (
          <LoadingSpinner size={32} />
        ) : hasNextPage ? (
          <div className="h-9" />
        ) : "posts" in props ? (
          "No posts left!"
        ) : (
          "No more Replies!"
        )}
      </div>
    </div>
  );
};
