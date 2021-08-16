import React, { useContext } from "react";
import { Box, Divider, Heading, Text } from "@chakra-ui/react";


import { useQuickSearchResultContext } from "~/provider";
import { MultiLangValue, QuickSearchItem } from "~/components/ui";
import { useTranslation } from "next-i18next";

export const QuickSearchResult = () => {
  const quickSearchResultInContext = useQuickSearchResultContext();
  const { t} = useTranslation();

  return (
    <Box
      w="100%"
      position="absolute"
      p={{ base: 3, tw: 4 }}
      top={{ base: "40px", tw: "66px" }}
      height={{ base: "calc(100vh - 40px)", tw: "calc(100vh - 66px)" }}
      width={{ base: "100%", tw: "340px" }}
      overflowY="auto"
      bg="white"
    >
      <Box mt="1" p="0">
        {(quickSearchResultInContext && Object.keys(quickSearchResultInContext).length > 0) && Object.keys(quickSearchResultInContext).map((key) => {
          let title;

          switch (key) {
            case "location":
              title = t("quicksearch.module.title.location", "Location(s)");
              break;
            
            case "event":
              title = t("quicksearch.module.title.event","Event(s)");
              break;

            case "tour":
              title = t("quicksearch.module.title.tour","Tour(s)");
              break;

            case "page":
              title = t("quicksearch.module.title.pgae","Page(s)");
              break;
          }

          return (
          <Box key={`${key}`} mb="4">
            <Heading as="h2" fontSize="2xl" mb="4">
              {quickSearchResultInContext[key].totalCount} {title} {t("found","found")}
            </Heading>
            {quickSearchResultInContext[key].items.map((item, i) => <QuickSearchItem module={key} key={`${key}-${i}`} location={item} />
            )}
          </Box>
        )})}
      </Box>
    </Box>
  );
};
