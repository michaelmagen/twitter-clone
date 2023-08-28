import { useState } from "react";
import clsx from "clsx";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface FollowButtonProps {
  isFollowing: boolean;
  authorId: string;
  isSignedIn: boolean;
}

export const FollowButton = ({
  isFollowing: isFollowingInitially,
  authorId,
  isSignedIn,
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(isFollowingInitially);
  const [isFollowingInitialState] = useState(isFollowingInitially);
  const [isHovering, setIsHovering] = useState(false);
  const router = useRouter();
  const apiContext = api.useContext();

  const sharedTailwindClasses = clsx(
    "h-full w-full rounded-full p-2 font-bold"
  );

  // It is possible for the initaliFollowing prop to change as a result of something external to this component.
  // If it changes, we want to update the state of the following button to refelct the change that happened.
  useEffect(() => {
    if (isFollowingInitialState != isFollowingInitially) {
      setIsFollowing(isFollowingInitially);
    }
  }, [isFollowingInitially, isFollowingInitialState]);

  const { mutate: createMutation, isLoading: createLoading } =
    api.follows.create.useMutation({
      onError: (e) => {
        // revert optomistic UI update
        setIsFollowing(!isFollowing);

        // show user error message
        toast.error(e.message, {
          id: "fail to follow",
        });
      },
      onSuccess: () => {
        invalidatePostQuery();
      },
    });

  const { mutate: deleteMutation, isLoading: deleteLoading } =
    api.follows.delete.useMutation({
      onError: (e) => {
        // revert optomistic UI update
        setIsFollowing(!isFollowing);

        // show user error message
        toast.error(e.message, {
          id: "fail to unfollow",
        });
      },
      onSuccess: () => {
        invalidatePostQuery();
      },
    });

  const invalidatePostQuery = () => {
    // If in single post page, invalidate the single post query
    if (router.asPath.includes("post")) {
      void apiContext.posts.getById.invalidate();
      void apiContext.replys.getAllInfiniteById.invalidate();
    } else if (router.asPath.includes("profile")) {
      // if in profile page, invalidate proper querys
      void apiContext.posts.getByAuthorIdInfinite.invalidate();
      void apiContext.profiles.getProfileById.invalidate();
    } else {
      // otherwise invalidate the infinite feed query
      void apiContext.posts.getAllInfinite.invalidate();
    }
  };

  const handleClick = () => {
    // if not signed in not fire and notify user
    if (!isSignedIn) {
      toast.error("Must be signed in to do that!", {
        id: "authorization error for follow",
      });
      return;
    }

    // do not allow to click the button if still loading
    if (createLoading || deleteLoading) {
      return;
    }

    const wasFollowingBeforeClick = isFollowing;

    // optomisticly update the button state
    setIsFollowing(!isFollowing);

    // If was following before click, delete follow. If was not following, create a follow.
    wasFollowingBeforeClick
      ? deleteMutation({ followingId: authorId })
      : createMutation({ followingId: authorId });
  };

  if (isFollowing && isSignedIn) {
    return (
      <button
        className={`${sharedTailwindClasses}  border border-white hover:border-red-500 hover:bg-red-500 hover:bg-opacity-10 hover:text-red-500`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleClick}
      >
        {isHovering ? "Unfollow" : "Following"}
      </button>
    );
  }

  return (
    <button
      className={`${sharedTailwindClasses} bg-white text-black hover:bg-zinc-100`}
      onClick={handleClick}
    >
      Follow
    </button>
  );
};
