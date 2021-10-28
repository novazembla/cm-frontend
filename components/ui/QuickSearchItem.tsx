import React from "react";
import NextLink from "next/link";

import { MultiLangValue, MultiLangHtml } from "~/components/ui";
import { Box, chakra, Heading } from "@chakra-ui/react";
import {useQuickSearchContext} from "~/provider";
import { useAppTranslations } from "~/hooks";


export const QuickSearchItem = ({ item, module }: { item: any; module: string; }) => {
  const {t, i18n, getMultilangValue} = useAppTranslations();
  const { onQuickSearchToggle } = useQuickSearchContext();

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
    <Box
      mt="4"
      _first={{
        mt: 3,
      }}
    >
      <NextLink
        href={`/${path}/${getMultilangValue(item.slug)}`}
        locale={i18n.language}
        passHref
        
      >
        <chakra.a textDecoration="none !important" onClick={() => {onQuickSearchToggle()}}>
          <chakra.span
            display="block"
            pl="2"            
          >
            <Heading as="h3" fontSize="md">
              <MultiLangValue json={item.title} />
            </Heading>
            <Box fontSize="sm">
              <MultiLangHtml json={item.description} />
            </Box>
          </chakra.span>
        </chakra.a>
      </NextLink>
    </Box>
  );
};
