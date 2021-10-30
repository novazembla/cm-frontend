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
import { MultiLangValue, ApiImage } from "~/components/ui";
import { htmlToTrimmedString } from "~/utils";
import { useAppTranslations, useIsBreakPoint } from "~/hooks";
import { useConfigContext, useSettingsContext } from "~/provider";
import Arrow from "~/assets/svg/Pfeil_quer.svg";
import NextLink from "next/link";

export const CardTourStop = ({
  tourStop,
  fillContainer,
}: {
  tourStop: any;
  fillContainer?: boolean;
}) => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const settings = useSettingsContext();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();

  const config = useConfigContext();

  let meta: any;
  let color = config.colorDark;

  if (tourStop?.location?.primaryTerms?.length > 0) {
    meta = getMultilangValue(tourStop?.location?.primaryTerms[0]?.name);

    if (
      settings?.terms &&
      tourStop?.location?.primaryTerms[0].id in settings?.terms
    ) {
      color =
        settings?.terms[tourStop?.location?.primaryTerms[0].id].colorDark ??
        settings?.terms[tourStop?.location?.primaryTerms[0].id].color ??
        color;
    }
  } else if (tourStop?.location?.terms?.length > 0) {
    meta = getMultilangValue(tourStop?.location?.terms[0]?.name);
    if (settings?.terms && tourStop?.location?.terms[0].id in settings?.terms) {
      color =
        settings?.terms[tourStop?.location?.terms[0].id].colorDark ??
        settings?.terms[tourStop?.location?.terms[0].id].color ??
        color;
    }
  } else {
    meta = t("card.meta.tourStop", "Location");
  }

  let type = "kartenpunkt";
  if (i18n.language === "en") type = "tourStop";

  const description = htmlToTrimmedString(
    getMultilangValue(tourStop.description) ?? "",
    isTablet || isDesktopAndUp ? 150 : 60
  );

  return (
    <LinkBox
      as="article"
      data-id={tourStop.id}
      bg="#fff"
      borderRadius="lg"
      overflow="hidden"
      w={isMobile && !fillContainer ? "80%" : "100%"}
      maxW={isMobile && !fillContainer ? "275px" : "100%"}
      h={isMobile && fillContainer ? "100%" : undefined}
    >
      <Flex
        flexDirection={isMobile ? "column" : "row-reverse"}
        alignItems={isMobile ? "flex-end" : "flex-start"}
      >
        <Box w={isMobile ? "50%" : "33.33%"} pb={isMobile ? "0px" : "20px"}>
          <AspectRatio w="100%" ratio={3 / 2}>
            <Box bg={color} filter="li">
              {tourStop?.heroImage && tourStop?.heroImage.id && (
                <Box
                  w="100%"
                  h="100%"
                  sx={{
                    mixBlendMode: "screen",

                    "img, picture": {
                      filter: " grayscale(1)",
                    },
                  }}
                >
                  <ApiImage
                    id={tourStop?.heroImage.id}
                    alt={tourStop?.heroImage.alt}
                    meta={tourStop?.heroImage.meta}
                    forceAspectRatioPB={66.66}
                    status={tourStop?.heroImage.status}
                    sizes="(min-width: 45rem) 400px, 40vw"
                    objectFit="cover"
                    cropPosition={tourStop?.heroImage?.cropPosition}
                    imgCssProps={{
                      borderTopRightRadius: "var(--chakra-radii-lg)"
                    }}
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
            <NextLink
              passHref
              href={`${
                i18n.language === "en" ? "/en" : ""
              }/${type}/${getMultilangValue(tourStop?.location.slug)}/`}
            >
              <LinkOverlay textStyle="headline">
                <MultiLangValue json={tourStop.title} />
              </LinkOverlay>
            </NextLink>
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
