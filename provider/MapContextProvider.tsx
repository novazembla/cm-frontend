import React, { createContext } from "react";
import { useState } from "react";

type MapContextData = { 
  setPins: any;
  pins: any[]; 
}

// create context
export const MapContext = createContext<MapContextData>({
  setPins: () => {},
  pins: []
});

// context provider
export const MapContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [pins, setPins] = useState<any[]>([])

  return (
    <MapContext.Provider value={{pins, setPins}}>
      {children}
    </MapContext.Provider>
  );
};
