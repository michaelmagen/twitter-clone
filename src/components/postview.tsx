import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

// format relative time strings
dayjs.updateLocale("en", {
  relativeTime: {
    past: "%s",
    s: "1s",
    m: "1s",
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
  const isLessThan24HoursAgo = date.isAfter(dayjs().subtract(24, "hour"));
  if (isLessThan24HoursAgo) {
    return date.fromNow();
  }

  // use normal date for other dates
  // date string only contains year if date not in current year
  const isCurrentYear = date.isSame(new Date(), "year");
  const formatString = isCurrentYear ? "MMM DD" : "MMM DD, YYYY";

  return date.format(formatString);
}

type PostWithUser = RouterOutputs["posts"]["getAllInfinite"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 border-b border-zinc-700 p-4">
      <Image
        src={author.profileImageUrl}
        className="h-12 w-12 rounded-full"
        alt={`@${author.username}'s profile picture`}
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-base ">
          <Link href={`/@${author.username}`}>
            <span className="font-bold hover:underline">{`${author.username}`}</span>
            <span className="font-thin text-gray-400">{`  @${author.username}`}</span>
          </Link>
          <Link href={`/post/${post.id}`}>
            {/* <span className="font-thin text-gray-400">{` · ${dayjs(
              post.createdAt
            ).fromNow()}`}</span> */}
            <span className="font-thin text-gray-400">
              {` · ${dateToFormatedString(post.createdAt)}`}
            </span>
          </Link>
        </div>
        <span className="text-base">{post.content}</span>
      </div>
    </div>
  );
};
