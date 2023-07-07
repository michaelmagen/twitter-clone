import * as Dialog from "@radix-ui/react-dialog";
import { XIcon } from "./icons/XIcon";
import { useState } from "react";
import { TweetIcon } from "./icons/CreateTweetIcon";
import { PostCreator } from "./postCreator";
import { HoverTooltip } from "./HoverTooltip";

interface PostCreatorPopupProps {
  profileImageUrl: string;
  responsive?: boolean;
}

export const PostCreatorPopup = ({
  profileImageUrl,
  responsive = true,
}: PostCreatorPopupProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open}>
      <HoverTooltip content="Tweet">
        <Dialog.Trigger
          className={`h-full rounded-full bg-sky-500 hover:bg-sky-600 ${
            responsive ? "w-12 p-2 lg:w-full lg:py-3" : "w-full py-3"
          }`}
          onClick={() => setOpen(true)}
          asChild
        >
          <button>
            <span
              className={` text-base font-bold ${
                responsive ? "hidden lg:block" : ""
              }`}
            >
              Tweet
            </span>
            <div className={responsive ? "block lg:hidden" : "hidden"}>
              <TweetIcon />
            </div>
          </button>
        </Dialog.Trigger>
      </HoverTooltip>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-slate-500 opacity-60 data-[state=open]:animate-overlayShow" />
        <Dialog.Content
          className="fixed left-1/2 top-1/3 z-30 w-11/12 translate-x-[-50%] translate-y-[-50%] rounded-md bg-black pt-5 shadow-md focus:outline-none data-[state=open]:animate-contentShow sm:top-1/4 sm:w-full sm:max-w-screen-sm"
          onInteractOutside={() => setOpen(false)}
        >
          <PostCreator
            profileImageUrl={profileImageUrl}
            onSuccessfulPost={() => setOpen(false)}
          />
          <Dialog.Close asChild>
            <button
              className="absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full hover:bg-zinc-800  focus:outline-none"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <XIcon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
