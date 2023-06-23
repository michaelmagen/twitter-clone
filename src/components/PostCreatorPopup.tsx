import * as Dialog from "@radix-ui/react-dialog";
import { XIcon } from "./icons/XIcon";
import { useState } from "react";
import { TweetIcon } from "./icons/CreateTweetIcon";
import { PostCreator } from "./postCreator";
import { HoverTooltip } from "./tooltip";

interface PostCreatorPopupProps {
  profileImageUrl: string;
}
// todo: fix width for content, set w-full then a min and a max
export const PostCreatorPopup = ({
  profileImageUrl,
}: PostCreatorPopupProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open}>
      <HoverTooltip content="Tweet">
        <Dialog.Trigger
          className="h-full w-12 rounded-full bg-sky-500 p-2 hover:bg-sky-600 lg:w-full lg:py-3"
          onClick={() => setOpen(true)}
          asChild
        >
          <button>
            <span className="hidden text-base font-bold lg:block">Tweet</span>
            <div className="block lg:hidden">
              <TweetIcon />
            </div>
          </button>
        </Dialog.Trigger>
      </HoverTooltip>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-500 opacity-60 data-[state=open]:animate-overlayShow" />
        <Dialog.Content
          className="fixed left-[50%] top-[25%] w-9/12 max-w-screen-md translate-x-[-50%] translate-y-[-50%] rounded-md bg-black pt-5 shadow-md focus:outline-none data-[state=open]:animate-contentShow sm:w-2/3 md:w-1/2 xl:w-1/3"
          onInteractOutside={() => setOpen(false)}
        >
          <PostCreator
            profileImageUrl={profileImageUrl}
            onSuccess={() => setOpen(false)}
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
