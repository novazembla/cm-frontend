import { Flex, IconButton, Box, Grid, chakra } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { RemoveScroll } from "react-remove-scroll";

import {
  useMenuButtonContext,
  useConfigContext,
  useQuickSearchContext,
} from "~/provider";
import { useIsBreakPoint, useAppTranslations } from "~/hooks";
import { ActiveLink, MultiLangValue, SVG } from "~/components/ui";
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
                  base: "60px",
                  md: "45px",
                }}
              >
                <Flex
                  overflow="hidden"
                  minH="100%"
                  alignItems={isTablet ? "flex-start" : "flex-end"}
                >
                  <Flex w="100%" minH="100%" h="100%">
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
                      layerStyle="page"
                    >
                      {isTablet && (
                        <Box layerStyle="headingPullOut" mb="3">
                          <chakra.h1
                            className="highlight"
                            color="cm.text"
                            fontWeight="bold"
                          >
                            {t("menu.title", "Menu")}
                          </chakra.h1>
                        </Box>
                      )}
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
          h="60px"
          layerStyle="blurredLightGray"
          position="fixed"
          left="0"
          bottom="0"
          zIndex="modal"
          justifyContent="space-evenly"
          alignItems="center"
          px="10%"
        >
          <Box position="relative" w="38px" h="38px">
            <motion.div
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ opacity: isQuickSearchOpen ? 1 : 0 }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w="38px"
                  h="38px"
                  zIndex={isMenuOpen ? 2 : 1}
                  bg="#fff"
                  borderRadius="70"
                >
                  <IconButton
                    variant="outline"
                    aria-label={t("menu.button.toggleMenu", "Menu")}
                    icon={<SVG type="cross" width="42px" height="42px" />}
                    borderRadius="100"
                    p="0"
                    paddingInlineStart="0"
                    paddingInlineEnd="0"
                    w="38px"
                    h="38px"
                    border="none"
                    onClick={() => {
                      onQuickSearchToggle();
                    }}
                    pointerEvents={isQuickSearchOpen ? undefined : "none"}
                  />
                </Box>
              </motion.div>
              <motion.div
                animate={{ opacity: isQuickSearchOpen ? 0 : 1 }}
                initial={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  w="38px"
                  h="38px"
                  zIndex={isMenuOpen ? 1 : 2}
                >
                  <IconButton
                    variant="outline"
                    aria-label={t("menu.button.togggleSearch", "Search")}
                    borderRadius="38px"
                    icon={<SVG type="search" width="38px" height="38px" />}
                    w="38px"
                    h="38px"
                    border="none"
                    pointerEvents={isQuickSearchOpen ? "none" : undefined}
                    onClick={() => {
                      onQuickSearchToggle();
                    }}
                  />
                </Box>
              </motion.div>
            </motion.div>
          </Box>
          <Box position="relative" w="42px" h="42px">
            <motion.div
              animate={{ opacity: isMenuOpen ? 1 : 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                w="42px"
                h="42px"
                zIndex={isMenuOpen ? 2 : 1}
                bg="#fff"
                borderRadius="70"
              >
                <IconButton
                  variant="outline"
                  aria-label={t("menu.button.toggleMenu", "Menu")}
                  icon={<SVG type="cross" width="48px" height="48px" />}
                  borderRadius="100"
                  p="0"
                  paddingInlineStart="0"
                  paddingInlineEnd="0"
                  w="42px"
                  h="42px"
                  border="none"
                  onClick={() => {
                    onMenuToggle();
                  }}
                  pointerEvents={isMenuOpen ? undefined : "none"}
                />
              </Box>
            </motion.div>
            <motion.div
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              initial={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                w="42px"
                h="42px"
                zIndex={isMenuOpen ? 1 : 2}
              >
                <IconButton
                  variant="outline"
                  aria-label={t("menu.button.toggleMenu", "Menu")}
                  icon={<SVG type="menu-mobile" width="48px" height="48px" />}
                  borderRadius="100"
                  p="0"
                  paddingInlineStart="0"
                  paddingInlineEnd="0"
                  w="42px"
                  h="42px"
                  border="none"
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
              variant="outline"
              aria-label={t(
                "menu.button.suggestLocation",
                "Suggest a new location"
              )}
              borderRadius="100"
              icon={<SVG type="suggestion" width="38px" height="38px" />}
              w="38px"
              h="38px"
              border="none"
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
