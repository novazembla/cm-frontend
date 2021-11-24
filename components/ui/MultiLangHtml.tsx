import { useConfigContext } from "~/provider";
import { Box } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { isEmptyHtml } from "~/utils";
import { useRouter } from "next/router";

export const MultiLangHtml = ({
  json,
  addMissingTranslationInfo,
}: {
  json?: Record<string, string> | string;
  addMissingTranslationInfo?: boolean;
}) => {
  const { t, i18n } = useAppTranslations();
  const config = useConfigContext();
  const router = useRouter();

  if (!json) return null;

  let value;
  if (typeof json === "string") {
    value = json;
  } else {
    value = json[i18n.language];
    const defVal = json[config.defaultLanguage ?? ""];

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
  }

  if (!value) return null;

  const handleAnchorClick = (e: any) => {
    if (typeof window === "undefined") return;

    const targetLink = e.target.closest("a");
    if (!targetLink) return;

    const url = new URL(targetLink.href);
    const locationUrl = new URL(document.location.href);

    if (url.host === locationUrl.host) {
      router.push(url.pathname, undefined, {
        locale: i18n.language,
      });
      e.preventDefault();
    } else {
      if (targetLink.target !== "_blank") {
        window?.open(targetLink.href, "_blank")?.focus();
        e.preventDefault();
      }
    }
  };

  return (
    <Box
      onClick={handleAnchorClick}
      onKeyPress={handleAnchorClick}
      dangerouslySetInnerHTML={{
        __html: value,
      }}
    />
  );
};
