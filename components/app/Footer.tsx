import React from "react";
import { ActiveLink } from "~/components/ui";

import { Flex, IconButton, Link, Box } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";

import { useConfigContext } from "~/provider";
import { MultiLangValue } from "../ui";

import Arrow from "~/assets/svg/Pfeil_hoch.svg";

import { getMultilangValue } from "~/utils";
import { useIsBreakPoint } from "~/hooks";
import { Logo } from ".";

export const Footer = ({
  type = "full",
  noBackground,
}: {
  type?: string;
  noBackground?: boolean;
}) => {
  const config = useConfigContext();
  const { isMobile, isTablet } = useIsBreakPoint();

  const { t } = useTranslation();

  return (
    <Box
      layerStyle={!noBackground ? "blurredLightGray" : undefined}
      py={{
        base: "20px",
        sm: "20px",
        md: "45px",
        xl: "55px",
      }}
      px={{
        base: !noBackground || isMobile ? "20px" : 0,
        sm: !noBackground|| isMobile ? "20px" : 0,
        md: !noBackground ? "45px" : "25px",
        xl: !noBackground ? "55px" : "35px",
      }}
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
            lg: "33.33%",
          }}
        >
          <IconButton
            mb="1.5"
            aria-label={t("menu.button.backToTop", "Back to top")}
            icon={<Arrow />}
            borderRadius="100"
            p="0"
            paddingInlineStart="0"
            paddingInlineEnd="0"
            h="50px"
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
              marginBottom: "0.3em",
              _last: {
                marginBottom: 0,
              },
            },
          }}
          w={{
            base: "75%",

            md: "50%",
            lg: "66.66%",
          }}
          direction={{
            base: "column",
          }}
        >
          <Flex direction="column" mb="1em">
            {config.nav.main.map((link: any, index: number) => (
              <ActiveLink
                key={`nav-link-${index}`}
                href={getMultilangValue(link.path)}
              >
                <MultiLangValue json={link.title} />
              </ActiveLink>
            ))}
          </Flex>
          <Flex direction="column">
            {config.nav.footer.map((link: any, index: number) => (
              <ActiveLink
                key={`nav-footer-${index}`}
                href={getMultilangValue(link.path)}
              >
                <MultiLangValue json={link.title} />
              </ActiveLink>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;
