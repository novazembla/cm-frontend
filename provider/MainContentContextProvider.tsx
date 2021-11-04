import React, { createContext, useContext, useState, useCallback } from "react";

type MainContentContext = {
  isMainContentOpen: boolean;
  setMainContentStatus: Function;
};

// create context
const MainContentContext = createContext<MainContentContext>({
  isMainContentOpen: true,
  setMainContentStatus: (state: boolean) => {},
});

export const useMainContentContext = () => useContext(MainContentContext);

// context provider
export const MainContentContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isMainContentOpen, onMainContentToggle] = useState(true);

  const setMainContentStatus = useCallback(
    (state: boolean) => onMainContentToggle(state),
    [onMainContentToggle]
  );
  return (
    <MainContentContext.Provider
      value={{
        isMainContentOpen,
        setMainContentStatus,
      }}
    >
      {children}
    </MainContentContext.Provider>
  );
};
