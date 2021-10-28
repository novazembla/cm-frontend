import React from "react";
import Search from "~/assets/svg/mobil_navigation_leiste_suche.svg";
import Cross from "~/assets/svg/Kreuz.svg";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { Box, IconButton } from "@chakra-ui/react";

import { Header, Map, QuickSearch, MobileNav } from ".";
import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { AppProps } from "~/types";
import { LoadingBar } from ".";
import { useMenuButtonContext, useQuickSearchContext } from "~/provider";

export const LayoutFull = ({ children }: AppProps) => {
  //  const { hasQuickSearchResults } = useQuickSearchContext();
  const router = useRouter();

  const { t } = useAppTranslations();
  const { isMobile, isTablet, isTabletWide, isDesktopAndUp } =
    useIsBreakPoint();
  const { onMenuToggle, isMenuOpen } = useMenuButtonContext();
  const { isQuickSearchOpen, onQuickSearchToggle } = useQuickSearchContext();

  return (
    <>
      <Head>
        <link
          href="https://unpkg.com/maplibre-gl@1.15.2/dist/maplibre-gl.css"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <LoadingBar color="cm.accentLight" />
      <Map />
      <Header />

      <AnimatePresence>
        <motion.div
          key={`ccc-${router.asPath}`}
          id={`p-${router.asPath.replace(/[^a-z]/g, "")}`}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: !isMobile ? "fixed" : "absolute",
            zIndex: 3,
            height: "100vh",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {(isMobile || isTablet) && <MobileNav />}
      <QuickSearch />
      <Box position="fixed" right="20px" top="100px" zIndex="3">
        {(isTabletWide || isDesktopAndUp) && (
          <Box
            position="relative"
            w="55px"
            h="55px"
            bg="#fff"
            borderRadius="55px"
          >
            <motion.div
              animate={{ opacity: isQuickSearchOpen ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                w="55px"
                h="55px"
                zIndex={isQuickSearchOpen ? 2 : 1}
              >
                <IconButton
                  aria-label={t("menu.button.togggleSearch", "Search")}
                  icon={<Cross />}
                  borderRadius="100"
                  p="0"
                  paddingInlineStart="0"
                  paddingInlineEnd="0"
                  w="55px"
                  h="55px"
                  onClick={() => {
                    onQuickSearchToggle();
                  }}
                  pointerEvents={isQuickSearchOpen ? undefined : "none"}
                  transition="all 0.3s"
                  _hover={{
                    filter: "brightness(70%)",
                  }}
                />
              </Box>
            </motion.div>
            <motion.div
              animate={{ opacity: isQuickSearchOpen ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                w="55px"
                h="55px"
                zIndex={isQuickSearchOpen ? 1 : 2}
              >
                <IconButton
                  aria-label={t("menu.button.togggleSearch", "Search")}
                  icon={<Search />}
                  borderRadius="100"
                  p="0"
                  paddingInlineStart="0"
                  paddingInlineEnd="0"
                  w="55px"
                  h="55px"
                  onClick={() => {
                    if (isMenuOpen && !isQuickSearchOpen) {
                      onMenuToggle();
                    }
                    onQuickSearchToggle();
                  }}
                  transition="all 0.3s"
                  _hover={{
                    filter: "brightness(70%)",
                  }}
                  pointerEvents={isQuickSearchOpen ? "none" : undefined}
                />
              </Box>
            </motion.div>
          </Box>
        )}
      </Box>
    </>
  );
};
export default LayoutFull;
