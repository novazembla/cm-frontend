import { useSSRSaveMediaQuery } from ".";

export const useIsBreakPoint = () => {
  const isMobile = useSSRSaveMediaQuery("(max-width: 44.9999em)");
  const isTablet = useSSRSaveMediaQuery("(min-width: 45em) and (max-width: 74.9999em)");
  const isDesktop = useSSRSaveMediaQuery("(min-width: 75em) and (max-width: 119.9999em)");
  return {
    isMobile,
    isTablet,
    isDesktop,
  } as const;
};
