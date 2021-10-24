import React, { useContext } from "react";
import { Box, chakra, Heading, Text } from "@chakra-ui/react";

import { MultiLangValue, QuickSearchItem } from "~/components/ui";
import { useTranslation } from "next-i18next";

export const QuickSearchResult = ({ result }: { result: any }) => {
  const { t } = useTranslation();

  return (
    <Box w="100%">
      <Box mt="1" p="0">
        {result?.length > 0 &&
          result.map((module: any) => {
            let title;

            switch (module?.module) {
              case "location":
                title = t("quicksearch.module.title.location", "Location(s)");
                break;

              case "event":
                title = t("quicksearch.module.title.event", "Event(s)");
                break;

              case "tour":
                title = t("quicksearch.module.title.tour", "Tour(s)");
                break;

              case "page":
                title = t("quicksearch.module.title.pgae", "Page(s)");
                break;
            }

            return (
              <Box key={`${module?.module}`} mb="4">
                <chakra.h2 textStyle="heading" mb="4">
                  {module?.totalCount} {title} {t("found", "found")}
                </chakra.h2>
                {module?.items.map((item: any, i: any) => (
                  <QuickSearchItem
                    module={module?.module}
                    key={`${module?.module}-${i}`}
                    item={item}
                  />
                ))}
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};
