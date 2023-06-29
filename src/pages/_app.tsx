import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";

const RedirectIfNotRegistered = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    const checkState = async () => {
      if (
        router.pathname !== "/register" &&
        isLoaded &&
        isSignedIn &&
        user &&
        (!user.unsafeMetadata.displayName || !user.unsafeMetadata.displayName)
      ) {
        await router.push("/register");
      }
    };
    void checkState();
  }, [isSignedIn, router, user, isLoaded]);

  return <>{children}</>;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider
      {...pageProps}
      appearance={{
        baseTheme: dark,
      }}
    >
      <Toaster position="bottom-center" />
      <RedirectIfNotRegistered>
        <Component {...pageProps} />
      </RedirectIfNotRegistered>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
