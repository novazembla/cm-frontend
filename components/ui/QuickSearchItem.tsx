import React from "react";
import Link from "next/link";
import i18n from "i18next";
import { getMultilangValue } from "../../utils";
import { MultiLangValue, MultiLangHtml } from "~/components/ui";
import { Box, chakra, Heading } from "@chakra-ui/react";

export const QuickSearchItem = ({ location, module }: { location: any; module: string; }) => {
  if (!location) return <></>;

  return (
    <Box
      mt="4"
      _first={{
        mt: 3,
      }}
    >
      <Link
        href={`/${module}/${getMultilangValue(location.slug)}`}
        locale={i18n.language}
      >
        <a>
          <chakra.span
            display="block"
            pl="2"
            borderLeft="4px solid"
            borderColor="orange.200"
          >
            <Heading as="h3" fontSize="md">
              <MultiLangValue json={location.title} />
            </Heading>
            <Box fontSize="sm">
              <MultiLangHtml json={location.description} />
            </Box>
          </chakra.span>
        </a>
      </Link>
    </Box>
  );
};
