import { Box } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks/useAppTranslations";

export const AccesibilityInformation = ({ terms }: { terms: any }) => {
  const { t, getMultilangValue } = useAppTranslations();

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
        {t("taxonomy.label.accessibility", "Accessibility Information")}
      </Box>
      <Box textStyle="card">
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
