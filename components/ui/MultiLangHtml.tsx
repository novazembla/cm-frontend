import React from "react";
import { useConfigContext } from "~/provider";
import { Box } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks";
import { isEmptyHtml } from "~/utils";

export const MultiLangHtml = ({
  json,
  addMissingTranslationInfo,
}: {
  json?: Record<string, string> | string;
  addMissingTranslationInfo?: boolean;
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

  const defVal = json[config.defaultLanguage ?? ""];

  let value = json[i18n.language];

  if (isEmptyHtml(json[i18n.language]) && !isEmptyHtml(defVal)) {
    if (addMissingTranslationInfo) {
      value = `<p class="translationMissing">${t(
        "translation.comingSoon",
        "Please bear with us. We are working on the English translation."
      )}</p>${defVal}`;
    } else {
      value = defVal;
    }
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
