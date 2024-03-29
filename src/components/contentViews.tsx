import type { RouterOutputs } from "~/utils/api";
import { useState } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import { api } from "~/utils/api";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import { toast } from "react-hot-toast";
import { useUser } from "@clerk/nextjs";
import { HoverTooltip } from "./HoverTooltip";
import Link from "next/link";
import { FaRegMessage } from "react-icons/fa6";
import { FiShare } from "react-icons/fi";
import { useRouter } from "next/router";
import { UserHoverCard } from "./UserHoverCard";

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

enum ContentType {
  post,
  reply,
}
type Author =
  RouterOutputs["posts"]["getAllInfinite"]["postsWithData"][number]["author"];

interface ContentViewProps {
  id: string;
  author: Author;
  createdAt: Date;
  content: string;
  type: ContentType;
}

const ContentView = (props: ContentViewProps) => {
  const { id, author, createdAt, content, type } = props;

  return (
    <div
      key={id}
      className={`flex gap-3 border-zinc-700 p-4 ${
        type == ContentType.reply ? "border-b" : ""
      }`}
    >
      <div className="h-10 w-10 shrink-0 rounded-full">
        <UserHoverCard author={author}>
          <Image
            src={author.profileImageUrl}
            className="h-10 w-10 rounded-full"
            alt={`@${author.username}'s profile picture`}
            width={56}
            height={56}
          />
        </UserHoverCard>
      </div>
      <div className="flex flex-col overflow-hidden">
        <div className="flex gap-1 text-sm sm:text-base">
          <UserHoverCard author={author}>
            <span className="truncate font-bold  hover:underline">{`${author.displayName}`}</span>
          </UserHoverCard>
          <UserHoverCard author={author}>
            <span className="truncate font-light text-gray-500">{`  @${author.username}`}</span>
          </UserHoverCard>
          <span className="overflow-hidden whitespace-nowrap font-light text-gray-500">
            {` · ${dateToFormatedString(createdAt)}`}
          </span>
        </div>
        <span className="hyphens-auto break-words text-sm sm:text-base">
          {content}
        </span>
      </div>
    </div>
  );
};

type PostWithUserAndData =
  RouterOutputs["posts"]["getAllInfinite"]["postsWithData"][number];

export const PostView = (props: PostWithUserAndData) => {
  const {
    post,
    author,
    isLikedByUser,
    likeCount: originalLikeCount,
    replyCount,
  } = props;

  const [isLiked, setIsLiked] = useState(isLikedByUser);
  const [likeCount, setLikeCount] = useState(originalLikeCount);
  const { isSignedIn } = useUser();
  const router = useRouter();
  const isInSinglePostPage = router.asPath.includes("post");

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

  const handleClickOnPost = async () => {
    if (isInSinglePostPage) return;

    await router.push(`/post/${post.id}`);
  };

  const handleLikeButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    // prevents div onClick being called so user not taken to post page
    event.stopPropagation();

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

  const handleShareClick = async (event: React.MouseEvent<HTMLElement>) => {
    // prevents div onClick being called so user not taken to post page
    event.stopPropagation();

    // get the url of current page
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";

    // the current url can be in the post or profile routes
    // if post or profile are in the url, remove those words plus everything after them from url
    const baseUrlWithoutPost = currentUrl.split("post")[0];
    const baseUrlWithoutPostAndProfile =
      baseUrlWithoutPost?.split("profile")[0];

    if (currentUrl == "" || !baseUrlWithoutPostAndProfile) {
      toast.error("Failed to share post", {
        id: "failSharePost",
      });
      return;
    }

    const urlToPost = `${baseUrlWithoutPostAndProfile}post/${post.id}`;

    // write current url to clipboard and notify user of it
    await navigator.clipboard.writeText(urlToPost);
    toast.success("Copied link to clipboard!", {
      id: `copy to clipboard post id: ${post.id}`,
    });
  };

  return (
    <div
      onClick={handleClickOnPost}
      className={`cursor-pointer border-b border-zinc-700 ${
        isInSinglePostPage
          ? "cursor-default"
          : "cursor-pointer hover:bg-zinc-950"
      }`}
    >
      <ContentView
        id={post.id}
        author={author}
        createdAt={post.createdAt}
        type={ContentType.post}
        content={post.content}
      />
      <div className="mb-1 flex w-full items-center justify-evenly">
        <div className="flex items-center justify-center gap-0.5">
          <HoverTooltip content="Like" allScreenSizes={true}>
            <button
              onClick={(event) => handleLikeButtonClick(event)}
              className={`transform-gpu rounded-full p-2 transition-transform hover:bg-pink-600 hover:bg-opacity-20 ${
                isLiked ? "scale-110" : "scale-100"
              }`}
            >
              {!isLiked && <PiHeart className="h-5 w-5 fill-zinc-400" />}
              {isLiked && <PiHeartFill className="h-5 w-5 fill-pink-600" />}
            </button>
          </HoverTooltip>
          {!isLiked && (
            <span className="text-xs text-gray-500">{likeCount}</span>
          )}
          {isLiked && (
            <span className="text-xs text-pink-600">{likeCount}</span>
          )}
        </div>
        <Link href={`/post/${post.id}`}>
          <div className="flex items-center justify-center gap-0.5">
            <HoverTooltip content="Reply" allScreenSizes={true}>
              <button className="rounded-full p-2 hover:bg-sky-500 hover:bg-opacity-20">
                <FaRegMessage className="fill-zinc-400" />
              </button>
            </HoverTooltip>
            <span className="text-xs text-gray-500">{replyCount}</span>
          </div>
        </Link>
        <HoverTooltip content="Share" allScreenSizes={true}>
          <button
            onClick={(event) => handleShareClick(event)}
            className="rounded-full p-2 hover:bg-green-500 hover:bg-opacity-20"
          >
            <FiShare className="stroke-zinc-400" />
          </button>
        </HoverTooltip>
      </div>
    </div>
  );
};

type ReplyWithUser =
  RouterOutputs["replys"]["getAllInfiniteById"]["replysWithUser"][number];

export const ReplyView = (props: ReplyWithUser) => {
  const { reply, author } = props;
  return (
    <ContentView
      id={reply.id}
      author={author}
      createdAt={reply.createdAt}
      content={reply.content}
      type={ContentType.reply}
    />
  );
};
