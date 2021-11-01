import React, { createContext, useContext } from "react";

type ScrollContextScopes = "body" | "main" | "vertical";

export type ScrollContext = {
  get: (scope: ScrollContextScopes, key: string) => number;
  set: (scope: ScrollContextScopes, key: string, x: number) => void;
  isBack: () => boolean;
  setIsBack: (state: boolean) => void;
};

let isBack = false;

const scrollPositions: Record<ScrollContextScopes, Record<string, number>> = {
  body: {},
  main: {},
  vertical: {},
};

const scrollContext = {
  get: (scope: ScrollContextScopes, key: string) =>
    scrollPositions?.[scope]?.[key] ?? 0,
  set: (scope: ScrollContextScopes, key: string, x: number) => {
    scrollPositions[scope][key] = x;
  },
  isBack: () => isBack,
  setIsBack: (state: boolean) => {isBack = state},
};

// create context
const ScrollStateContext = createContext<ScrollContext>(scrollContext);

export const useScrollStateContext = () => useContext(ScrollStateContext);

// context provider
export const ScrollStateContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  
  return (
    <ScrollStateContext.Provider value={scrollContext}>
      {children}
    </ScrollStateContext.Provider>
  );
};
