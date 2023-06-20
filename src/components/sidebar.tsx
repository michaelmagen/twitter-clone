import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/clerk-react";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import Image from "next/image";
import { HomeIcon } from "./icons/HomeIcon";
import { GithubIcon } from "./icons/GithubIcon";
import { ThreeDotsIcon } from "./icons/ThreeDotsIcon";
import { HoverTooltip } from "./tooltip";
import clsx from "clsx";
import type { ReactElement } from "react";
import { PostCreatorPopup } from "./PostCreatorPopup";

interface SidebarButtonProps {
  icon: ReactElement;
  label: string;
  onClick?: () => void;
}

const SidebarButton = ({ icon, label, onClick }: SidebarButtonProps) => {
  return (
    <>
      <button
        className="hidden gap-4 rounded-full py-2 pl-4 pr-4 text-xl font-thin hover:bg-zinc-800 lg:flex"
        onClick={onClick}
      >
        {icon}
        <span> {label} </span>
      </button>
      <HoverTooltip content={label} className={clsx("lg:hidden")}>
        <button
          className="rounded-full p-2 hover:bg-zinc-800"
          onClick={onClick}
        >
          {icon}
        </button>
      </HoverTooltip>
    </>
  );
};

const UserButtonWithPopover = () => {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn || !user?.profileImageUrl) {
    return <></>;
  }

  return (
    <Popover.Root>
      <Popover.Trigger className="my-3 flex h-16 w-16 items-center justify-center rounded-full hover:bg-zinc-800 lg:w-72 lg:p-3">
        <div className="h-12 w-12 rounded-full">
          <Image
            src={user?.profileImageUrl}
            alt={"profile Image"}
            width={56}
            height={56}
            className="rounded-full"
          />
        </div>
        <div className=" hidden flex-grow flex-col pl-4 text-left text-base lg:flex">
          <span className="font-bold"> {user.username} </span>
          <span className="font-thin text-gray-400"> @{user.username}</span>
        </div>
        <div className="hidden h-full items-center justify-center lg:flex">
          <ThreeDotsIcon />
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="popover-shadow w-72 rounded-xl bg-black py-3 will-change-[transform,opacity] data-[state=closed]:animate-fadeOut data-[state=open]:animate-slideUpAndFade"
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
  const { user } = useUser();
  const profileImage: string = user?.profileImageUrl ?? "";
  return (
    <div className="sticky top-0 h-auto self-start">
      <div className="flex h-screen w-24 flex-shrink-0 flex-col justify-between px-2 lg:w-full lg:flex-shrink">
        <div className="flex flex-col items-center justify-center gap-3 px-4 pb-2 pt-16 lg:items-start">
          <Link href="/">
            <SidebarButton icon={<HomeIcon />} label="Home" />
          </Link>
          <Link href="https://github.com/michaelmagen/twitter-clone">
            <SidebarButton icon={<GithubIcon />} label="Source Code" />
          </Link>
          <PostCreatorPopup profileImageUrl={profileImage} />
        </div>
        <div className="flex justify-center">
          <UserButtonWithPopover />
        </div>
      </div>
    </div>
  );
};
