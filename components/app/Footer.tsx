import React from "react";
import { ActiveLink } from "~/components/ui";

import { Flex, HStack, Link } from "@chakra-ui/react";
import { useTranslation } from "next-i18next";

import { useConfig } from "~/hooks";
import { MultiLangValue } from "../ui";
import { HiLink } from "react-icons/hi";

export const Footer = ({ type = "full" }: { type?: string }) => {
  const config = useConfig();

  const { t } = useTranslation();

  return (
    <Flex textAlign="center" justifyContent="center">
      <HStack spacing="8" >
        <Link
          href={`mailto:${config.contactEmail}`}
        >
          {t("footer.contactLink.title", "Contact")}
        </Link>
        <ActiveLink
          href="/page/impressum/"
          
      >
          <MultiLangValue json={{en:"Imprint",de:"Impressum"}} />
        </ActiveLink>
        
      </HStack>
      
    </Flex>
  );
};

export default Footer;