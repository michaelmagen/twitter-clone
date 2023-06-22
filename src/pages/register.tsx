import { useUser, SignedIn } from "@clerk/nextjs";
import { type NextPage } from "next";
import { type SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "~/components/loading";

const inputSchema = z.object({
  displayName: z
    .string()
    .min(4, { message: "Display name must contain at least 4 characters" })
    .max(15, { message: "Display name must contain at most 15 characters" }),
  username: z
    .string()
    .min(4, { message: "Username must contain at least 4 characters" })
    .max(15, { message: "Username must contain at most 15 characters" }),
});

type Inputs = z.infer<typeof inputSchema>;

const Register: NextPage = () => {
  const [isLoading, setLoading] = useState(false);
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(inputSchema) });
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true);
    console.log(data);
    if (!user) {
      return;
    }

    try {
      await user.update({
        unsafeMetadata: {
          displayName: data.displayName,
          username: data.username,
        },
      });
    } catch (e) {
      // todo: add toast to show error
      console.log(e);
      return;
    }

    // after successful submittion send user to home page
    await router.push("/");
    setLoading(false);
  };

  // check that the user has already signed in with clerk
  // if the user already has a username and fullname they do not need to register here
  useEffect(() => {
    const checkSignUp = async () => {
      if (
        isSignedIn === false ||
        (user &&
          user.unsafeMetadata.displayName &&
          user.unsafeMetadata.username)
      ) {
        await router.push("/");
      }
    };
    void checkSignUp();
  }, [user, isSignedIn, router]);

  const originalUserName = (user?.unsafeMetadata.username as string) ?? "";

  return (
    <SignedIn>
      <div className="flex h-screen items-center justify-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-full max-w-md flex-col rounded-lg border border-zinc-700 p-4"
        >
          <p className="text-center text-2xl font-bold">Complete Sign Up</p>
          <p className="text-center text-base text-gray-400">
            To complete the signing up proccess, please enter your desired
            display name and username.
          </p>
          <label className="py-1 font-bold">Display Name</label>
          <input
            {...register("displayName")}
            className="w-full rounded border border-zinc-700 bg-black p-1 text-white focus:outline-none"
          />
          <p className="h-5 pb-4 text-sm text-gray-400">
            {errors.displayName?.message}
          </p>
          <label className="py-1 font-bold">Username</label>
          <div className="flex">
            <span className="flex items-center justify-center text-xl">@</span>
            <input
              {...register("username")}
              defaultValue={originalUserName}
              className="w-full rounded border border-zinc-700 bg-black p-1 text-white focus:outline-none"
            />
          </div>
          <p className="h-5 pb-4 text-sm text-gray-400">
            {errors.username?.message}
          </p>
          {!isLoading && (
            <button
              type="submit"
              className="mt-3 h-full w-full rounded-full bg-sky-500 p-2 hover:bg-sky-600 disabled:opacity-50"
            >
              <span className="text-base font-bold">Submit</span>
            </button>
          )}
          {isLoading && (
            <div className="mt-3 flex h-10 items-center justify-center">
              <LoadingSpinner size={32} />
            </div>
          )}
        </form>
      </div>
    </SignedIn>
  );
};

export default Register;
