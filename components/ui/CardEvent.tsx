import React from "react";
import {
  Box,
  chakra,
  Flex,
  AspectRatio,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { ApiImage } from "~/components/ui/ApiImage";
import { TrimmedTextWithBottomEdge } from "~/components/ui/TrimmedTextWithBottomEdge";
import { SVG } from "~/components/ui/SVG";
import { htmlToTrimmedString } from "~/utils";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { useConfigContext } from "~/provider";
import NextLink from "next/link";

export const CardEvent = ({
  event,
  fillContainer = true,
}: {
  event: any;
  fillContainer?: boolean;
}) => {
  const { t, i18n, getMultilangValue, getMultilangHtml } = useAppTranslations();
  const { isMobile } = useIsBreakPoint();

  const config = useConfigContext();

  let meta: any;
  let color = config.colorDark;

  if (event?.dates?.length) {
    if (event?.dates?.length > 1) {
      try {
        const begin = new Date(event.firstEventDate);
        const end = new Date(event.lastEventDate);

        if (new Date() < begin) {
          meta = `${t(
            "event.label.dateFrom",
            "From"
          )} ${begin.toLocaleDateString(
            i18n.language === "de" ? "de-DE" : "en-GB"
          )}`;
        } else {
          meta = `${t(
            "event.label.dateUntil",
            "Until"
          )} ${end.toLocaleDateString(
            i18n.language === "de" ? "de-DE" : "en-GB"
          )}`;
        }
      } catch (err) {}
    } else {
      try {
        meta = `${new Date(event.firstEventDate).toLocaleDateString(
          i18n.language === "de" ? "de-DE" : "en-GB"
        )}`;
      } catch (err) {}
    }
  }

  let type = "veranstaltung";
  if (i18n.language === "en") type = "event";

  const description = htmlToTrimmedString(
    getMultilangHtml(event.description) ?? "",
    200
  );

  return (
    <LinkBox
      as="article"
      data-id={event.id}
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
                {event?.heroImage && event?.heroImage.id && (
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
                      id={event?.heroImage.id}
                      alt=""
                      meta={event?.heroImage.meta}
                      forceAspectRatioPB={66.66}
                      status={event?.heroImage.status}
                      sizes="(min-width: 45rem) 400px, 40vw"
                      objectFit="cover"
                      cropPosition={event?.heroImage?.cropPosition}
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
            "2xl": "35px",
          }}
          pt={{
            base: "12px",
            md: "30px",
            "2xl": "35px",
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
            {t("card.meta.event", "Event")}
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
              passHref
              href={`${
                i18n.language === "en" ? "/en" : ""
              }/${type}/${getMultilangValue(event.slug)}/`}
            >
              <LinkOverlay
                textStyle="headline"
                textDecoration="none"
                minH={isMobile ? "50px" : undefined}
                className={isMobile ? "clampTwoLines" : "clampThreeLines"}
              >
                <MultiLangValue json={event.title} />
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
