import type { PropsWithChildren, FC } from "react";
import { Sidebar } from "./sidebar";
import { MobileDrawerNav } from "./MobileDrawerNav";

type HeadingProps = {
  pageName: string;
};

const Heading: FC<HeadingProps> = ({ pageName }) => {
  return (
    <div className="sticky top-0 z-10 flex h-auto w-full justify-between self-start border-b border-zinc-700 p-4 text-xl font-bold backdrop-blur-md backdrop-brightness-50">
      {pageName}
      <MobileDrawerNav />
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
