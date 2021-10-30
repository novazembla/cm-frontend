import { Flex, IconButton, Box, Grid, chakra } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { RemoveScroll } from "react-remove-scroll";

import Search from "~/assets/svg/mobil_navigation_leiste_suche.svg";
import Menu from "~/assets/svg/mobil_navigation_leiste_menu.svg";
import Cross from "~/assets/svg/Kreuz.svg";
import Suggest from "~/assets/svg/mobil_navigation_leiste_vorschlag.svg";

import {
  useMenuButtonContext,
  useConfigContext,
  useQuickSearchContext,
} from "~/provider";
import { useIsBreakPoint, useAppTranslations } from "~/hooks";
import { ActiveLink, MultiLangValue } from "~/components/ui";
import { useRouter } from "next/router";

export const MobileNav = () => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const config = useConfigContext();
  const router = useRouter();

  const { onMenuToggle, isMenuOpen } = useMenuButtonContext();
  const { isQuickSearchOpen, onQuickSearchToggle } = useQuickSearchContext();
  const { isMobile, isTablet, isTabletWide, isDesktopAndUp } =
    useIsBreakPoint();

  console.log(
    isMobile,
    isTablet,
    isTabletWide,
    isTablet ? (isTabletWide ? "50vw" : "66.66vw") : "100vw"
  );

  return (
    <>
      <AnimatePresence>
        {isMenuOpen && !isDesktopAndUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              height: "100vh",
              width: isTablet ? (isTabletWide ? "66.66vw" : "80vw") : "100vw",
              zIndex: 1100,
            }}
          >
            <RemoveScroll>
              <Box
                h="100vh"
                layerStyle="pageBg"
                w="100%"
                overflowY="auto"
                pt="60px"
                pb={{
                  base: "100px",
                  md: "45px",
                }}
              >
                <Flex
                  overflow="hidden"
                  minH="100%"
                  alignItems={isTablet ? "flex-start" : "flex-end"}
                >
                  <Flex layerStyle="page" w="100%" minH="100%" h="100%">
                    <Flex
                      sx={{
                        a: {
                          display: "inline-block",
                          marginBottom: "0.3em",
                          _last: {
                            marginBottom: 0,
                          },
                          pb: "3px",
                          mt: "0.5em",
                          borderBottom: "1px solid #ff0",
                          borderColor: "cm.accentLight",
                        },
                      }}
                      direction={{
                        base: "column",
                      }}
                      textStyle="headline"
                      fontWeight="bold"
                    >
                      {config.nav.main.map((link: any, index: number) => (
                        <chakra.span key={`nav-link-${index}`}>
                          <ActiveLink href={getMultilangValue(link.path)}>
                            <MultiLangValue json={link.title} />
                          </ActiveLink>
                        </chakra.span>
                      ))}
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            </RemoveScroll>
          </motion.div>
        )}
      </AnimatePresence>
      {isMobile && (
        <Flex
          w="100%"
          h="100px"
          layerStyle="blurredLightGray"
          position="fixed"
          left="0"
          top="calc(100vh - 100px)"
          zIndex="modal"
          justifyContent="space-evenly"
          alignItems="center"
        >
          <motion.div
            animate={{ opacity: isMenuOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <IconButton
              aria-label={t("menu.button.togggleSearch", "Search")}
              borderRadius="55px"
              icon={<Search />}
              w="55px"
              h="55px"
              pointerEvents={isMenuOpen ? "none" : undefined}
              onClick={() => {
                onQuickSearchToggle();
              }}
            />
          </motion.div>
          <Box position="relative" w="70px" h="70px">
            <motion.div
              animate={{ opacity: isMenuOpen ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                w="70px"
                h="70px"
                zIndex={isMenuOpen ? 2 : 1}
                bg="#fff"
                borderRadius="70"
              >
                <IconButton
                  aria-label={t("menu.button.toggleMenu", "Menu")}
                  icon={<Cross />}
                  borderRadius="100"
                  p="0"
                  paddingInlineStart="0"
                  paddingInlineEnd="0"
                  w="70px"
                  h="70px"
                  onClick={() => {
                    onMenuToggle();
                  }}
                  pointerEvents={isMenuOpen ? undefined : "none"}
                />
              </Box>
            </motion.div>
            <motion.div
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                w="70px"
                h="70px"
                zIndex={isMenuOpen ? 1 : 2}
              >
                <IconButton
                  aria-label={t("menu.button.toggleMenu", "Menu")}
                  icon={<Menu />}
                  borderRadius="100"
                  p="0"
                  paddingInlineStart="0"
                  paddingInlineEnd="0"
                  w="70px"
                  h="70px"
                  onClick={() => {
                    if (!isMenuOpen && isQuickSearchOpen) {
                      onQuickSearchToggle();
                    }
                    onMenuToggle();
                  }}
                  pointerEvents={isMenuOpen ? "none" : undefined}
                />
              </Box>
            </motion.div>
          </Box>

          <motion.div
            animate={{ opacity: isMenuOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <IconButton
              aria-label={t(
                "menu.button.suggestLocation",
                "Suggest a new location"
              )}
              borderRadius="100"
              icon={<Suggest />}
              w="55px"
              h="55px"
              onClick={() => {
                if (i18n.language === "de") {
                  router.push(`/kartenpunktvorschlag`);
                } else {
                  router.push(`/suggest-a-location`);
                }
              }}
              pointerEvents={isMenuOpen ? "none" : undefined}
            />
          </motion.div>
        </Flex>
      )}
    </>
  );
};
