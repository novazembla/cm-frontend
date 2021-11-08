import React from "react";
import { useConfigContext } from "~/provider";
import { Box } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks";
import { isEmptyHtml } from "~/utils";

export const MultiLangHtml = ({
  json,
}: {
  json?: Record<string, string> | string;
}) => {
  const { t, i18n } = useAppTranslations();
  const config = useConfigContext();

  if (!json) return null;

  if (typeof json === "string")
    return (
      <Box
        dangerouslySetInnerHTML={{
          __html: json,
        }}
      />
    );

  const defVal = json[config.defaultLanguage ?? ""]

  let value = json[i18n.language]

  if (isEmptyHtml(json[i18n.language]) && !isEmptyHtml(defVal)) {
    value = `<p>${t("translation.comingSoon", "We are working on the Enlish translation")}</p>${defVal}`
  }

  if (!value) return null;

  return (
    <Box
      dangerouslySetInnerHTML={{
        __html: value,
      }}
    />
  );
};
