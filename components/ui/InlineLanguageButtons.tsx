import React from "react";
import { default as RouterLink } from "next/link";
import { useTranslation } from "next-i18next";
import { Button, HStack, Link } from "@chakra-ui/react";
import { useConfigContext } from "~/provider";
import { useRouter } from "next/router";

export const InlineLanguageButtons = () => {
  const config = useConfigContext();
  const { i18n } = useTranslation();

  const router = useRouter();

  return (
    <HStack spacing="2">
      {config.activeLanguages &&
        config.activeLanguages
          .reduce((acc: any, lang: any) => {
            if (lang === i18n.language) return acc;

            acc.push(
              <RouterLink
                key={lang}
                href={router.asPath}
                locale={lang}
                passHref
              >
                <Link
                  textTransform="uppercase"
                  color="cm.accentLight"
                  textStyle="navigation"
                  textDecoration="none !important"
                  _hover={{ color: "cm.text" }}
                >
                  {lang}
                </Link>
              </RouterLink>
            );
            return acc;
          }, [] as any)
          .map((e: any) => e)}
    </HStack>
  );
};
