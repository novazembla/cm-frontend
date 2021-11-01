import { Link, Box, chakra } from "@chakra-ui/react";
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
        color="#333"
        textDecoration="none !important"
        whiteSpace="nowrap"
      > 
        <chakra.span>{t("logo.culturemap1", "CULTUREMAP")}</chakra.span>{" "}
        <chakra.span fontWeight="normal">{t("logo.culturemap2", "Lichtenberg")}</chakra.span>
        
      </Link>
    </Box>
  );
};
