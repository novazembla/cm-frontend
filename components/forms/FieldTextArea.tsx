import React, {
  ChangeEventHandler,
  ChangeEvent,
  useRef,
  useEffect,
} from "react";
import { useFormContext } from "react-hook-form";

import {
  FormControl,
  FormLabel,
  Textarea,
  VisuallyHidden,
} from "@chakra-ui/react";

import { FieldErrorMessage } from "./FieldErrorMessage";
import { flattenErrors } from "./helpers";

export interface FieldTextAreaSettings {
  onChange?: ChangeEventHandler;
  rows?: number;
  required?: boolean;
  autoComplete?: string;
  key?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  defaultValue?: any;
  valid?: boolean;
  hideLabel?: boolean;
  autoResize?: {
    min: number;
    max: number;
  };
}

export const FieldTextArea = ({
  settings,
  id,
  label,
  name,
  isRequired,
  isDisabled,
}: {
  settings?: FieldTextAreaSettings;
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string;
  name: string;
}) => {
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
  
  const {
    formState: { errors },
    register,
    setValue,
  } = useFormContext();

  let fieldProps: FieldTextAreaSettings = {
    key: `key-${id}`,
    name: name,
  };

  fieldProps.rows = settings?.rows ?? undefined;

  if (settings?.defaultValue) fieldProps.defaultValue = settings?.defaultValue;

  fieldProps.className = settings?.className ?? undefined;

  fieldProps.autoComplete = settings?.autoComplete ?? undefined;

  fieldProps.placeholder = settings?.placeholder ?? undefined;

  const flattenedErrors = flattenErrors(errors);

  if (flattenedErrors[name]?.message) fieldProps.valid = undefined;

  const onChangeHandler: ChangeEventHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    settings?.onChange && settings?.onChange.call(null, event);

    if (settings?.autoResize) {
      (event.target as HTMLInputElement).style.height = "";
      (event.target as HTMLInputElement).style.height =
        Math.max(
          settings?.autoResize ? settings?.autoResize.min : 0,
          Math.min(
            settings?.autoResize ? settings?.autoResize.min : 1000,
            (event.target as HTMLInputElement).scrollHeight
          )
        ) + "px";
    }
  };


  const { ref, onBlur, onChange } = register(id, { required: isRequired });

  let input = (
    <Textarea
      h="200px"
      variant="outline"
      name={name}
      onBlur={(event) => {
        onBlur(event);
        onChangeHandler(event);
      }}
      onChange={(event) => {
        onChange(event);
        onChangeHandler(event);
      }}
      {...fieldProps}
      ref={(e: HTMLTextAreaElement) => {
        ref(e);
        fieldRef.current = e; // you can still assign to ref
      }}
    />
  );

  // browser auto fill and form initation might be at the wrong times
  // if this happens the "hook forms" does not register the auto filled
  // value and the field does not validate successfully despite being
  // (visibly) filled.
  useEffect(() => {
    let counter = 0;
    let interval = setInterval(() => {
      if (fieldRef.current && fieldRef.current.value) {
        setValue(name, fieldRef.current.value);
        clearInterval(interval);
      }
      if (counter > 6) {
        clearInterval(interval);
      }
      counter += 1;
    }, 100);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, setValue]);

  return (
    <FormControl
      id={id}
      isInvalid={flattenedErrors[name]?.message}
      {...{ isRequired, isDisabled }}
    >
      {settings?.hideLabel ? (
        <VisuallyHidden>
          <FormLabel htmlFor={id} mb="0.5">
            {label}
          </FormLabel>
        </VisuallyHidden>
      ) : (
        <FormLabel htmlFor={id} mb="0.5">
          {label}
        </FormLabel>
      )}
      {input}
      <FieldErrorMessage error={flattenedErrors[name]?.message} />
    </FormControl>
  );
};

export default FieldTextArea;
