import React, { createContext, useContext, useState } from "react";

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
  return (
    <MainContentContext.Provider
      value={{
        isMainContentOpen,
        setMainContentStatus: (state: boolean) => onMainContentToggle(state),
      }}
    >
      {children}
    </MainContentContext.Provider>
  );
};
