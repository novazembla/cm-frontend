import React, { createContext, useContext } from "react";
import { useState } from "react";
import type { QuickSearchResult } from "~/types";

const QuickSearchContext = createContext<any>({});

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
      }}
    >
      {children}
    </QuickSearchContext.Provider>
  );
};
