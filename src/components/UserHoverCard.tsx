import * as HoverCard from "@radix-ui/react-hover-card";
import type { RouterOutputs } from "~/utils/api";
import type { PropsWithChildren } from "react";
import Image from "next/image";
import Link from "next/link";
import { FollowButton } from "./FollowButton";
import { useUser } from "@clerk/nextjs";

type Author =
  RouterOutputs["posts"]["getAllInfinite"]["postsWithData"][number]["author"];

interface UserHoverCardProps extends PropsWithChildren {
  author: Author;
}

export const UserHoverCard = (props: UserHoverCardProps) => {
  const author = props.author;
  const { isSignedIn, user } = useUser();

  return (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <Link
          href={`/profile/${author.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          {props.children}
        </Link>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className="popover-shadow z-20 h-44 w-60 rounded-xl bg-black  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-3 p-4">
            <div className="flex justify-between gap-12">
              <Image
                src={author.profileImageUrl}
                alt={"profile Image"}
                width={56}
                height={56}
                className="h-12 w-12 rounded-full"
              />
              {user?.id != author.id && (
                <FollowButton
                  isFollowing={author.isFollowing}
                  authorId={author.id}
                  isSignedIn={isSignedIn ?? false}
                />
              )}
            </div>
            <Link
              href={`/profile/${author.id}`}
              className="flex flex-col gap-0"
            >
              <span className="truncate font-bold hover:underline">
                {author.displayName}
              </span>
              <span className="truncate text-gray-500">{`  @${author.username}`}</span>
            </Link>
            <div className="flex gap-5 text-sm">
              <div>
                <span className="font-bold">{author.following}</span>
                <span className="text-gray-500"> Following</span>
              </div>

              <div>
                <span className="font-bold">{author.followers}</span>
                <span className=" text-gray-500"> Followers</span>
              </div>
            </div>
          </div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
