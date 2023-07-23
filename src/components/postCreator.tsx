import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

interface PostCreatorProps {
  profileImageUrl: string;
  onSuccessfulPost?: () => void;
  postIdToReplyTo?: string;
}

export const PostCreator = ({
  profileImageUrl,
  onSuccessfulPost,
  postIdToReplyTo,
}: PostCreatorProps) => {
  const [input, setInput] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const ctx = api.useContext();

  const { mutate: mutatePost, isLoading: isPostingPost } =
    api.posts.create.useMutation({
      onSuccess: () => {
        setInput("");
        void ctx.posts.getAllInfinite.invalidate();
        if (onSuccessfulPost) {
          // run the success function passed in in props
          onSuccessfulPost();
        }
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to post! Please try again later.");
        }
      },
    });

  const { mutate: mutateReply, isLoading: isPostingReply } =
    api.replys.create.useMutation({
      onSuccess: () => {
        setInput("");
        void ctx.replys.getAllInfiniteById.invalidate();
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;
        if (errorMessage && errorMessage[0]) {
          toast.error(errorMessage[0]);
        } else {
          toast.error("Failed to reply! Please try again later.");
        }
      },
    });

  // if one of the mutations is posting, then set the posting state to true
  useEffect(() => {
    setIsPosting(isPostingPost || isPostingReply);
  }, [isPostingPost, isPostingReply]);

  const handlePostOrReplyCreation = () => {
    // if there is a post id to reply to, then we are creating a reply not a post
    // otherwise we are creating a post, so call the proper mutation
    if (postIdToReplyTo) {
      mutateReply({ postId: postIdToReplyTo, content: input });
    } else {
      mutatePost({ content: input });
    }
  };

  return (
    <>
      <div className="flex gap-3 border-b border-zinc-700 p-4">
        <Image
          src={profileImageUrl}
          alt={"profile Image"}
          width={56}
          height={56}
          className="h-10 w-10 rounded-full"
        />
        <div className="w-full">
          <TextareaAutosize
            className="my-2 w-full resize-none overflow-hidden bg-transparent text-xl placeholder-gray-400 outline-none"
            placeholder={postIdToReplyTo ? "Reply!" : "What's happening?"}
            value={input}
            disabled={isPosting}
            onChange={(e) => setInput(e.target.value)}
            maxLength={255}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (input !== "") {
                  handlePostOrReplyCreation();
                }
              }
            }}
          />
          <div className="flex justify-end">
            {!isPosting && input.length > 0 && (
              <span className="mr-2 flex items-center text-sm text-sky-500 ">
                {input.length}/255
              </span>
            )}
            <div className="flex h-10 w-20 items-center justify-center">
              {isPosting && <LoadingSpinner size={28} />}
              {!isPosting && (
                <button
                  className="h-full w-full rounded-full bg-sky-500 enabled:hover:bg-sky-600 disabled:opacity-50"
                  onClick={handlePostOrReplyCreation}
                  disabled={input === ""}
                >
                  <span className="text-base font-bold">
                    {postIdToReplyTo ? "Reply" : "Tweet"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
