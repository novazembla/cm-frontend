import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from "react";

type TourContext = {
  stop: number;
  setStop: Function;  
};

// create context
const TourContext = createContext<TourContext>({
  stop: 0,
  setStop: () => {},
});

export const useTourContext = () => useContext(TourContext);

// context provider
export const TourContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [stop, setStop] = useState(0);
  

  return (
    <TourContext.Provider
      value={{
        stop,
        setStop,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};
