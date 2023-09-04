import type { PropsWithChildren, FC } from "react";
import { Sidebar } from "./sidebar";
import { MobileDrawerNav } from "./MobileDrawerNav";
import { useRouter } from "next/router";
import { BackArrowIcon } from "./icons/BackArrowIcon";
import { useRouteHistory } from "../utils/routeHistory";
import { useEffect, useState } from "react";

type HeadingProps = {
  pageName: string;
};

const Heading: FC<HeadingProps> = ({ pageName }) => {
  const router = useRouter();
  const { routeHistory } = useRouteHistory();

  const [showingBackButton, setShowingBackButton] = useState(false);

  // If not in base route and this is not the first page visited in the site, show back button
  useEffect(() => {
    if (router.pathname != "/" && routeHistory.length != 1) {
      setShowingBackButton(true);
    }
  }, [router, routeHistory]);

  const backButtonClick = () => {
    // ensure that the back button does not disappear before the router finishes going back
    setShowingBackButton(true);
    router.back();
  };

  return (
    <div className="sticky top-0 z-10 flex h-auto w-full justify-between self-start border-b border-zinc-700 p-4 text-xl font-bold backdrop-blur-md backdrop-brightness-50">
      <div className="flex items-center gap-2">
        {showingBackButton && (
          <button
            className="rounded-full p-1 hover:bg-zinc-800"
            onClick={backButtonClick}
          >
            <BackArrowIcon />
          </button>
        )}
        {pageName}
      </div>
      <MobileDrawerNav />
      <div className="hidden w-6 sm:block"></div>
    </div>
  );
};

//gives PageLayout child components along with other specified props (like pageName)
interface PageLayoutProps extends PropsWithChildren {
  pageName: string;
}

export const PageLayout: FC<PageLayoutProps> = ({ pageName, children }) => {
  return (
    <div className="flex min-h-screen justify-center">
      <Sidebar />
      <main className="flex w-full min-w-0 flex-col items-center border-zinc-700 sm:border-x md:max-w-2xl md:flex-shrink-0">
        <Heading pageName={pageName} />
        <div className="w-full">{children}</div>
      </main>
      <div className="sticky top-0 hidden h-auto w-[304px] self-start lg:block" />
    </div>
  );
};
