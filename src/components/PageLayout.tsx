import type { PropsWithChildren, FC } from "react";
import { Sidebar } from "./sidebar";

type HeadingProps = {
  pageName: string;
};

const Heading: FC<HeadingProps> = ({ pageName }) => {
  return (
    <div className="sticky top-0  h-auto w-full self-start border-b border-zinc-700 p-4 text-xl font-bold backdrop-blur-md backdrop-brightness-50">
      {pageName}
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
      <main className="flex w-full flex-col items-center border-x border-zinc-700 md:max-w-2xl">
        <Heading pageName={pageName} />
        <div className="w-full">{children}</div>
      </main>
      <div className="sticky top-0 h-auto w-64 self-start">Search</div>
    </div>
  );
};
