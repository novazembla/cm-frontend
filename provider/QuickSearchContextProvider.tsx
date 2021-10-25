import React, { createContext, useContext } from "react";
import { useState } from "react";
import type { QuickSearchResult } from "~/types";


type QuickSearchContext = {
  quickSearchResult: any;
  isQuickSearchOpen: boolean;
  setQuickSearchResult: (results: Record<string, QuickSearchResult>) => void;
  onQuickSearchToggle: Function;
  onQuickSearchClose: Function;
  onQuickSearchOpen: Function;
};

const QuickSearchContext = createContext<QuickSearchContext>({
  quickSearchResult: null,
  isQuickSearchOpen: false,
  setQuickSearchResult: (results: Record<string, QuickSearchResult>) => {},
  onQuickSearchToggle: () => {},
  onQuickSearchClose: () => {},
  onQuickSearchOpen: () => {},
});

export const useQuickSearchContext = () => useContext(QuickSearchContext);

// context provider
export const QuickSearchContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isQuickSearchOpen, onQuickSearchToggle] = useState(false);
  const [quickSearchResult, setQuickSearchResultState] = useState<
    Record<string, QuickSearchResult>
  >({});

  const hasQuickSearchResults = Object.keys(quickSearchResult).length > 0;

  const setQuickSearchResult = (result: Record<string, QuickSearchResult>) => {
    if (JSON.stringify(result) !== JSON.stringify(quickSearchResult)) {
      console.log("setQuickSearchResultInContext");
      // if (Object.keys(result).length != )
      setQuickSearchResultState(result);
    }
  };

  return (
    <QuickSearchContext.Provider
      value={{
        quickSearchResult,
        setQuickSearchResult,
        isQuickSearchOpen,
        onQuickSearchToggle: () => onQuickSearchToggle(!isQuickSearchOpen),
        onQuickSearchClose: () => onQuickSearchToggle(false),
        onQuickSearchOpen: () => onQuickSearchToggle(true),
      }}
    >
      {children}
    </QuickSearchContext.Provider>
  );
};
