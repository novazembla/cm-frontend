import React from "react";
import {
  Box,
  chakra,
  Flex,
  Img,
  AspectRatio,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { MultiLangValue, ApiImage } from "~/components/ui";
import { getMultilangValue, htmlToTrimmedString } from "~/utils";
import { useIsBreakPoint } from "~/hooks";
import { useConfigContext, useSettingsContext } from "~/provider";
import Arrow from "~/assets/svg/Pfeil_quer.svg";

export const CardLocation = ({ location }: { location: any }) => {
  const { t, i18n } = useTranslation();
  const settings = useSettingsContext();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();

  const config = useConfigContext();

  let meta: any;
  let color = config.colorDark;

  if (location?.primaryTerms?.length > 0) {
    meta = getMultilangValue(location?.primaryTerms[0]?.name);

    if (settings?.terms && location?.primaryTerms[0].id in settings?.terms) {
      color =
        settings?.terms[location?.primaryTerms[0].id].colorDark ??
        settings?.terms[location?.primaryTerms[0].id].color ??
        color;
    }
  } else if (location?.terms?.length > 0) {
    meta = getMultilangValue(location?.terms[0]?.name);
    if (settings?.terms && location?.terms[0].id in settings?.terms) {
      color =
        settings?.terms[location?.terms[0].id].colorDark ??
        settings?.terms[location?.terms[0].id].color ??
        color;
    }
  } else {
    meta = t("card.meta.location", "Location");
  }

  let type = "kartenpunkt";
  if (i18n.language === "en") type = "location";

  const description = htmlToTrimmedString(
    getMultilangValue(location.description) ?? "",
    isTablet || isDesktopAndUp ? 150 : 60
  );

  return (
    <LinkBox
      as="article"
      data-id={location.id}
      bg="#fff"
      borderRadius="lg"
      overflow="hidden"
      w={isMobile ? "80%" : "100%"}
      maxW={isMobile ? "275px" : "100%"}
    >
      <Flex
        flexDirection={isMobile ? "column" : "row-reverse"}
        alignItems={isMobile ? "flex-end" : "flex-start"}
      >
        <Box w={isMobile ? "50%" : "33.33%"} pb={isMobile ? "0px" : "20px"}>
          <AspectRatio w="100%" ratio={3 / 2}>
            <Box bg={color} filter="li">
              {location?.heroImage && location?.heroImage.id && (
                <Box
                  w="100%"
                  h="100%"
                  sx={{
                    mixBlendMode: "multiply",

                    "img, picture": {
                      filter: "grayscale()",
                    },
                  }}
                >
                  <ApiImage
                    id={location?.heroImage.id}
                    alt={location?.heroImage.alt}
                    meta={location?.heroImage.meta}
                    forceAspectRatioPB={66.66}
                    status={location?.heroImage.status}
                    sizes="(min-width: 45rem) 400px, 40vw"
                    cropPosition={location?.heroImage?.cropPosition}
                  />
                </Box>
              )}
            </Box>
          </AspectRatio>
        </Box>
        <Box
          px={isMobile ? "20px" : "35px"}
          pt={isMobile ? "0" : "35px"}
          pb={isMobile ? "0px" : "20px"}
          w={isMobile ? "100%" : "66%"}
        >
          {meta && (
            <Flex
              textStyle="categoriesHighlight"
              color={color}
              h="35px"
              alignItems="flex-end"
            >
              {meta}
            </Flex>
          )}
          <chakra.h2
            mb="0.3em !important"
            sx={{
              a: {
                _hover: {
                  color: "#333 !important",
                },
              },
            }}
          >
            <LinkOverlay
              href={`/${type}/${getMultilangValue(location.slug)}/`}
              textStyle="headline"
            >
              <MultiLangValue json={location.title} />
            </LinkOverlay>
          </chakra.h2>
        </Box>
      </Flex>

      <Box px={isMobile ? "20px" : "35px"} pb={isMobile ? "20px" : "35px"}>
        <Flex justifyContent="space-between">
          <Box w={isMobile ? "calc(100% - 30px)" : "66%"} textStyle="card">
            <Box>{description}</Box>
          </Box>
          <Box alignSelf="flex-end">
            <Arrow
              width={isMobile ? "30px" : "45px"}
              height={isMobile ? "20px" : "30px"}
            />
          </Box>
        </Flex>
      </Box>
    </LinkBox>
  );
};