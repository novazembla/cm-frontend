import React, { createContext, useContext, useRef, useEffect } from "react";
import { useState } from "react";
import type { MapPin } from "~/types";
import { useConfigContext,  } from "~/provider";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { CultureMap } from "~/services";
import { useRouter } from "next/router";

const MapContext = createContext<CultureMap | undefined>(undefined)

export const useMapContext = () => useContext(MapContext);

// context provider
export const MapContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  
  const tranlationHelper = useAppTranslations();
  const config = useConfigContext();

  const cultureMapRef = useRef<CultureMap>(new CultureMap(router, tranlationHelper, config));
 
  return (
    <MapContext.Provider value={cultureMapRef.current}>
      {children}
    </MapContext.Provider>
  );
};
