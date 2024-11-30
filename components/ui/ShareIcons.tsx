import { useState } from "react";
import { chakra, HStack, useClipboard, Flex } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { useConfigContext } from "~/provider";
import { SVGShareIcons } from "./SVGShareIcons";
import { primaryInput } from "detect-it";

export const ShareIcons = ({ title, url }: { title: string; url: string }) => {
  const { t } = useAppTranslations();
  const config = useConfigContext();
  const txt = document.createElement("textarea");
  txt.innerHTML = title;
  const parsedTitle = encodeURIComponent(txt.value);

  const { onCopy } = useClipboard(url);

  const [copied, setIsCopied] = useState(false);
  return (
    <Flex justifyContent="flex-end">
      <HStack spacing="0.75em" justifyContent="right">
        <chakra.a
          className="svgHoverRI tabbedFocus"
          href={`http://www.facebook.com/sharer.php?u=${encodeURIComponent(
            url
          )}&t=${parsedTitle}`}
          target="_blank"
          rel="nofollow noreferrer"
          title={t("share.onFacebook", "Share on Facebook")}
          py="3px"
          pl="6px"
        >
          <SVGShareIcons type="facebook" width="24px" height="24px" />
        </chakra.a>
        <chakra.a
          className="svgHoverRI tabbedFocus"
          href={`https://twitter.com/intent/tweet?text=${parsedTitle}&url=${encodeURIComponent(
            url
          )}${config.twitterHandle ? `&via=${config.twitterHandle}` : ""}`}
          target="_blank"
          rel="nofollow noreferrer"
          title={t("share.onTwitter", "Share on Twitter")}
          py="1px"
          pl="2px"
        >
          <SVGShareIcons type="twitter" width="28px" height="25px" />
        </chakra.a>

        {primaryInput === "touch" && (
          <>
            <chakra.a
              className="svgHoverRI tabbedFocus"
              href={`whatsapp://send?text=${encodeURIComponent(url)}`}
              target="_blank"
              rel="nofollow noreferrer"
              title={t("share.onWhatsapp", "Share with Whatsapp")}
              py="2px"
              pl="4px"
            >
              <SVGShareIcons type="whatsapp" width="26px" height="26px" />
            </chakra.a>
            <chakra.a
              className="svgHoverRI tabbedFocus"
              href={`fb-messenger://share?link=${encodeURIComponent(url)}`}
              target="_blank"
              rel="nofollow noreferrer"
              title={t("share.onFbMessenger", "Share with facebook messenger")}
              py="1px"
              pl="2px"
            >
              <SVGShareIcons type="fbmessenger" width="28px" height="28px" />
            </chakra.a>
          </>
        )}

        <chakra.a
          className={`svgHoverRI tabbedFocus${copied}? " active":""`}
          href="#"
          title={t("share.copyUrl", "Copy url to clipboard")}
          py="2px"
          pl="4px"
          onClick={(e) => {
            e.preventDefault();
            onCopy();
            setIsCopied(true);
            setTimeout(() => {
              setIsCopied(false);
            }, 1000);
          }}
        >
          <SVGShareIcons type="copy" width="26px" height="26px" />
        </chakra.a>
      </HStack>
    </Flex>
  );
};
