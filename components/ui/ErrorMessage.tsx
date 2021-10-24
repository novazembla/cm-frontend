import React from "react";
import { Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

// t("error.dataLoad", "Oops, something went wrong and we could not load the required data. Please try again later!")
export const ErrorMessage = ({ type }: { type: string }) => {
  const {t} = useTranslation();

  return (
    <Box color="cm.accentLight" mt="1em">
      {t(`error.${type}`)}
    </Box>
  );
};
