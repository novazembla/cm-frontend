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
        config.activeLanguages.map((lang) => (
          <RouterLink key={lang} href={router.asPath} locale={lang}>
            <Button
              as={Link}
              size="sm"
              disabled={router.locale === lang}
              textTransform="uppercase"
            >
              {lang}
            </Button>
          </RouterLink>
        ))}
    </HStack>
  );
};
