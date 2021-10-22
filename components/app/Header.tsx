import React, { useState, ChangeEvent, useEffect, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";

import { object, string } from "yup";
import type * as yup from "yup";

import { HiOutlineSearch } from "react-icons/hi";

import {
  Heading,
  Flex,
  Link,
  Box,
  VisuallyHidden,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  HStack,
  useToken,
} from "@chakra-ui/react";

import { useIsBreakPoint } from "~/hooks";

import {
  InlineLanguageButtons,
  ActiveLink,
  MultiLangValue,
} from "~/components/ui";
import { useLazyQuery, gql } from "@apollo/client";
import { useForm, Controller } from "react-hook-form";
import {
  useMapContext,
  useConfigContext,
  useQuickSearchSetSearchResultContext,
} from "~/provider";
import { getMultilangValue } from "~/utils";
import { chakraToBreakpointArray } from "~/theme";

export const Header = (/* props */) => {
  const {isMobile} = useIsBreakPoint();

  const config = useConfigContext();

  const { t } = useTranslation();

  return (
    <Box
      m="0"
      px={chakraToBreakpointArray({
        base: "20px",
        md: "45px",
        xl:  "55px",
        xl2:  "0px",
      })}
      position="fixed"
      w="100%"
      top="0"
      h={{
        base: "60px",
        sm: "60px",
        md: "60px",
        xl:  "100",
        xl2:  "80px",
      }}
      zIndex="overlay"
      layerStyle="blurredWhite"
      borderBottom="1px solid"
      borderColor={chakraToBreakpointArray({
        base: "red",
        md: "blue",
        xl:  "orange",
        xl2:  "green",
      })}
    >
      <Flex
        alignItems="flex-end"
        w={{
          base: "100%",
          xl2:  "80%",
        }}
        h="100%"
        marginX="auto"
        justifyContent="space-between"
        pb="2"
      >
        <Box
          textStyle="logo"
          textDecoration="none !important"
          whiteSpace="nowrap"
          w={{
            xl:  "40%",
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

        {!isMobile && (
          <Box
            sx={{
              textAlign: "right",
              textDirection: "ltr",
              a: {
                textTransform: "uppercase",
                marginTop: "0.4em",
                marginLeft: "1em",
                display: "inline-block",
              },
            }}
            textStyle="navigation"
            px="5"
          >
            {config.nav.main.map((link: any, index: number) => (
              <ActiveLink
                key={`nav-link-${index}`}
                href={getMultilangValue(link.path)}
              >
                <MultiLangValue json={link.title} />
              </ActiveLink>
            ))}
          </Box>
        )}
        <Box>
          <InlineLanguageButtons />
        </Box>
      </Flex>
    </Box>
  );
};
