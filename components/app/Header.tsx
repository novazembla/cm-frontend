import React from "react";
import { Flex, Box, IconButton } from "@chakra-ui/react";

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
  const { isDesktopAndUp, isTablet, isTabletWide } = useIsBreakPoint();

  const { t, getMultilangValue } = useAppTranslations();

  const config = useConfigContext();

  const { onMenuToggle, isMenuOpen } = useMenuButtonContext();
  const { isQuickSearchOpen, onQuickSearchToggle } = useQuickSearchContext();

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
        // "2xl": "80px",
      }}
      zIndex="overlay"
      layerStyle="blurredWhite"
      borderBottom="1px solid"
      borderColor={chakraToBreakpointArray({
        base: "red",
        md: "blue",
        lg: "cyan",
        xl: "orange",
        "2xl": "green",
      })}
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
        <Logo />

        {isDesktopAndUp && (
          <Box
            sx={{
              a: {
                textTransform: "uppercase",
                marginTop: "0.4em",
                marginLeft: "1em",
                display: "inline-block",
                whiteSpace: "nowrap",
                _hover: {
                  color: "cm.accentDark",
                },
                _first: {
                  marginLeft: 0,
                },
              },
            }}
            textStyle="navigation"
            textAlign="right"
            pl={{
              base: "2em",
              "2xl": "0",
            }}
            flexGrow={10}
          >
            {config.nav.main.map((link: any, index: number) => (
              <ActiveLink
                key={`nav-link-${index}`}
                href={getMultilangValue(link.path)}
              >
                <MultiLangValue json={link.title} />
              </ActiveLink>
            ))}
          </Box>
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
                        aria-label={t("menu.button.togggleSearch", "Search")}
                        icon={<SVG type="cross" width="40px" height="40px" />}
                        borderRadius="100"
                        p="0"
                        paddingInlineStart="0"
                        paddingInlineEnd="0"
                        w="40px"
                        h="40px"
                        onClick={() => {
                          onQuickSearchToggle();
                        }}
                        pointerEvents={isQuickSearchOpen ? undefined : "none"}
                        transition="all 0.3s"
                        _hover={{
                          filter: "brightness(70%)",
                        }}
                        bg="#fff"
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
                    >
                      <IconButton
                        aria-label={t("menu.button.togggleSearch", "Search")}
                        icon={<SVG type="search" width="40px" height="40px" />}
                        borderRadius="100"
                        p="0"
                        paddingInlineStart="0"
                        paddingInlineEnd="0"
                        w="40px"
                        h="40px"
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
                        bg="#fff"
                        pointerEvents={isQuickSearchOpen ? "none" : undefined}
                      />
                    </Box>
                  </motion.div>
                </Box>
              )}
              <Box position="relative" w="40px" h="40px" pr="3em">
                <motion.div
                  animate={{ opacity: isMenuOpen ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
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
                      aria-label={t("menu.button.toggleMenu", "Menu")}
                      icon={<SVG type="cross" width="40px" height="40px" />}
                      borderRadius="100"
                      p="0"
                      paddingInlineStart="0"
                      paddingInlineEnd="0"
                      w="40px"
                      h="40px"
                      onClick={() => {
                        onMenuToggle();
                      }}
                      bg="#fff"
                      pointerEvents={isMenuOpen ? undefined : "none"}
                      transition="all 0.3s"
                      _hover={{
                        filter: "brightness(70%)",
                      }}
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
                    w="40px"
                    h="40px"
                    zIndex={isMenuOpen ? 1 : 2}
                  >
                    <IconButton
                      aria-label={t("menu.button.toggleMenu", "Menu")}
                      icon={<SVG type="menu-tablet" width="40px" height="40px" />}
                      borderRadius="100"
                      p="0"
                      paddingInlineStart="0"
                      paddingInlineEnd="0"
                      w="40px"
                      h="40px"
                      bg="#fff"
                      onClick={() => {
                        if (!isMenuOpen && isQuickSearchOpen) {
                          onQuickSearchToggle();
                        }
                        onMenuToggle();
                      }}
                      transition="all 0.3s"
                      _hover={{
                        filter: "brightness(70%)",
                      }}
                      pointerEvents={isMenuOpen ? "none" : undefined}
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
