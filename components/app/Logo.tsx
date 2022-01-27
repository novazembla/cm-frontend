import { Link, Box, chakra } from "@chakra-ui/react";
import { ActiveLink } from "~/components/ui/ActiveLink";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { useConfigContext } from "~/provider";

export const Logo = ({ layout }: { layout: string }) => {
  const { t, i18n } = useAppTranslations();
  const config = useConfigContext();

  return (
    <Box textStyle="logo" textDecoration="none !important" whiteSpace="nowrap">
      <Link
        as={ActiveLink}
        activeClassName="activeLogo"
        href={`${config.baseUrl}${i18n.language === "en" ? "/en" : ""}`}
        color="#333"
        textDecoration="none !important"
        whiteSpace="nowrap"
        target={layout === "light" ? "_blank" : undefined}
      >
        <chakra.span letterSpacing="1px">{t("logo.culturemap1", "CULTURE MAP")}</chakra.span>{" "}
        <chakra.span fontWeight="normal">
          {t("logo.culturemap2", "Lichtenberg")}
        </chakra.span>
      </Link>
    </Box>
  );
};
