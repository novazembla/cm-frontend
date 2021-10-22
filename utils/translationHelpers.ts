import i18n from "i18next";

export const getMultilangValue = (
  json: Record<string, string> | string
): string => {
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
};
