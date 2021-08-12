import React from "react";
import { useTranslation } from "next-i18next";
import { useConfig } from "~/hooks";
import { Box } from "@chakra-ui/react";

export const MultiLangHtml = ({ json }: { json?: Record<string, string> | string }) => {
  
  const { t, i18n } = useTranslation();
  const config = useConfig();

  if (!json)
    return <></>;
    
  if (typeof json === "string")
    return <>{json}</>
    
  const defVal = json[config.defaultLanguage ?? ""] ? `${json[config.defaultLanguage ?? ""]} *`: undefined;

  let value = json[i18n.language] ?? defVal ?? t("translationnotfound", "Trans. not found");

  return <Box dangerouslySetInnerHTML={{
    __html: value
  }}/>;
};
