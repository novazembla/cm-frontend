import { Box, chakra, Flex, IconButton, Img, VStack } from "@chakra-ui/react";
import Image from "next/image";
import ActiveLink from "~/components/ui/ActiveLink";

import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { SVG } from "~/components/ui/SVG";
import { useConfigContext } from "~/provider";

import { useAppTranslations } from "~/hooks/useAppTranslations";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";

import { Logo } from "./Logo";

// https://mmazzarolo.com/blog/2021-04-10-nextjs-scroll-restoration/

export const Footer = ({
  type = "full",
  noBackground,
}: {
  type?: string;
  noBackground?: boolean;
}) => {
  const config = useConfigContext();
  const { isMobile, isTablet } = useIsBreakPoint();

  const { t, getMultilangValue, i18n } = useAppTranslations();

  return (
    <Box
      layerStyle={!noBackground ? "lightGray" : undefined}
      pt={{
        base: noBackground ? "40px" : "20px",
        sm: noBackground ? "40px" : "20px",
        md: noBackground ? "65px" : "45px",
        "2xl": "55px",
      }}
      px={{
        base: !noBackground || isMobile ? "20px" : 0,
        sm: !noBackground || isMobile ? "20px" : 0,
        md: "45px",
        xl: "45px",
      }}
      pb={{
        base: isMobile ? "100px" : !noBackground ? "20px" : 0,
        md: "45px",
        "2xl": "55px",
      }}
      role="contentinfo"
    >
      <Box
        mb={{
          base: "1em",
          md: "2em",
        }}
      >
        <Logo layout="full" />
      </Box>
      <Flex alignItems="flex-end" justifyContent="space-between">
        <Box
          w={{
            base: "auto",
            md: "50%",
          }}
        >
          <IconButton
            mb="1.5"
            variant="unstyled"
            aria-label={t("menu.button.backToTop", "Back to top")}
            icon={
              
              <SVG
                type="arrow-up"
                wrapped width={isMobile ? 17 : 22} height={isMobile ? 30 : 40}
                fill
              />
            }
            position="relative"
            borderRadius="0"
            p="0"
            className="svgHover tabbedFocus"
            paddingInlineStart="0"
            paddingInlineEnd="0"
            h="40px"
            w="20px"
            minW="20px"
            padding="0"
            bg="transparent"
            onClick={() => {
              if (window) {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }
            }}
          />
        </Box>
        <Flex
          sx={{
            a: {
              mb: "0.6em",
              _last: {
                marginBottom: 0,
              },
            },
          }}
          w={{
            base: "75%",

            md: "50%",
          }}
          direction={{
            base: "column",
          }}
        >
          <Box
            alignSelf={isMobile ? "flex-end" : undefined}
            pr={isMobile ? "20px" : undefined}
            minW={isMobile ? "66.66%" : undefined}
          >
            <Flex
              direction="column"
              mb="1.6em"
              sx={{
                a: {
                  mb: "0.6em",
                },
              }}
            >
              {config.nav.main.map((link: any, index: number) => {
                if (link.path[i18n?.language]) {
                  return (
                    <ActiveLink
                      key={`nav-link-${index}`}
                      href={getMultilangValue(link.path)}
                    >
                      <MultiLangValue json={link.title} />
                    </ActiveLink>
                  );
                }
                return null;
              })}
            </Flex>
            <Flex direction="column">
              {config.nav.footer.map((link: any, index: number) => {
                if (link.path[i18n?.language]) {
                  return (
                    <ActiveLink
                      key={`nav-link-${index}`}
                      href={getMultilangValue(link.path)}
                    >
                      <MultiLangValue json={link.title} />
                    </ActiveLink>
                  );
                }
                return null;
              })}
            </Flex>
          </Box>
        </Flex>
      </Flex>
      <Box w={isMobile ? "66.66%" : "66.66%"} mt={isMobile ? "3em" : "5em"}>
        <VStack alignItems="flex-start">
          <chakra.a
            className="svgHover tabbedFocus"
            href="https://www.berlin.de/ba-lichtenberg/"
            display="inline-block"
            w="100%"
            h="0"
            pb="20%"
            position="relative"
            target="_blank"
            rel="noreferrer nofollow"
            title="Bezirksamt Lichtenberg von Berlin"
          >
            <chakra.span
              display="block"
              w="100%"
              h="100%"
              position="absolute"
              top="0"
              left="0"
            >
              <SVG
                className="svg black"
                type="ba_lichtenberg"
                fill
              />
            </chakra.span>
          </chakra.a>

          <chakra.a
            className="svgHover tabbedFocus"
            href="https://www.berlin.de/sen/web/"
            display="inline-block"
            w="100%"
            h="0"
            pb="18.18%"
            position="relative"
            target="_blank"
            rel="noreferrer nofollow"
            title="Senatsverwaltung für Wirtschaft, Energie und Betriebe"
          >
            <chakra.span
              display="block"
              w="100%"
              h="100%"
              position="absolute"
              top="0"
              left="0"
            >
              <SVG
                className="svg black"
                type="s_energie"
                fill
              />
            </chakra.span>
          </chakra.a>

          <chakra.a
            className="imgHover tabbedFocus"
            href={`https://www.visitberlin.de/${i18n.language}`}
            display="inline-block"
            w="60%"
            h="0"
            pb="20%"
            position="relative"
            target="_blank"
            rel="noreferrer nofollow"
            title={`${
              i18n.language === "de" ? "In Kooperation mit" : "In cooperation with"
            } Visit Berlin`}
          >
            <chakra.span
              display="block"
              w="100%"
              h="100%"
              position="absolute"
              top="0"
              left="0"
            >
              <Img
                src={`/img/visit_berlin_${i18n.language}.png`}
                width="100%"
                height="auto"
                alt="Logo Visit Berlin"
                sx={{
                  _hover: {
                    opacity: 0.5
                  }
                }}

              />
            </chakra.span>
          </chakra.a>
        </VStack>
      </Box>
    </Box>
  );
};

export default Footer;
