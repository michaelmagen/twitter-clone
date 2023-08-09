import React, { createContext, useContext, useEffect, useState } from "react";

import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";

// Create a context
const RouteHistoryContext = createContext<RouteHistoryContextType | undefined>(
  undefined
);

// Define types
type RouteHistoryContextType = {
  routeHistory: string[];
  removeFromHistory: (index: number) => void;
};

// Create a context provider
export const RouteHistoryProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const [routeHistory, setRouteHistory] = useState<string[]>([router.asPath]);

  const removeFromHistory = (index: number) => {
    setRouteHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      newHistory.splice(index, 1);
      return newHistory;
    });
  };

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // do not add route to history if the new route and route just before this are the same
      // this happens when use router.back , do not want to add a second instance of visiting that routes
      if (url == routeHistory[routeHistory.length - 1]) {
        return;
      }
      setRouteHistory((prevHistory) => [...prevHistory, url]);
    };

    const handleBackNavigation = () => {
      setRouteHistory((prevHistory) => {
        const newHistory = [...prevHistory];
        newHistory.pop(); // Remove the last route
        return newHistory;
      });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    window.addEventListener("popstate", handleBackNavigation);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
      window.removeEventListener("popstate", handleBackNavigation);
    };
  }, [router, routeHistory]);

  return (
    <RouteHistoryContext.Provider value={{ routeHistory, removeFromHistory }}>
      {children}
    </RouteHistoryContext.Provider>
  );
};

// Custom hook to use the context
export const useRouteHistory = () => {
  const context = useContext(RouteHistoryContext);

  if (!context) {
    throw new Error(
      "useRouteHistory must be used within a RouteHistoryProvider"
    );
  }

  return context;
};
