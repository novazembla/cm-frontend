import React, { useContext } from "react";
import { Box, chakra, Heading, Text } from "@chakra-ui/react";

import { QuickSearchItem } from "~/components/ui/QuickSearchItem";
import { useAppTranslations } from "~/hooks";

export const QuickSearchResult = ({ result }: { result: any }) => {
  const { t } = useAppTranslations();

  return (
    <Box w="100%">
      <Box mt="1em" p="0">
        {result?.length > 0 &&
          result.map((module: any) => {
            let title;

            switch (module?.module) {
              case "location":
                title =
                  module?.items?.length > 1
                    ? t("quicksearch.module.title.location", "locations")
                    : t("quicksearch.module.title.singLocation", "location");
                break;

              case "event":
                title =
                  module?.items?.length > 1
                    ? t("quicksearch.module.title.event", "events")
                    : t("quicksearch.module.title.singEvent", "event");

                break;

              case "tour":
                title =
                  module?.items?.length > 1
                    ? t("quicksearch.module.title.tour", "tours")
                    : t("quicksearch.module.title.singTour", "tour");
                break;

              case "page":
                title =
                  module?.items?.length > 1
                    ? t("quicksearch.module.title.page", "Pages")
                    : t("quicksearch.module.title.singPage", "page");

                break;
            }

            return (
              <Box key={`${module?.module}`}  mb="2em" >
                <chakra.h2 textStyle="heading" mb="4" borderBottom="1px solid" borderColor="cm.accentDark">
                  <chakra.span display="inline-block" w="8%">{module?.totalCount}</chakra.span><chakra.span textStyle="categoriesHighlight" fontWeight="bold">{title}</chakra.span>
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
