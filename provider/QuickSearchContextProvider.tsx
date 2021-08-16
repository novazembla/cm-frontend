import React, { createContext, useContext } from "react";
import { useState } from "react";
import type { QuickSearchResult } from "~/types";

const QuickSearchSetSearchResultContext = createContext<Function>(() => {});
const QuickSearchResultContext = createContext<
  Record<string, QuickSearchResult>
>({});
const QuickSearchHasResultContext = createContext<boolean>(false);

export const useQuickSearchSetSearchResultContext = () =>
  useContext(QuickSearchSetSearchResultContext);
export const useQuickSearchResultContext = () =>
  useContext(QuickSearchResultContext);
export const useQuickSearchHasResultContext = () =>
  useContext(QuickSearchHasResultContext);

// context provider
export const QuickSearchContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [quickSearchResultInContext, setQuickSearchResult] = useState<
    Record<string, QuickSearchResult>
  >({});

  const hasQuickSearchResults =
    Object.keys(quickSearchResultInContext).length > 0;

  const setQuickSearchResultInContext = (
    result: Record<string, QuickSearchResult>
  ) => {
    console.log(
      "setQuickSearchResultInContext",
      result,
      quickSearchResultInContext
    );
    if (JSON.stringify(result) !== JSON.stringify(quickSearchResultInContext)) {
      console.log("setQuickSearchResultInContext");
      // if (Object.keys(result).length != )
      setQuickSearchResult(result);
    }
  };

  return (
    <QuickSearchResultContext.Provider value={quickSearchResultInContext}>
      <QuickSearchHasResultContext.Provider value={hasQuickSearchResults}>
        <QuickSearchSetSearchResultContext.Provider
          value={setQuickSearchResultInContext}
        >
          {children}
        </QuickSearchSetSearchResultContext.Provider>
      </QuickSearchHasResultContext.Provider>
    </QuickSearchResultContext.Provider>
  );
};
