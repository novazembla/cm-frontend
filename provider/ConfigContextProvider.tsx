import React, { createContext } from "react";
import { AppConfig } from "~/types";

import { appConfig } from "~/config";


// create context
export const ConfigContext = createContext<AppConfig>(appConfig);

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
