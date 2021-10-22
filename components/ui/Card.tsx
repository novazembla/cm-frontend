import React from "react";
import {
  Box,
  Heading,
  Flex,
  Text,
  AspectRatio,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MultiLangValue, MultiLangHtml, ApiImage } from "~/components/ui";
import { getMultilangValue } from "~/utils";

export const Card = ({ item }: { item: any }) => {
  const { t } = useTranslation();

  let meta: any;

  switch (item.type) {
    case "location":
      if (item.primaryTerm) {
        meta = getMultilangValue(item?.primaryTerm?.name);
      } else if (item.term) {
        meta = getMultilangValue(item?.term?.name);
      } else {
        meta = t("card.meta.location", "Location");
      }

      break;

    case "event":
      meta = t("card.meta.event", "Event");
      break;

    case "tour":
      meta = t("card.meta.tour", "Tour");
      break;
  }
  return (
    <LinkBox as="article" data-id={item.id} bg="#fff">
      <Flex justifyContent="flex-end">
        <AspectRatio w="55%" bg="#f0f">
          <Box>xxx</Box>
        </AspectRatio>
      </Flex>
      <Box px="24px" pb="24px">
        {meta && <Box className="meta">{meta}</Box>}
        <Heading as="h2">
          <LinkOverlay href={`/${item.type}/${getMultilangValue(item.slug)}/`}>
            <MultiLangValue json={item.title} />
          </LinkOverlay>
        </Heading>
        <Box>
          <MultiLangValue json={item.description} />
        </Box>
      </Box>
    </LinkBox>
  );
};
