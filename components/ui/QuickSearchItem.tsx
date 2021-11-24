import React from "react";
import NextLink from "next/link";

import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { SVG } from "~/components/ui/SVG";
import { Box, chakra } from "@chakra-ui/react";
import { useQuickSearchContext } from "~/provider";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";

export const QuickSearchItem = ({
  item,
  module,
}: {
  item: any;
  module: string;
}) => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const { onQuickSearchToggle } = useQuickSearchContext();
  const { isMobile } = useIsBreakPoint();

  if (!item) return <></>;

  let path = "";
  switch (module) {
    case "location":
      path = i18n.language === "de" ? "kartenpunkt" : "location";
      break;

    case "event":
      path = i18n.language === "de" ? "veranstaltung" : "event";
      break;

    case "tour":
      path = i18n.language === "de" ? "tour" : "tour";
      break;

    case "page":
      path = i18n.language === "de" ? "seite" : "page";
      break;
  }

  return (
    <Box mt="2">
      <NextLink
        href={`/${path}/${getMultilangValue(item.slug)}`}
        locale={i18n.language}
        passHref
      >
        <chakra.a
          textDecoration="none !important"
          onClick={() => {
            onQuickSearchToggle();
          }}
          display="flex !important"
          justifyContent="space-between"
          alignItems="center"
          border="none !important"
          textDecorationColor="none"
          padding="0 !important"
          pl={isMobile ? "0" : "8% !important"}
          transition="none"
        >
          <chakra.span display="block" pr="2">
            <chakra.span className="clampTwoLines" fontWeight="bold">
              <MultiLangValue json={item.title} />
            </chakra.span>
          </chakra.span>
          <chakra.span display="block">
            <SVG type="chevron_right" width="20px" height="20px" />
          </chakra.span>
        </chakra.a>
      </NextLink>
    </Box>
  );
};
