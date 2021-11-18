import React from "react";
import NextLink from "next/link";
import { Button, HStack, Link } from "@chakra-ui/react";
import { useConfigContext } from "~/provider";
import { useRouter } from "next/router";
import { useAppTranslations } from "~/hooks";

export const InlineLanguageButtons = () => {
  const config = useConfigContext();
  const { i18n } = useAppTranslations();

  const router = useRouter();

  return (
    <HStack spacing="2">
      {config.activeLanguages &&
        config.activeLanguages
          .reduce((acc: any, lang: any) => {
            if (lang === i18n.language) return acc;

            acc.push(
              <NextLink
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
                  _hover={{ color: "cm.accentDark" }}
                  _focus={{
                    
                  }}
                >
                  {lang}
                </Link>
              </NextLink>
            );
            return acc;
          }, [] as any)
          .map((e: any) => e)}
    </HStack>
  );
};
