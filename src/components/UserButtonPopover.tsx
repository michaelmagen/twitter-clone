import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/clerk-react";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import Image from "next/image";
import { ThreeDotsIcon } from "./icons/ThreeDotsIcon";
import { HoverTooltip } from "./HoverTooltip";

export const UserButtonPopover = ({ responsive = true }) => {
  const { isSignedIn, user } = useUser();

  const displayName = user?.unsafeMetadata.displayName as string;
  const username = user?.unsafeMetadata.username as string;

  // reload the page when sign out so that likes etc. are reset
  const reloadPageOnSignOut = () => {
    window.location.reload();
  };

  if (!isSignedIn || !user?.profileImageUrl) {
    return <div className="lg:w-72"></div>;
  }

  return (
    <Popover.Root>
      <HoverTooltip content="Account">
        <Popover.Trigger
          className={`my-3 flex h-16 items-center justify-center rounded-full hover:bg-zinc-800 ${
            responsive ? "w-16 lg:w-72 lg:p-3" : "w-72 p-1"
          }`}
          asChild
        >
          <button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full">
              <Image
                src={user?.profileImageUrl}
                alt={"profile Image"}
                width={56}
                height={56}
                className="rounded-full"
              />
            </div>
            <div
              className={`flex-grow flex-col  text-left  ${
                responsive
                  ? "hidden pl-4 text-base lg:flex"
                  : " flex px-1 text-sm"
              }`}
            >
              <span className="truncate font-bold"> {displayName} </span>
              <span className="truncate font-thin text-gray-400">
                @{username}
              </span>
            </div>
            <div
              className={`h-full items-center justify-center ${
                responsive ? "hidden lg:flex" : "flex"
              }`}
            >
              <ThreeDotsIcon />
            </div>
          </button>
        </Popover.Trigger>
      </HoverTooltip>
      <Popover.Portal>
        <Popover.Content
          className="popover-shadow z-50 w-72 rounded-xl bg-black py-3 will-change-[transform,opacity] data-[state=closed]:animate-fadeOut data-[state=open]:animate-slideUpAndFade"
          sideOffset={5}
          collisionPadding={5}
        >
          <div className="flex flex-col">
            <div className="h-px bg-zinc-700" />
            <Link
              href="/profileSettings"
              className="px-4 py-3 text-left text-base font-bold hover:bg-zinc-900"
            >
              User Profile Settings
            </Link>
            <SignOutButton>
              <button
                className="px-4 py-3 text-left text-base font-bold hover:bg-zinc-900"
                onClick={reloadPageOnSignOut}
              >
                Sign Out
              </button>
            </SignOutButton>
          </div>
          <Popover.Arrow className="stroke-zinc-700" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
