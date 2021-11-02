import React from "react";
import {
  Radio,
  Box,
  Flex,
  FormControl,
  RadioGroup,
  Stack,
  chakra,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useFormContext, Controller } from "react-hook-form";
import { MultiLangValue } from "~/components/ui";
import { FieldErrorMessage, flattenErrors } from ".";

export type FieldRadioGroupOption = {
  label: string;
  id: string | number;
};

export const FieldRadioGroup = ({
  id,
  label,
  name,
  type, // TODO: allow for radio boxes ...
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
  type: string;
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
      <Flex flexWrap="wrap" flexDirection="column">
        <Controller
          key={name}
          control={control}
          name={name}
          defaultValue={defaultValue}
          render={({ field: { onChange, onBlur, value, ref } }) => {
            return (
              <RadioGroup
                defaultValue={defaultValue ?? ""}
                onChange={onChange}
                onBlur={onBlur}
              >
                {options.map((option, index) => (
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
                    <MultiLangValue json={option.label} />
                  </Radio>
                ))}
              </RadioGroup>
            );
          }}
        />
      </Flex>
      <Box transform="translateY(-10px)">
        <FieldErrorMessage error={flattenedErrors[name]?.message} />
      </Box>
    </FormControl>
  );
};
