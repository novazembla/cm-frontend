import { Box } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks/useAppTranslations";
import { isEmptyHtml } from "~/utils";
import { MultiLangHtml } from "../ui/MultiLangHtml";

export const AccessibilityInformation = ({
  terms,
  accessibilityInformation,
}: {
  terms: any;
  accessibilityInformation?: string;
}) => {
  const { t, getMultilangValue, getMultilangHtml } = useAppTranslations();

  const filteredList = terms?.filter((term: any) => !!term?.iconKey);

  if (!filteredList?.length) return <></>;

  return (
    <Box className="item">
      <Box
        mb="0.5em"
        color="cm.accentDark"
        textTransform="uppercase"
        textStyle="categories"
      >
        {t(
          "location.title.accessibilityInformation",
          "Accessibility Information"
        )}
      </Box>
      <Box textStyle="card">
        {!isEmptyHtml(getMultilangHtml(accessibilityInformation)) && (
          <Box mb="4">
            <MultiLangHtml json={accessibilityInformation} />
          </Box>
        )}
        <Box flexWrap="wrap" display="flex" gap="2">
          {filteredList.map((term: any) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`accessibility-${getMultilangValue(term?.name)}`}
              alt={getMultilangValue(term?.name)}
              title={getMultilangValue(term?.name)}
              src={`/accessibility/${term?.iconKey}`}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
