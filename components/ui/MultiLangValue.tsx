import React from "react";
import { useConfigContext } from "~/provider";
import { Box } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks";

export const MultiLangHtml = ({
  json,
}: {
  json?: Record<string, string> | string;
}) => {
  const { t, i18n } = useAppTranslations();
  const config = useConfigContext();

  if (!json) return <></>;

  if (typeof json === "string") return <>{json}</>;

  const defVal = json[config.defaultLanguage ?? ""]
    ? `${json[config.defaultLanguage ?? ""]}`
    : undefined;

  let value =
    json[i18n.language] ??
    defVal ??
    t("translationnotfound", "Trans. not found");

  return (
    <Box
      dangerouslySetInnerHTML={{
        __html: value,
      }}
    />
  );
};
