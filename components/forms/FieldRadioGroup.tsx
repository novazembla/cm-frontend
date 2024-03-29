import React from "react";
import {
  Radio,
  Box,
  Flex,
  FormControl,
  RadioGroup,
  chakra,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useFormContext, Controller } from "react-hook-form";
import { MultiLangValue } from "~/components/ui/MultiLangValue";
import { FieldErrorMessage } from "./FieldErrorMessage";
import { flattenErrors } from "./helpers";

export type FieldRadioGroupOption = {
  label: string;
  id: string | number;
};

export const FieldRadioGroup = ({
  id,
  label,
  name,
  options,
  defaultValue,
  isRequired,
  isDisabled,
}: {
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string | React.ReactNode;
  name: string;
  options: FieldRadioGroupOption[];
  defaultValue?: string | number;
}) => {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  if (!options || options.length === 0) return <></>;

  const flattenedErrors = flattenErrors(errors);

  return (
    <FormControl
      id={id}
      isInvalid={flattenedErrors[name]?.message}
      isRequired={isRequired}
    >
      <chakra.fieldset>
        <VisuallyHidden>
          <legend>{label}</legend>
        </VisuallyHidden>
        <Flex flexWrap="wrap" flexDirection="column">
          <Controller
            key={name}
            control={control}
            name={name}
            defaultValue={defaultValue}
            render={({ field: { ref: _ref, ...field } }) => (
              <RadioGroup {...field}>
                {options.map((option, index) => {
                  return (
                    <Radio
                      key={`${name}_${option.id}`}
                      value={option.id}
                      pr="6"
                      mb="2"
                      sx={{
                        svg: {
                          display: "none",
                        },
                      }}
                    >
                      <chakra.span textStyle="formOptions">
                        <MultiLangValue json={option.label} />
                      </chakra.span>
                    </Radio>
                  );
                })}
              </RadioGroup>
            )}
          />
        </Flex>
        <Box transform="translateY(-10px)">
          <FieldErrorMessage error={flattenedErrors[name]?.message} />
        </Box>
      </chakra.fieldset>
    </FormControl>
  );
};
