import type { PropsWithChildren } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface TooltipProps extends PropsWithChildren {
  content: string;
  className?: string;
  allScreenSizes?: boolean;
}

export const HoverTooltip = ({
  content,
  children,
  allScreenSizes = false,
  className = "",
}: TooltipProps) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger className={`${className}`} asChild>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>
            <div
              className={`z-10 animate-fadeIn rounded bg-slate-600 bg-opacity-90 p-0.5 text-xs ${
                allScreenSizes ? "" : "lg:hidden"
              }`}
            >
              {content}
            </div>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
