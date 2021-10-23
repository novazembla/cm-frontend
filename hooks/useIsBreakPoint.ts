import { useSSRSaveMediaQuery } from ".";

export const useIsBreakPoint = () => {
  const isMobile = useSSRSaveMediaQuery("(max-width: 44.9999em)");
  const isTablet = useSSRSaveMediaQuery("(min-width: 45em) and (max-width: 74.9999em)");
  const isTabletWide = useSSRSaveMediaQuery("(min-width: 62em) and (max-width: 74.9999em)");
  const isDesktop = useSSRSaveMediaQuery("(min-width: 75em) and (max-width: 119.9999em)");
  const isDesktopAndUp = useSSRSaveMediaQuery("(min-width: 75em)");
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTabletWide,
    isDesktopAndUp,
  } as const;
};
