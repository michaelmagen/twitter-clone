import Image from "next/image";
import { useState } from "react";
import { toast } from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

interface PostCreatorProps {
  profileImageUrl: string;
  onSuccess?: () => void;
}

export const PostCreator = ({
  profileImageUrl,
  onSuccess,
}: PostCreatorProps) => {
  const [input, setInput] = useState("");

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAllInfinite.invalidate();
      if (onSuccess) {
        // run the success function passed in in props
        onSuccess();
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
  return (
    <>
      <div className="flex gap-3  p-4">
        <Image
          src={profileImageUrl}
          alt={"profile Image"}
          width={56}
          height={56}
          className="h-12 w-12 rounded-full"
        />
        <div className="w-full">
          <TextareaAutosize
            className="my-2 w-full resize-none overflow-hidden bg-transparent text-xl placeholder-gray-400 outline-none"
            placeholder="What's happening?"
            value={input}
            disabled={isPosting}
            onChange={(e) => setInput(e.target.value)}
            maxLength={255}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (input !== "") {
                  mutate({ content: input });
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
                  onClick={() => mutate({ content: input })}
                  disabled={input === ""}
                >
                  <span className="text-base font-bold">Tweet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
