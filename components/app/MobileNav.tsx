import { Flex, IconButton, Box, chakra } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

import Search from "~/assets/svg/mobil_navigation_leiste_suche.svg";
import Menu from "~/assets/svg/mobil_navigation_leiste_menu.svg";
import Cross from "~/assets/svg/Kreuz.svg";
import Suggest from "~/assets/svg/mobil_navigation_leiste_vorschlag.svg";

import { useMenuButtonContext, useConfigContext } from "~/provider";
import { useIsBreakPoint } from "~/hooks";
import { getMultilangValue } from "~/utils";
import { ActiveLink, MultiLangValue } from "~/components/ui";

export const MobileNav = () => {
  const { t } = useTranslation();
  const config = useConfigContext();

  const { onMenuToggle, isMenuOpen } = useMenuButtonContext();
  const { isMobile, isTablet, isTabletWide, isDesktopAndUp } = useIsBreakPoint();

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
              width: isTabletWide ? "50%":"100%",
              zIndex: 1100,
              overflowY: "auto",
            }}
          >
            <Flex
              layerStyle="page"
              w="100%"
              minH="100%"
              alignItems={isTablet ? "flex-start" : "flex-end"}
            >
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
                pt="60px"
                pb={{
                  base: "100px",
                  md: "45px",
                }}
                direction={{
                  base: "column",
                }}
                textStyle="headline"
                fontWeight="bold"
              >
                {config.nav.main.map((link: any, index: number) => (
                  <chakra.span key={`nav-link-${index}`}>
                    <ActiveLink href={getMultilangValue(link.path)} onClick={() => onMenuToggle()}>
                      <MultiLangValue json={link.title} />
                    </ActiveLink>
                  </chakra.span>
                ))}
              </Flex>
            </Flex>
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
          bottom="0"
          zIndex="modal"
          justifyContent="space-evenly"
          alignItems="center"
        >
          <motion.div
            animate={{ opacity: isMenuOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <IconButton
              aria-label={t("menu.button.search", "Search")}
              borderRadius="55px"
              icon={<Search />}
              w="55px"
              h="55px"
              pointerEvents={isMenuOpen ? "none" : undefined}
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
              pointerEvents={isMenuOpen ? "none" : undefined}
            />
          </motion.div>
        </Flex>
      )}
    </>
  );
};
