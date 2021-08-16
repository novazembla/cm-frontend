import React, { createContext, useContext, useRef, useEffect } from "react";
import { useState } from "react";
import type { MapPin } from "~/types";
import { CultureMap } from "~/services";

const MapContext = createContext<CultureMap | undefined>(undefined)

export const useMapContext = () => useContext(MapContext);

// context provider
export const MapContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cultureMapRef = useRef<CultureMap>(new CultureMap());
 
  return (
    <MapContext.Provider value={cultureMapRef.current}>
      {children}
    </MapContext.Provider>
  );
};
