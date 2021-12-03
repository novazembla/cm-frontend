import { Box, useClipboard, Button, Flex, Textarea } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { useConfigContext } from "~/provider";
import { PageTitle } from "../ui/PageTitle";

export const LocationEmbedCodeLocations = ({ query }: { query: string }) => {
  const { t } = useAppTranslations();
  const config = useConfigContext();

  const src = `${config.baseUrl}/embed/search/${query}`;
  const embedcode = `<iframe src="${src}" width="100%" height="300px" style="border:1px solid #ccc;" loading="lazy"></iframe>`;
  const { onCopy } = useClipboard(embedcode);

  return (
    <>
      <Box pt="0.5em">
        <PageTitle
          title={t("locations.embed.title.preview", "Preview")}
          type="short"
        />
        <Box
          bg="#fff"
          borderRadius="lg"
          overflow="hidden"
          p={{
            base: "10px",
            md: "25px",
          }}
        >
          <iframe
            src={src}
            width="100%"
            height="300px"
            style={{
              border: "1px solid #ccc",
            }}
          />
        </Box>
      </Box>
      <Box pt="0.5em">
        <PageTitle
          title={t("locations.embed.title.embedCode", "EmbedCode")}
          type="short"
        />
        <Box
          bg="#fff"
          borderRadius="lg"
          overflow="hidden"
          p={{
            base: "10px",
            md: "25px",
          }}
        >
          <Textarea
            w="100%"
            value={embedcode}
            spellCheck="false"
            autoCorrect="off"
            autoCapitalize="off"
            onChange={() => {}}
            onFocus={(e) => {
              e.target.select();
            }}
          />
          <Flex mt="20px" justifyContent="flex-end">
            <Button onClick={onCopy} variant="ghost">
              {t(
                "locations.embed.button.copy",
                "Copy HTML"
              )}
            </Button>
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default LocationEmbedCodeLocations;
