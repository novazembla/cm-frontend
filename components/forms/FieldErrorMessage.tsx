import React from "react";
import { FormErrorMessage } from "@chakra-ui/react";
import { useAppTranslations } from "~/hooks/useAppTranslations";


type TypeErrorMessage = {
  key: string;
  values: object;
};

export const FieldErrorMessage = ({
  error
}: {
  error: TypeErrorMessage | string;  
}): JSX.Element | null => {
  const { t } = useAppTranslations();

  let message;

  if (typeof error === "string") {
    message = t(error);
  } else if (typeof error === "object" && error.key && error.values) {
    message = t(error.key, error.values);
  }

  if (!message || message.trim().length === 0) return null;

  // make sure first character is uppder case
  message = message.charAt(0).toUpperCase() + message.slice(1);

  return <FormErrorMessage mt="0.5">{message}</FormErrorMessage>;
};

export default FieldErrorMessage;
