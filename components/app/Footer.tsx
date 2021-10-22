import React from "react";
import { ActiveLink } from "~/components/ui";

import { Flex, IconButton, Link, Box } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";

import { useConfigContext } from "~/provider";
import { MultiLangValue } from "../ui";

import Arrow from "~/assets/svg/Pfeil_hoch.svg";

import { getMultilangValue } from "~/utils";
import { useIsBreakPoint } from "~/hooks";

export const Footer = ({ type = "full" }: { type?: string }) => {
  const config = useConfigContext();
  const { isMobile, isTablet } = useIsBreakPoint();

  const { t } = useTranslation();

  return (
    <Box
      layerStyle="blurredLightGray"
      p={{
        base: "20px",
        sm: "20px",
        md: "45px",
        xl:  "55px",
      }}
    >
      <Box
        textStyle="logo"
        textDecoration="none !important"
        whiteSpace="nowrap"
        w={{
          xl:  "40%",
        }}
        mb={{
          base: "1em",
          md: "2em",
        }}
      >
        <Link
          as={ActiveLink}
          activeClassName="active"
          href="/"
          color="black"
          textDecoration="none !important"
          whiteSpace="nowrap"
        >
          {t("header.logo", "CultureMap")}
        </Link>
      </Box>
      <Flex alignItems="flex-end" justifyContent="space-between">
        <Box
          w={{
            base: "auto",
            md: "33.33%",
            xl:  "50%",
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
            base: "auto",
            md: "66.66%",
            xl:  "auto",
          }}
          direction={{
            base: "column",
            md: "row",
          }}
        >
          <Flex
            direction="column"
            mb={{
              base: "1em",
              md: 0,
            }}
            w={{
              base: "100%",
              md: "50%",
            }}
            display={{
              base:"flex",

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
            w={{
              base: "100%",
              md: "50%",
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
        </Flex>
      </Flex>
    </Box>
  );
};

export default Footer;
