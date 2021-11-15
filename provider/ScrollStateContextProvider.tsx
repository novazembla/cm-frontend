import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

type ScrollContextScopes = "body" | "main" | "vertical";



export type ScrollContext = {
  get: (scope: ScrollContextScopes, key: string) => number;
  set: (scope: ScrollContextScopes, key: string, x: number) => void;
  isBack: () => boolean;
  wasBack: () => boolean;
  setIsBack: (state: boolean) => void;
  setWasBack: (state: boolean) => void;
  getPreviousPath: () => string;
  getCurrentPath: () => string;
  setCurrentPath: (path: string) => void;
};

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
  isBack: () => false,
  wasBack: () => false,
  setIsBack: (state: boolean) => {},
  setWasBack: (state: boolean) => {},
  resetIsBack: (state: boolean) => {},
  getPreviousPath: () => "",
  getCurrentPath: () => "",
  setCurrentPath: (path: string) => {},
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
  console.log("rerender component");
  const currentPathInMemory = useRef("");
  const previousPathInMemory = useRef("");
  const refIsBack = useRef<boolean>(false);
  const refWasBack = useRef<boolean>(false);

  const get = useCallback((scope: ScrollContextScopes, key: string) => {
    return scrollPositions?.[scope]?.[key] ?? 0;
  }, []);

  const set = useCallback(
    (scope: ScrollContextScopes, key: string, x: number) => {
      scrollPositions[scope][key] = x;
    },
    []
  );

  const setIsBack = useCallback(
    (state: boolean) => {
      refIsBack.current = state;
    },
    []
  );

  const setWasBack = useCallback(
    (state: boolean) => {
      refWasBack.current = state;
    },
    []
  );

  const isBack = useCallback(
    () => {
      return refIsBack.current;
    },
    []
  );

  const wasBack = useCallback(
    () => {
      return refWasBack.current;
    },
    []
  );

  const setCurrentPath = useCallback((path: string) => {
    previousPathInMemory.current = `${currentPathInMemory.current}`;
    currentPathInMemory.current = `${path}`;
  }, []);

  const getPreviousPath = useCallback(() => previousPathInMemory.current, []);
  const getCurrentPath = useCallback(() => currentPathInMemory.current, []);

  return (
    <ScrollStateContext.Provider
      value={{
        set,
        get,
        getPreviousPath,
        getCurrentPath,
        setCurrentPath,
        isBack,
        wasBack,
        setIsBack,
        setWasBack,
      }}
    >
      {children}
    </ScrollStateContext.Provider>
  );
};
