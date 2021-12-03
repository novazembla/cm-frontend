import React, { createContext, useContext, useRef, useEffect } from "react";
import { useState } from "react";
import type { MapPin } from "~/types";
import { useConfigContext,  } from "~/provider";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { CultureMap } from "~/services";
import { useRouter } from "next/router";

const MapContext = createContext<CultureMap | null>(null)

export const useMapContext = () => useContext(MapContext);

let mapInstance: CultureMap | null = null;
// context provider
export const MapContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  
  const translationHelper = useAppTranslations();
  const config = useConfigContext();

  if (router && translationHelper && config && !mapInstance)
    mapInstance = new CultureMap(router, translationHelper, config);
 
  return (
    <MapContext.Provider value={mapInstance}>
      {children}
    </MapContext.Provider>
  );
};
