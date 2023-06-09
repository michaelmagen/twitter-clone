import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/clerk-react";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import Image from "next/image";

const ThreeDots = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      ></path>
    </svg>
  );
};

const UserButtonWithPopover = () => {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn || !user?.profileImageUrl) {
    return <></>;
  }

  return (
    <Popover.Root>
      <Popover.Trigger className="my-3 flex justify-center   rounded-full lg:w-72 lg:p-3 lg:hover:bg-zinc-900">
        <div className="flex items-center justify-center rounded-full p-3 hover:bg-zinc-900 lg:block lg:p-0">
          <Image
            src={user?.profileImageUrl}
            alt={"profile Image"}
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
        <div className=" hidden flex-grow flex-col pl-4 text-left text-base lg:flex">
          <span className="font-bold"> {user.username} </span>
          <span className="font-thin text-gray-400"> @{user.username}</span>
        </div>
        <div className="hidden h-full items-center justify-center lg:flex">
          <ThreeDots />
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="popover-shadow w-72 rounded-xl bg-black py-3 will-change-[transform,opacity] data-[state=closed]:animate-fade data-[state=open]:animate-slideUpAndFade"
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
              <button className="px-4 py-3 text-left text-base font-bold hover:bg-zinc-900">
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

export const Sidebar = () => {
  return (
    <div className="sticky top-0 h-auto self-start">
      <div className="flex h-screen w-24 flex-shrink-0 flex-col justify-between px-2 lg:w-full lg:flex-shrink">
        <div>hi</div>
        <UserButtonWithPopover />
      </div>
    </div>
  );
};
