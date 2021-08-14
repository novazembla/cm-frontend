import React, { createContext, useContext } from "react";
import { useState } from "react";
import type { MapPin } from "~/types";

const MapSetPinsContext = createContext<Function>(() => {});
const MapPinsContext = createContext<MapPin[]>([]);

export const useMapSetPinsContext = () => useContext(MapSetPinsContext);
export const useMapPinsContext = () => useContext(MapPinsContext);

// context provider
export const MapContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mapPinsInContext, setMapPins] = useState<MapPin[]>([]);

  const setMapPinsInContext = (pins: MapPin[]) => {
    //if (pins.length > 0) {
      setMapPins(pins);
    // } else {
    //   setMapPins([]);
    // }
  };

  return (
    <MapPinsContext.Provider value={mapPinsInContext}>
      <MapSetPinsContext.Provider value={setMapPinsInContext}>
        {children}
      </MapSetPinsContext.Provider>
    </MapPinsContext.Provider>
  );
};
