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

export const CardEvent = ({ event }: { event: any }) => {
  const { t, i18n } = useTranslation();
  const settings = useSettingsContext();
  const { isMobile, isTablet, isDesktopAndUp } = useIsBreakPoint();

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
    getMultilangValue(event.description) ?? "",
    isTablet || isDesktopAndUp ? 150 : 60
  );

  return (
    <LinkBox
      as="article"
      data-id={event.id}
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
          <Box position="relative">
            <AspectRatio w="100%" ratio={3 / 2}>
              <Box bg={color}>
                {event?.heroImage && event?.heroImage.id && (
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
                      id={event?.heroImage.id}
                      alt={event?.heroImage.alt}
                      meta={event?.heroImage.meta}
                      forceAspectRatioPB={66.66}
                      status={event?.heroImage.status}
                      sizes="(min-width: 45rem) 400px, 40vw"
                      cropPosition={event?.heroImage?.cropPosition}
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
                transform="translateY(+50%) translateX(-10%)"
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
            <LinkOverlay
              href={`/${type}/${getMultilangValue(event.slug)}/`}
              textStyle="headline"
            >
              <MultiLangValue json={event.title} />
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
