import React from "react";
import { useConfigContext } from "~/provider";
import { useAppTranslations } from "~/hooks/useAppTranslations";


export const MultiLangValue = ({ json }: { json?: Record<string, string> | string }) => {
  
  const { t, i18n } = useAppTranslations();
  const config = useConfigContext();

  if (!json)
    return <></>;
    
  if (typeof json === "string")
    return <>{json}</>
    
  const defVal = json[config.defaultLanguage ?? ""] ? `${json[config.defaultLanguage ?? ""]}`: undefined;

  let value = json[i18n.language] ?? defVal ?? t("translationnotfound", "Trans. not found");

  if (value === "" && defVal !== "")
    return <>{defVal}</>;

  return <>{value}</>;
};
