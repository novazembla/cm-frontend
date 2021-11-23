import { useRef, useEffect } from "react";
import { Flex, Box, IconButton, chakra } from "@chakra-ui/react";

import { useAppTranslations, useIsBreakPoint } from "~/hooks";

import { motion } from "framer-motion";

import {
  InlineLanguageButtons,
  ActiveLink,
  MultiLangValue,
  SVG,
} from "~/components/ui";
import {
  useConfigContext,
  useMenuButtonContext,
  useQuickSearchContext,
} from "~/provider";
import { chakraToBreakpointArray } from "~/theme";
import { Logo } from ".";

export const Header = (/* props */) => {
  const headerRef = useRef<HTMLDivElement>(null);

  const { isDesktopAndUp, isTablet, isTabletWide } = useIsBreakPoint();

  const { t, getMultilangValue } = useAppTranslations();

  const config = useConfigContext();

  const { onMenuToggle, isMenuOpen } = useMenuButtonContext();
  const { isQuickSearchOpen, onQuickSearchToggle } = useQuickSearchContext();

  useEffect(() => {
    const onWheel = (e: MouseEvent) => e.preventDefault();
    const ref = headerRef.current;
    if (typeof window !== undefined && ref) {
      ref.addEventListener("wheel", onWheel, { passive: false });
    }

    return () => {
      if (typeof window !== undefined && ref) {
        ref.removeEventListener("wheel", onWheel);
      }
    };
  }, []);

  return (
    <Box
      m="0"
      px={chakraToBreakpointArray({
        base: "20px",
        md: "45px",
        "2xl": "0px",
      })}
      position="fixed"
      w="100%"
      top="0"
      // also adjust in LayoutFull and MobileNav
      h={{
        base: "60px",
        sm: "60px",
        md: "60px",
        lg: "60px",
        xl: "80px",
      }}
      zIndex="overlay"
      layerStyle="blurredWhite"
      borderBottom="1px solid"
      borderColor="#660D36"
      transform="translate3d(0,0,0)"
      ref={headerRef}
      sx={{
        touchAction: "none",
      }}
    >
      <Flex
        alignItems="flex-end"
        w={{
          base: "100%",
          "2xl": "84%",
        }}
        h="100%"
        marginX="auto"
        justifyContent={{
          base: "space-between",
          xl: "flex-end",
        }}
        pl={{
          xl: "50px",
          "2xl": "0",
        }}
        pb={{
          base: "2",
          xl: "3",
        }}
      >
        <Logo layout="full"/>

        {isDesktopAndUp && (
          <Flex
            flexGrow={10}
            justifyContent="flex-end"
          >
            <Flex
              justifyContent="flex-end"
              textStyle="navigation"
              textAlign="right"
              pl={{
                base: "2em",
                xl: "0%",
                "2xl": "0",
              }}
              sx={{
                a: {
                  textTransform: "uppercase",
                  marginTop: "0.4em",
                  marginLeft: {
                    base: "1.8em",
                    "2xl": "2.5em",
                  },
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  _hover: {
                    color: "cm.accentDark",
                  },
                },
                "@media (max-width:1360px)": {
                  maxW: "450px",
                },
              }}
              flexWrap="wrap"
            >
              {" "}
              {config.nav.main.map((link: any, index: number) => (
                <ActiveLink
                  key={`nav-link-${index}`}
                  href={getMultilangValue(link.path)}
                >
                  <MultiLangValue json={link.title} />
                </ActiveLink>
              ))}
            </Flex>
          </Flex>
        )}
        <Flex
          w={{
            base: "40px",
            md: "160px",
            xl: "80px",
          }}
          justifyContent="flex-end"
        >
          {isTablet && (
            <>
              {!isTabletWide && (
                <Box position="relative" w="40px" h="40px" pr="3em">
                  <motion.div
                    animate={{ opacity: isQuickSearchOpen ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    initial={{ opacity: 0 }}
                  >
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      w="40px"
                      h="40px"
                      zIndex={isQuickSearchOpen ? 2 : 1}
                    >
                      <IconButton
                        aria-label={t(
                          "menu.button.closeSearch",
                          "Close search"
                        )}
                        icon={<SVG type="cross" width="80px" height="80px" />}
                        borderRadius="0"
                        p="0"
                        className="svgHover tabbedFocus"
                        paddingInlineStart="0"
                        paddingInlineEnd="0"
                        padding="0"
                        bg="transparent"
                        w="40px"
                        h="40px"
                        overflow="hidden"
                        onClick={() => {
                          onQuickSearchToggle();
                        }}
                        pointerEvents={isQuickSearchOpen ? undefined : "none"}
                        tabIndex={isQuickSearchOpen ? undefined : -1}
                        transition="all 0.3s"
                        _hover={{
                          bg: "transparent",
                        }}
                        _active={{
                          bg: "transparent",
                        }}
                        _focus={{
                          bg: "transparent",
                          boxShadow: "none",
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
                      w="40px"
                      h="40px"
                      zIndex={isQuickSearchOpen ? 1 : 2}
                      initial={{ opacity: 1 }}
                    >
                      <IconButton
                        aria-label={t("menu.button.openSearch", "Open search")}
                        icon={<SVG type="search" width="64px" height="62px" />}
                        borderRadius="0"
                        p="0"
                        className="svgHover tabbedFocus"
                        paddingInlineStart="0"
                        paddingInlineEnd="0"
                        padding="0"
                        bg="transparent"
                        w="40px"
                        h="40px"
                        overflow="hidden"
                        onClick={() => {
                          if (isMenuOpen && !isQuickSearchOpen) {
                            onMenuToggle();
                          }
                          onQuickSearchToggle();
                        }}
                        pointerEvents={isQuickSearchOpen ? "none" : undefined}
                        tabIndex={isQuickSearchOpen ? -1 : undefined}
                        transition="all 0.3s"
                        _hover={{
                          bg: "transparent",
                        }}
                        _active={{
                          bg: "transparent",
                        }}
                        _focus={{
                          bg: "transparent",
                          boxShadow: "none",
                        }}
                      />
                    </Box>
                  </motion.div>
                </Box>
              )}
              <Box position="relative" w="40px" h="40px" pr="3em">
                <motion.div
                  animate={{ opacity: isMenuOpen ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  initial={{ opacity: 0 }}
                >
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    w="40px"
                    h="40px"
                    zIndex={isMenuOpen ? 2 : 1}
                  >
                    <IconButton
                      aria-label={t("menu.button.closeMenu", "Close menu")}
                      icon={<SVG type="cross" width="80px" height="80px" />}
                      borderRadius="0"
                      p="0"
                      className="svgHover tabbedFocus"
                      paddingInlineStart="0"
                      paddingInlineEnd="0"
                      padding="0"
                      bg="transparent"
                      w="40px"
                      h="40px"
                      onClick={() => {
                        onMenuToggle();
                      }}
                      pointerEvents={isMenuOpen ? undefined : "none"}
                      tabIndex={isMenuOpen ? undefined : -1}
                      transition="all 0.3s"
                      _hover={{
                        bg: "transparent",
                      }}
                      _active={{
                        bg: "transparent",
                      }}
                      _focus={{
                        bg: "transparent",
                        boxShadow: "none",
                      }}
                    />
                  </Box>
                </motion.div>
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isMenuOpen ? 0 : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    position="absolute"
                    top="0"
                    left="0"
                    w="40px"
                    h="40px"
                    zIndex={isMenuOpen ? 1 : 2}
                  >
                    <IconButton
                      aria-label={t("menu.button.openMenu", "Open menu")}
                      icon={
                        <SVG type="menu-tablet" width="30px" height="30px" />
                      }
                      borderRadius="0"
                      p="0"
                      className="svgHover tabbedFocus"
                      paddingInlineStart="0"
                      paddingInlineEnd="0"
                      padding="0"
                      bg="transparent"
                      w="40px"
                      h="40px"
                      onClick={() => {
                        if (!isMenuOpen && isQuickSearchOpen) {
                          onQuickSearchToggle();
                        }
                        onMenuToggle();
                      }}
                      pointerEvents={isMenuOpen ? "none" : undefined}
                      tabIndex={isMenuOpen ? -1 : undefined}
                      transition="all 0.3s"
                      _hover={{
                        bg: "transparent",
                      }}
                      _active={{
                        bg: "transparent",
                      }}
                      _focus={{
                        bg: "transparent",
                        boxShadow: "none",
                      }}
                    />
                  </Box>
                </motion.div>
              </Box>
            </>
          )}
          <InlineLanguageButtons />
        </Flex>
      </Flex>
    </Box>
  );
};
