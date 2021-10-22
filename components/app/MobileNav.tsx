import { Flex, IconButton } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import Search from "~/assets/svg/mobil_navigation_leiste_suche.svg";
import Menu from "~/assets/svg/mobil_navigation_leiste_menu.svg";
import Suggest from "~/assets/svg/mobil_navigation_leiste_vorschlag.svg";

export const MobileNav = () => {
  const { t } = useTranslation();

  return (
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
      <IconButton
        aria-label={t("menu.button.search", "Search")}
        borderRadius="55px"
        icon={<Search />}
        w="55px"
        h="55px"        
      />
      <IconButton
        aria-label={t("menu.button.toggleMenu", "Menu")}
        icon={<Menu />}
        borderRadius="100"
        p="0"
        paddingInlineStart="0"
        paddingInlineEnd="0"
        w="70px"
        h="70px"
      />
      <IconButton
        aria-label={t("menu.button.suggestLocation", "Suggest a new location")}
        borderRadius="100"
        icon={<Suggest />}
        w="55px"
        h="55px"
      />
    </Flex>
  );
};
