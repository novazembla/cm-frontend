import React, { createContext, useContext } from "react";
import { AppConfig } from "~/types";

import { appConfig } from "~/config";


// create context
const ConfigContext = createContext<AppConfig>(appConfig);

export const useConfigContext = () => useContext(ConfigContext);

// context provider
export const ConfigContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ConfigContext.Provider value={appConfig}>
      {children}
    </ConfigContext.Provider>
  );
};
