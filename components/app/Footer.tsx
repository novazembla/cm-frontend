import React from "react";
import { ActiveLink } from "~/components/ui";

import { Flex, IconButton, Link, Box } from "@chakra-ui/react";

import { useConfigContext } from "~/provider";
import { MultiLangValue, SVG } from "../ui";

import { useIsBreakPoint, useAppTranslations } from "~/hooks";
import { Logo } from ".";

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

  const { t, getMultilangValue } = useAppTranslations();

  return (
    <Box
      layerStyle={!noBackground ? "blurredLightGray" : undefined}
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
        base: isMobile ? "80px" : !noBackground ? "20px" : 0,
        md: "45px",
        "2xl": "55px",
      }}
      mt={!noBackground ? "60px" : undefined}
    >
      <Box
        mb={{
          base: "1em",
          md: "2em",
        }}
      >
        <Logo />
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
            icon={<SVG type="arrow-up" width={isMobile ? "17px": "22px"} height={isMobile ? "30px": "40px"} />}
            borderRadius="100"
            p="0"
            className="svgHover"
            paddingInlineStart="0"
            paddingInlineEnd="0"
            h="30px"
            padding="0"
            bg="transparent"
            onClick={() => {
              if (window) {
                // TODO: this should also work for the maincontent!
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
              marginBottom: "0.3em",
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
              mb="1em"
              sx={{
                lineHeight: "1.5em",
              }}
            >
              {config.nav.main.map((link: any, index: number) => (
                <ActiveLink
                  key={`nav-link-${index}`}
                  href={getMultilangValue(link.path)}
                >
                  <MultiLangValue json={link.title} />
                </ActiveLink>
              ))}
            </Flex>
            <Flex
              direction="column"
              sx={{
                lineHeight: "1.5em",
              }}
            >
              {config.nav.footer.map((link: any, index: number) => (
                <ActiveLink
                  key={`nav-footer-${index}`}
                  href={getMultilangValue(link.path)}
                >
                  <MultiLangValue json={link.title} />
                </ActiveLink>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;
