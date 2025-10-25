import React from "react";
import {
  Box,
  chakra,
  Flex,
  AspectRatio,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";

import {MultiLangValue} from "~/components/ui/MultiLangValue";
import {ApiImage} from "~/components/ui/ApiImage";
import {TrimmedTextWithBottomEdge} from "~/components/ui/TrimmedTextWithBottomEdge";
import {SVG} from "~/components/ui/SVG";

import { htmlToTrimmedString } from "~/utils";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { useConfigContext } from "~/provider";
import NextLink from "next/link";

export const CardTour = ({
  tour,
  fillContainer = true,
}: {
  tour: any;
  fillContainer?: boolean;
}) => {
  const { t, i18n, getMultilangValue, getMultilangHtml } = useAppTranslations();
  const { isMobile } = useIsBreakPoint();

  const config = useConfigContext();

  let meta: any;
  let color = config.colorDark;

  if (tour?.tourStops?.length) {
    meta = `${tour?.tourStops.length} ${t("tour.card.tourStops", "Stops")}`;
  }

  let type = "tour";
  if (i18n.language === "en") type = "tour";

  const description = htmlToTrimmedString(
    getMultilangHtml(tour.teaser) ?? "",
    200
  );

  return (
    <LinkBox
      as="article"
      data-id={tour.id}
      bg="#fff"
      borderRadius="lg"
      overflow="hidden"
      w="100%"
      maxW={isMobile && !fillContainer ? "275px" : "100%"}
      h={isMobile && fillContainer ? "100%" : undefined}
      className="svgHover"
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
                      alt=""
                      meta={tour?.heroImage.meta}
                      forceAspectRatioPB={66.66}
                      status={tour?.heroImage.status}
                      sizes="(min-width: 45rem) 400px, 40vw"
                      objectFit="cover"
                      cropPosition={tour?.heroImage?.cropPosition}
                      imgCssProps={{
                        borderTopRightRadius: "var(--chakra-radii-lg)",
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
          px={{
                base: "20px",
                md: "30px",
                "2xl": "35px"
              }}
          pt={{
            base: "12px",
            md: "30px",
            "2xl": "35px"
          }}
          pb={isMobile ? "0px" : "20px"}
          w={isMobile ? "100%" : "66.66%"}
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
            <LinkOverlay
              as={NextLink}
              href={`${
                i18n.language === "en" ? "/en" : ""
              }/${type}/${getMultilangValue(tour.slug)}/`}
              textStyle="headline"
              textDecoration="none"
              minH={isMobile ? "50px" : undefined}
              className={isMobile ? "clampTwoLines" : "clampThreeLines"}
            >
              <MultiLangValue json={tour.title} />
            </LinkOverlay>
          </chakra.h2>
        </Box>
      </Flex>

      <Box px={{
                base: "20px",
                md: "30px",
                "2xl": "35px"
              }} pb={{
                base: "20px",
                md: "30px",
                "2xl": "35px"
              }}>
        <Flex justifyContent="space-between" position="relative">
          <Box
            w={isMobile ? "100%" : "66.66%"}
            minH={isMobile ? "60px" : undefined}
            textStyle="card"
          >
            {isMobile ? (
              <TrimmedTextWithBottomEdge
                text={description}
                edgeWidth={60}
                numLines={3}
              />
            ) : (
              <Box className="clampFourLines">{description}</Box>
            )}
          </Box>
          <Box
            alignSelf="flex-end"
            sx={{
              ...(isMobile
                ? {
                    position: "absolute",
                    bottom: "-6px",
                    right: 0,
                  }
                : {}),
            }}
          >
            <SVG
              type="arrow-right"
              width={isMobile ? 30 : 40}
              height={isMobile ? 17 : 22}
            />
          </Box>
        </Flex>
      </Box>
    </LinkBox>
  );
};
