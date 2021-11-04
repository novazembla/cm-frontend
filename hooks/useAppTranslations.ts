import { I18n } from "next-i18next";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

export type AppTranslationHelper = {
  t: Function;
  i18n: I18n;
  getMultilangValue: (data: any) => string;
}

export const useAppTranslations = (): AppTranslationHelper => {
  const { t, i18n } = useTranslation();

  const getMultilangValue = useCallback(
    (json: Record<string, string> | string): string => {
      if (!json) return "";

      if (typeof json === "string") return json;

      const defaultLanguage = "de"; // Todo: make this configurable!

      const defVal = json[defaultLanguage]
        ? `${json[defaultLanguage]}`
        : undefined;

      let value =
        json[i18n.language] ??
        defVal ??
        i18n.t("translationnotfound", "Trans. not found");

      return value;
    },
    [i18n]
  );

  return {
    t,
    i18n,
    getMultilangValue,
  };
};
