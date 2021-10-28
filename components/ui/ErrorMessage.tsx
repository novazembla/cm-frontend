import React from "react";
import { Box } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks";

// t("error.dataLoad", "Oops, something went wrong and we could not load the required data. Please try again later!")
export const ErrorMessage = ({ type }: { type: string }) => {
  const { t } = useAppTranslations();

  return (
    <Box color="cm.accentLight" mt="1em">
      {t(`error.${type}`)}
    </Box>
  );
};
