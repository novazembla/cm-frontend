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

import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { ApiImage } from "~/components/ui/ApiImage";
import { TrimmedTextWithBottomEdge } from "~/components/ui/TrimmedTextWithBottomEdge";
import { SVG } from "~/components/ui/SVG";

import { htmlToTrimmedString, getLocationColors } from "~/utils";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { useConfigContext, useSettingsContext } from "~/provider";
import NextLink from "next/link";

export const CardTourStop = ({
  tour,
  tourStop,
  fillContainer = true,
}: {
  tour: any;
  tourStop: any;
  fillContainer?: boolean;
}) => {
  const { t, i18n, getMultilangValue, getMultilangHtml } = useAppTranslations();
  const settings = useSettingsContext();
  const { isMobile } = useIsBreakPoint();

  const config = useConfigContext();

  let meta: any;

  const { color } = getLocationColors(tourStop?.location, settings);

  if (tourStop?.location?.primaryTerms?.length > 0) {
    meta = getMultilangValue(tourStop?.location?.primaryTerms[0]?.name);
  } else if (tourStop?.location?.terms?.length > 0) {
    meta = getMultilangValue(tourStop?.location?.terms[0]?.name);
  } else {
    meta = t("card.meta.tourStop", "Tour stop");
  }

  const description = htmlToTrimmedString(
    getMultilangHtml(tourStop.description) ?? "",
    200
  );

  return (
    <LinkBox
      as="article"
      data-id={tourStop.id}
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
        <Box
          w={isMobile ? "50%" : "33.33%"}
          pb={isMobile ? "0px" : "20px"}
          position="relative"
        >
          <AspectRatio w="100%" ratio={3 / 2}>
            <Box bg={color}>
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
                    alt=""
                    meta={tourStop?.heroImage.meta}
                    forceAspectRatioPB={66.66}
                    status={tourStop?.heroImage.status}
                    sizes="(min-width: 45rem) 400px, 40vw"
                    objectFit="cover"
                    cropPosition={tourStop?.heroImage?.cropPosition}
                    imgCssProps={{
                      borderTopRightRadius: "var(--chakra-radii-lg)",
                    }}
                  />
                </Box>
              )}
            </Box>
          </AspectRatio>
          <Box
            position="absolute"
            bottom="0"
            left="0"
            bg={color}
            textStyle="categories"
            fontWeight="bold"
            color="#fff"
            p="0"
            pl="1px"
            w="32px"
            h="32px"
            borderRadius="30px"
            border="2px solid #fff"
            transform={
              isMobile
                ? "translateY(12px) translateX(-12px)"
                : "translateY(-8px) translateX(-16px)"
            }
            textAlign="center"
            lineHeight="29px"
          >
            {tourStop?.number}
          </Box>
        </Box>
        <Box
          px={{
            base: "20px",
            md: "30px",
            "2xl": "35px",
          }}
          pt={{
            base: "10px",
            md: "30px",
            "2xl": "35px"
          }}
          pb={isMobile ? "0px" : "20px"}
          w={isMobile ? "100%" : "66.66%"}
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
              }/tour/${getMultilangValue(tour.slug)}/${tourStop?.number}`}
            >
              <LinkOverlay
                textStyle="headline"
                textDecoration="none"
                minH={isMobile ? "50px" : undefined}
                className={isMobile ? "clampTwoLines" : "clampThreeLines"}
              >
                <MultiLangValue json={tourStop.title} />
              </LinkOverlay>
            </NextLink>
          </chakra.h2>
        </Box>
      </Flex>

      <Box
        px={{
          base: "20px",
          md: "30px",
          "2xl": "35px",
        }}
        pb={{
          base: "20px",
          md: "30px",
          "2xl": "35px",
        }}
      >
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
              width={isMobile ? "30px" : "40px"}
              height={isMobile ? "17px" : "22px"}
            />
          </Box>
        </Flex>
      </Box>
    </LinkBox>
  );
};
