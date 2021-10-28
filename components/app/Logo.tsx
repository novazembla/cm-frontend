import { Link, Box } from "@chakra-ui/react";
import { ActiveLink } from "~/components/ui";
import { useAppTranslations } from "~/hooks";

export const Logo = () => {
  const { t, i18n } = useAppTranslations();

  return (
    <Box textStyle="logo" textDecoration="none !important" whiteSpace="nowrap">
      <Link
        as={ActiveLink}
        activeClassName="activeLogo"
        href={`${i18n.language === "en" ? "/en" : ""}/`}
        color="black"
        textDecoration="none !important"
        whiteSpace="nowrap"
      >
        {t("header.logo", "CultureMap")}
      </Link>
    </Box>
  );
};
