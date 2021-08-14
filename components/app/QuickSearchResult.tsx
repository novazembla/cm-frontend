import React, { useContext } from "react";
import { Box, Divider, Heading, Text } from "@chakra-ui/react";


import { useQuickSearchResultContext } from "~/provider";
import { MultiLangValue } from "../ui";
import { useTranslation } from "next-i18next";

export const QuickSearchResult = () => {
  const quickSearchResultInContext = useQuickSearchResultContext();
  const { t} = useTranslation();

  console.log("QR", quickSearchResultInContext);

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
        {Object.keys(quickSearchResultInContext).map((key) => {

          console.log(quickSearchResultInContext[key]);
          
          
          return (
          <Box key={`${key}`}>
            <Heading as="h2" fontSize="2xl" mb="4">
              {quickSearchResultInContext[key].totalCount} {t("locations","Locations")} {t("found","found")}
            </Heading>
            {quickSearchResultInContext[key].items.map((item, i) => 
              <Box key={`${key}${i}`} sx={{
                _last: {
                  "> hr": {
                    display: "none"
                  }
                }
              }}>
                <Text><b><MultiLangValue json={item.title}/></b></Text>
                <Text><MultiLangValue json={item.excerpt}/></Text>
                <Divider />
              </Box>
            )}
          </Box>
        )})}
      </Box>
    </Box>
  );
};
