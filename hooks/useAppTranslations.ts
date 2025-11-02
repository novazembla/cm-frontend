import { I18n } from "next-i18next";
import { useCallback } from "react";
import { useTranslation } from "next-i18next";
import { useConfigContext } from "~/provider";
import { isEmptyHtml } from "~/utils";

export type AppTranslationHelper = {
  t: Function;
  i18n: I18n;
  getMultilangValue: (data: any) => string;
  getMultilangHtml: (data: any, addMissingTranslationInfo?: boolean) => string;
};

export const useAppTranslations = (): AppTranslationHelper => {
  const config = useConfigContext();
  const { t, i18n } = useTranslation();

  const getMultilangValue = useCallback(
    (json: Record<string, string> | string): string => {
      if (!json) return "";

      if (typeof json === "string") return json;

      const defVal = json[config.defaultLanguage ?? ""]
        ? `${json[config.defaultLanguage ?? ""]}`
        : undefined;

      let value =
        json?.[i18n.language] ??
        defVal ??
        i18n.t("translationnotfound", "Trans. not found");

      if (typeof value === "string" && value.trim() === "") {
        if (typeof defVal === "string" && defVal.trim() !== "") return defVal;
      }
      return value;
    },
    [i18n, config]
  );

  const getMultilangHtml = useCallback(
    (
      json: Record<string, string> | string,
      addMissingTranslationInfo?: boolean
    ): string => {
      if (!json) return "";

      if (typeof json === "string") return json;

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

      if (!value) return "";

      return value;
    },
    [i18n, config, t]
  );

  return {
    t,
    i18n,
    getMultilangValue,
    getMultilangHtml,
  };
};
