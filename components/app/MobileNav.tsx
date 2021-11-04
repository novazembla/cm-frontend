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
              height: "calc(var(--vh) * 100)",
              width: isTablet ? (isTabletWide ? "66.66vw" : "80vw") : "100vw",
              zIndex: 1100,
            }}
          >
            <RemoveScroll>
              <Box
                h="calc(var(--vh) * 100)"
                layerStyle="pageBg"
                w="100%"
                overflowY="auto"
                pt="60px"
                pb={{
                  base: "80px",
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
          h="80px"
          layerStyle="blurredLightGray"
          position="fixed"
          left="0"
          bottom="0"
          zIndex="modal"
          justifyContent="space-evenly"
          alignItems="center"
          px="10%"
          sx={{
            touchAction: "none"
          }}
        >
          <Box position="relative" w="48px" h="48px">
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
                  w="48px"
                  h="48px"
                  zIndex={isMenuOpen ? 2 : 1}
                  bg="#fff"
                  borderRadius="70"
                >
                  <IconButton
                    variant="outline"
                    aria-label={t("menu.button.toggleMenu", "Menu")}
                    icon={<SVG type="cross" width="52px" height="52px" />}
                    borderRadius="100"
                    p="0"
                    paddingInlineStart="0"
                    paddingInlineEnd="0"
                    w="48px"
                    h="48px"
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
                  w="48px"
                  h="48px"
                  zIndex={isMenuOpen ? 1 : 2}
                >
                  <IconButton
                    variant="outline"
                    aria-label={t("menu.button.togggleSearch", "Search")}
                    borderRadius="48px"
                    icon={<SVG type="search" width="48px" height="48px" />}
                    w="48px"
                    h="48px"
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
          <Box position="relative" w="52px" h="52px">
            <motion.div
              animate={{ opacity: isMenuOpen ? 1 : 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                position="absolute"
                top="0"
                left="0"
                w="52px"
                h="52px"
                zIndex={isMenuOpen ? 2 : 1}
                bg="#fff"
                borderRadius="70"
              >
                <IconButton
                  variant="outline"
                  aria-label={t("menu.button.toggleMenu", "Menu")}
                  icon={<SVG type="cross" width="58px" height="58px" />}
                  borderRadius="100"
                  p="0"
                  paddingInlineStart="0"
                  paddingInlineEnd="0"
                  w="52px"
                  h="52px"
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
                w="52px"
                h="52px"
                zIndex={isMenuOpen ? 1 : 2}
              >
                <IconButton
                  variant="outline"
                  aria-label={t("menu.button.toggleMenu", "Menu")}
                  icon={<SVG type="menu-mobile" width="64px" height="64px" />}
                  borderRadius="100"
                  p="0"
                  paddingInlineStart="0"
                  paddingInlineEnd="0"
                  w="52px"
                  h="52px"
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
              icon={<SVG type="suggestion" width="48px" height="48px" />}
              w="48px"
              h="48px"
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
