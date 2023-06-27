import { useUser } from "@clerk/nextjs";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { HomeIcon } from "./icons/HomeIcon";
import { GithubIcon } from "./icons/GithubIcon";
import { PostCreatorPopup } from "./PostCreatorPopup";
import { XIcon } from "./icons/XIcon";
import { HamburgerIcon } from "./icons/HamburgerIcon";
import { UserButtonPopover } from "./UserButtonPopover";
import { SidebarSignInButton } from "./sidebar";

export const MobileDrawerNav = () => {
  const { isSignedIn, user } = useUser();
  const profileImage: string = user?.profileImageUrl ?? "";
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="sm:hidden">
          <HamburgerIcon />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-20 h-full w-2/3 max-w-xs gap-4 border-l border-zinc-700 bg-black p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=closed]:duration-200 data-[state=open]:duration-300">
          <div className="mt-5 flex h-full w-full flex-col justify-between overflow-scroll px-2">
            <div className="flex flex-col items-start justify-center gap-3">
              <Link href="/">
                <button className="flex gap-4 rounded-full p-2 text-xl font-thin hover:bg-zinc-800">
                  <HomeIcon />
                  <span>Home</span>
                </button>
              </Link>
              <Link href="https://github.com/michaelmagen/twitter-clone">
                <button className="flex gap-4 rounded-full p-2 text-xl font-thin hover:bg-zinc-800">
                  <GithubIcon />
                  <span>Source Code</span>
                </button>
              </Link>
              {isSignedIn && (
                <PostCreatorPopup
                  profileImageUrl={profileImage}
                  responsive={false}
                />
              )}
              {!isSignedIn && <SidebarSignInButton responsive={false} />}
            </div>
            <div className="flex justify-center">
              <UserButtonPopover responsive={false} />
            </div>
          </div>

          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none data-[state=open]:bg-black">
            <XIcon />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
