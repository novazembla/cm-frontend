import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

type MainContentContext = {
  isMainContentOpen: boolean;
  setMainContentStatus: Function;
  setMainContentFunctions: Function;
  mainContentClose: Function;
  mainContentOpen: Function;
};

// create context
const MainContentContext = createContext<MainContentContext>({
  isMainContentOpen: true,
  setMainContentStatus: (state: boolean) => {},
  setMainContentFunctions: (open: Function, close: Function) => {},
  mainContentOpen: () => {},
  mainContentClose: () => {},
});

export const useMainContentContext = () => useContext(MainContentContext);

// context provider
export const MainContentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMainContentOpen, onMainContentToggle] = useState(true);
  const refOpen = useRef<any>(null);
  const refClose = useRef<any>(null);

  const setMainContentStatus = useCallback(
    (state: boolean) => onMainContentToggle(state),
    [onMainContentToggle]
  );

  const setMainContentFunctions = useCallback(
    (open: Function, close: Function) => {
      refOpen.current = open;
      refClose.current = close;
    },
    []
  );

  const mainContentOpen = useCallback(() => {
    if (refOpen.current && typeof refOpen.current === "function")
      refOpen.current.call(null);
  }, []);

  const mainContentClose = useCallback(() => {
    console.log("close");
    if (refClose.current && typeof refClose.current === "function")
      refClose.current.call(null);
  }, []);

  return (
    <MainContentContext.Provider
      value={{
        isMainContentOpen,
        setMainContentStatus,
        setMainContentFunctions,
        mainContentOpen,
        mainContentClose,
      }}
    >
      {children}
    </MainContentContext.Provider>
  );
};
