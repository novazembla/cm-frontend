import { Link, Box } from "@chakra-ui/react";
import { ActiveLink } from "~/components/ui";
import { useTranslation } from "next-i18next";

export const Logo = () => {
  const { t } = useTranslation();

  return (
    <Box
      textStyle="logo"
      textDecoration="none !important"
      whiteSpace="nowrap"     
    >
      <Link
        as={ActiveLink}
        activeClassName="activeLogo"
        href="/"
        color="black"
        textDecoration="none !important"
        whiteSpace="nowrap"
      >
        {t("header.logo", "CultureMap")}
      </Link>
    </Box>
  );
};
