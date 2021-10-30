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

export const CardTour = ({
  tour,
  fillContainer,
}: {
  tour: any;
  fillContainer?: boolean;
}) => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const settings = useSettingsContext();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();

  const config = useConfigContext();

  let meta: any;
  let color = config.colorDark;

  if (tour?.tourStops?.length) {
    meta = `${tour?.tourStops.length} ${t("tour.card.tourStops", "Stops")}`;
  }

  let type = "tour";
  if (i18n.language === "en") type = "tour";

  const description = htmlToTrimmedString(
    getMultilangValue(tour.teaser) ?? "",
    isTablet || isDesktopAndUp ? 150 : 60
  );

  return (
    <LinkBox
      as="article"
      data-id={tour.id}
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
          <Box position="relative">
            <AspectRatio w="100%" ratio={3 / 2}>
              <Box bg={color}>
                {tour?.heroImage && tour?.heroImage.id && (
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
                      id={tour?.heroImage.id}
                      alt={tour?.heroImage.alt}
                      meta={tour?.heroImage.meta}
                      forceAspectRatioPB={66.66}
                      status={tour?.heroImage.status}
                      sizes="(min-width: 45rem) 400px, 40vw"
                      objectFit="cover"
                      cropPosition={tour?.heroImage?.cropPosition}
                      imgCssProps={{
                        borderTopRightRadius: "var(--chakra-radii-lg)"
                      }}
                    />
                  </Box>
                )}
              </Box>
            </AspectRatio>
            {meta && (
              <Box
                position="absolute"
                bottom="0"
                left="0"
                bg="cm.accentDark"
                textStyle="categories"
                fontWeight="bold"
                color="#fff"
                py="3px"
                px="5px"
                transform="translateY(+10px) translateX(-10px)"
              >
                {meta}
              </Box>
            )}
          </Box>
        </Box>
        <Box
          px={isMobile ? "20px" : "35px"}
          pt={isMobile ? "0" : "35px"}
          pb={isMobile ? "0px" : "20px"}
          w={isMobile ? "100%" : "66%"}
        >
          <Flex
            textStyle="categoriesHighlight"
            color={color}
            h="35px"
            alignItems="flex-end"
          >
            {t("card.meta.tour", "Tour")}
          </Flex>
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
              href={`${
                i18n.language === "en" ? "/en" : ""
              }/${type}/${getMultilangValue(tour.slug)}/`}
              passHref
            >
              <LinkOverlay textStyle="headline">
                <MultiLangValue json={tour.title} />
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
