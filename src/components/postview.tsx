import type { RouterOutputs } from "~/utils/api";
import { useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { api } from "~/utils/api";
import { HeartIcon } from "./icons/HeartIcon";
import { toast } from "react-hot-toast";
import { useUser } from "@clerk/nextjs";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// format relative time strings
dayjs.updateLocale("en", {
  relativeTime: {
    past: "%s",
    s: "%ds",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1 day",
    dd: "%d days",
  },
});

// takes a date and returns a formated string
function dateToFormatedString(datePrimitive: Date) {
  const date = dayjs(datePrimitive);

  // if post created less than a day ago, use relative time
  const isLessThan23HoursAgo = date.isAfter(dayjs().subtract(23, "hour"));
  if (isLessThan23HoursAgo) {
    return date.fromNow();
  }

  // use normal date for other dates
  // date string only contains year if date not in current year
  const isCurrentYear = date.isSame(new Date(), "year");
  const formatString = isCurrentYear ? "MMM DD" : "MMM DD, YYYY";

  return date.format(formatString);
}

type PostWithUserAndLikes =
  RouterOutputs["posts"]["getAllInfinite"]["postsWithUserAndLikes"][number];
export const PostView = (props: PostWithUserAndLikes) => {
  const { post, author, isLikedByUser, likeCount: originalLikeCount } = props;

  const [isLiked, setIsLiked] = useState(isLikedByUser);
  const [likeCount, setLikeCount] = useState(originalLikeCount);
  const { isSignedIn } = useUser();

  const { mutate: createLikeMutation, isLoading: createLoading } =
    api.likes.create.useMutation({
      onError: (e) => {
        // revert optomistic update to UI
        setIsLiked(!isLiked);
        setLikeCount(likeCount - 1);

        // add toast for error message
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to like post! Please try again later.", {
            id: "unknown error like",
          });
        }
      },
    });

  const { mutate: deleteLikeMutation, isLoading: deleteLoading } =
    api.likes.delete.useMutation({
      onError: (e) => {
        // revert optomistic update to UI
        setIsLiked(!isLiked);
        setLikeCount(likeCount + 1);

        // add toast for error message
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to unlike post! Please try again later.", {
            id: "unknown error unlike",
          });
        }
      },
    });

  const handleLikeButtonClick = () => {
    // if not signed in not fire and notify user
    if (!isSignedIn) {
      toast.error("Must be signed in to do that!  ", {
        id: "authorization error",
      });
      return;
    }
    // do not allow to click the button if still loading
    if (createLoading || deleteLoading) {
      return;
    }
    // optomistic update to the UI
    const prevIsLiked = isLiked;
    const likeCountUpdate = !isLiked ? 1 : -1;

    // update the button and the number display
    setIsLiked(!isLiked);
    setLikeCount(likeCount + likeCountUpdate);

    // if was not likes, create a like. otherwise delete the like.
    if (!prevIsLiked) {
      createLikeMutation({ postId: post.id });
    } else {
      deleteLikeMutation({ postId: post.id });
    }
  };

  return (
    <div className="border-b border-zinc-700">
      <div key={post.id} className="flex gap-3 p-4">
        <Image
          src={author.profileImageUrl}
          className="h-11 w-11 rounded-full"
          alt={`@${author.username}'s profile picture`}
          width={56}
          height={56}
        />
        <div className="flex flex-col overflow-hidden">
          <div className="flex gap-1 text-sm sm:text-base">
            <span className="truncate font-bold  hover:underline">{`${author.displayName}`}</span>
            <span className="truncate font-thin text-gray-400">{`  @${author.username}`}</span>
            <Link href={`/post/${post.id}`}>
              <span className="overflow-hidden whitespace-nowrap font-thin text-gray-400">
                {` · ${dateToFormatedString(post.createdAt)}`}
              </span>
            </Link>
          </div>
          <span className="hyphens-auto break-words text-sm sm:text-base">
            {post.content}
          </span>
        </div>
      </div>
      <div className="mb-1 flex w-full items-center justify-center gap-0.5">
        <button
          onClick={handleLikeButtonClick}
          className="rounded-full p-2 hover:bg-pink-600 hover:bg-opacity-20"
        >
          {!isLiked && <HeartIcon />}
          {isLiked && <HeartIcon filled />}
        </button>
        {!isLiked && <span className="text-xs text-gray-400">{likeCount}</span>}
        {isLiked && <span className="text-xs text-pink-600">{likeCount}</span>}
      </div>
    </div>
  );
};
