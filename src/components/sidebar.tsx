import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { HomeIcon } from "./icons/HomeIcon";
import { GithubIcon } from "./icons/GithubIcon";
import { HoverTooltip } from "./tooltip";
import clsx from "clsx";
import { type ReactElement } from "react";
import { PostCreatorPopup } from "./PostCreatorPopup";
import { PersonPlusIcon } from "./icons/PersonPlusIcon";
import { UserButtonPopover } from "./UserButtonPopover";

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

export const SidebarSignInButton = ({ responsive = true }) => {
  return (
    <HoverTooltip content="Sign In">
      <div className={`${responsive ? "lg:w-full" : "w-full"}`}>
        <SignInButton
          afterSignUpUrl="/register"
          afterSignInUrl="/"
          mode="modal"
        >
          <button
            className={`h-full rounded-full bg-sky-500 p-2 hover:bg-sky-600  ${
              responsive ? "w-12 p-2 lg:w-full lg:py-3" : "w-full py-3"
            }`}
          >
            <span
              className={` text-base font-bold  ${
                responsive ? "hidden lg:block" : ""
              }`}
            >
              Sign In
            </span>
            <div className={`${responsive ? "lg:hidden" : "hidden"}`}>
              <PersonPlusIcon />
            </div>
          </button>
        </SignInButton>
      </div>
    </HoverTooltip>
  );
};

export const Sidebar = () => {
  const { user, isSignedIn } = useUser();
  const profileImage: string = user?.profileImageUrl ?? "";
  return (
    <header className="sticky top-0 hidden h-auto self-start sm:block">
      <div className="flex h-screen w-20 flex-shrink-0 flex-col justify-between px-2 lg:w-[304px] lg:flex-shrink">
        <div className="flex flex-col items-center justify-center gap-3 px-4 pb-2 pt-16 lg:items-start">
          <Link href="/">
            <SidebarButton icon={<HomeIcon />} label="Home" />
          </Link>
          <Link href="https://github.com/michaelmagen/twitter-clone">
            <SidebarButton icon={<GithubIcon />} label="Source Code" />
          </Link>
          {isSignedIn && <PostCreatorPopup profileImageUrl={profileImage} />}
          {!isSignedIn && <SidebarSignInButton />}
        </div>
        <div className="flex justify-center">
          <UserButtonPopover />
        </div>
      </div>
    </header>
  );
};
