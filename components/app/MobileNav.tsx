import { useEffect } from "react";
import { Flex, IconButton, Box, Grid, chakra } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { RemoveScroll } from "react-remove-scroll";
import FocusLock from "react-focus-lock";

import {
  useMenuButtonContext,
  useConfigContext,
  useQuickSearchContext,
} from "~/provider";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { ActiveLink } from "~/components/ui/ActiveLink";
import { SVG } from "~/components/ui/SVG";
import { PageTitle } from "~/components/ui/PageTitle";

import { useRouter } from "next/router";

export const MobileNav = () => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const config = useConfigContext();
  const router = useRouter();

  const { onMenuToggle, isMenuOpen, onMenuClose } = useMenuButtonContext();
  const { isQuickSearchOpen, onQuickSearchToggle } = useQuickSearchContext();
  const { isMobile, isTablet, isTabletWide, isDesktopAndUp } =
    useIsBreakPoint();

  useEffect(() => {
    const menuEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isMenuOpen) onMenuClose();
      }
    };

    if (typeof document !== "undefined") {
      document.body.addEventListener("keyup", menuEscape);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.body.removeEventListener("keyup", menuEscape);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

  return (
    <>
      <Box id="menu">
        <AnimatePresence>
          {!isDesktopAndUp &&
            (!isMenuOpen ? (
              <Box key="mobile-closed"></Box>
            ) : (
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
                  width: isTablet
                    ? isTabletWide
                      ? "66.66vw"
                      : "80vw"
                    : "100vw",
                  zIndex: 1100,
                }}
                id="menu"
                key="menu-open"
              >
                <RemoveScroll>
                  <FocusLock>
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
                                mt: "1.5em",
                                borderBottom: "0.5px solid",
                                borderColor: "cm.accentLight",
                              },
                            }}
                            direction={{
                              base: "column",
                            }}
                            textStyle="headline"
                            fontWeight="bold"
                            layerStyle="page"
                            position="relative"
                            w="100%"
                            role="navigation"
                          >
                            {isTablet && (
                              <PageTitle
                                type="medium"
                                title={t("menu.title", "Menu")}
                              />
                            )}
                            {config.nav.main.map((link: any, index: number) => {
                              if (link.path[i18n?.language]) {
                                return (
                                  <chakra.span key={`nav-link-${index}`}>
                                    <ActiveLink
                                      href={getMultilangValue(link.path)}
                                    >
                                      <MultiLangValue json={link.title} />
                                    </ActiveLink>
                                  </chakra.span>
                                );
                              }
                              return null;
                            })}

                            <IconButton
                              aria-label={t(
                                "menu.button.closeMenu",
                                "Close menu"
                              )}
                              icon={<SVG type="cross" fill  wrapped width={60} height={60}/>}
                              position="absolute"
                              top="20px"
                              right="20px"
                              borderRadius="0"
                              p="0"
                              className="svgHover tabbedVisible"
                              paddingInlineStart="0"
                              paddingInlineEnd="0"
                              padding="0"
                              bg="transparent"
                              w="30px"
                              h="30px"
                              minW="30px"
                              overflow="hidden"
                              onClick={() => {
                                onMenuClose();
                              }}
                              transition="background-color 0.3s"
                              _hover={{
                                bg: "transparent",
                              }}
                              _active={{
                                bg: "transparent",
                              }}
                              _focus={{
                                bg: "transparent",
                                outline: "solid 2px #E42B20",
                                outlineOffset: "5px",
                              }}
                              transform={
                                isMobile
                                  ? "translateY(-5px) translateX(5px)"
                                  : undefined
                              }
                            />
                          </Flex>
                        </Flex>
                      </Flex>
                    </Box>
                  </FocusLock>
                </RemoveScroll>
              </motion.div>
            ))}
        </AnimatePresence>
      </Box>
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
            touchAction: "none",
          }}
        >
          <Box position="relative" w="52px" h="52px" order={2}>
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
                  aria-label={t("menu.button.closeMenu", "Close menu")}
                  icon={
                    <chakra.div position="relative" width="100%" height="100%">
                      <SVG type="cross" fill />
                    </chakra.div>}
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
                  tabIndex={isMenuOpen ? undefined : -1}
                  aria-controls="menu"
                  aria-haspopup="true"
                  aria-expanded="true"
                  aria-hidden={isMenuOpen ? undefined : "true"}
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
                  aria-label={t("menu.button.openMenu", "Open menu")}
                  icon={
                    <chakra.div position="relative" width="100%" height="100%">
                      <SVG type="menu-mobile" fill />
                    </chakra.div>}
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
                  tabIndex={isMenuOpen ? -1 : undefined}
                  aria-controls="menu"
                  aria-haspopup="true"
                  aria-expanded="false"
                  aria-hidden={isMenuOpen ? "true" : undefined}
                />
              </Box>
            </motion.div>
          </Box>

          <Box position="relative" w="48px" h="48px" order={1}>
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
                    aria-label={t("menu.button.closeSearch", "Close search")}
                    icon={
                      <chakra.div position="relative" width="100%" height="100%">
                        <SVG type="cross" fill />
                      </chakra.div>
                    }
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
                    tabIndex={isQuickSearchOpen ? undefined : -1}
                    aria-controls="search"
                    aria-haspopup="true"
                    aria-expanded="true"
                    aria-hidden={!isQuickSearchOpen ? "true" : undefined}
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
                    aria-label={t("menu.button.openSearch", "Open search")}
                    borderRadius="48px"
                    icon={
                      <chakra.div position="relative" width="100%" height="100%">
                        <SVG type="search" fill />
                      </chakra.div>
                    }
                    w="48px"
                    h="48px"
                    border="none"
                    pointerEvents={isQuickSearchOpen ? "none" : undefined}
                    tabIndex={isQuickSearchOpen ? -1 : undefined}
                    aria-hidden={isQuickSearchOpen ? "true" : undefined}
                    onClick={() => {
                      onQuickSearchToggle();
                    }}
                    aria-controls="search"
                    aria-haspopup="true"
                    aria-expanded="false"
                  />
                </Box>
              </motion.div>
            </motion.div>
          </Box>

          <motion.div
            animate={{ opacity: isMenuOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            style={{
              order: 3,
            }}
          >
            <IconButton
              variant="outline"
              aria-label={t(
                "menu.button.suggestLocation",
                "Suggest a new location"
              )}
              borderRadius="100"
              icon={
                <chakra.div position="relative" width="100%" height="100%">
                  <SVG type="suggestion" fill />
                </chakra.div>
              }
              w="48px"
              h="48px"
              border="none"
              onClick={() => {
                if (i18n.language === "de") {
                  router.push(`/ort-vorschlagen`);
                } else {
                  router.push(`/suggest-a-location`);
                }
              }}
              pointerEvents={isMenuOpen ? "none" : undefined}
              tabIndex={isMenuOpen ? -1 : undefined}
              aria-hidden={isMenuOpen ? "true" : undefined}
            />
          </motion.div>
        </Flex>
      )}
    </>
  );
};
