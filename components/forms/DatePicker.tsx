import { Box, Input } from "@chakra-ui/react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  shift,
  useDismiss,
  useFloating,
  useClick,
  useId,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useRef, useState } from "react";
import { Calendar } from "./Calendar";

export const DatePicker = ({ name, value , onChange }: {
  name: string;
  value: Date | null,
  onChange: any;
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10),
      flip({ fallbackAxisSideDirection: "end" }),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const headingId = useId();

  return (
    <>
      <Input
        readOnly
        {...getReferenceProps()}
        ref={(r: any) => {
          inputRef.current = r;
          refs.setReference(r);
        }}
        defaultValue={value?.toLocaleDateString("de")}
        sx={{
          _focus: {
            borderColor: "cm.accentLight"
          }
        }}
      />

      {isOpen && (
        <FloatingFocusManager context={context} modal={true} returnFocus={true} closeOnFocusOut={true}>
          <div
            className="Popover"
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 100 }}
            aria-labelledby={headingId}
            {...getFloatingProps()}
          >
            <Box
              borderColor="cm.accentDark"
              borderWidth="1px"
              p="2"
              backgroundColor="#fff"
            >
              <Calendar
                defaultDate={value ?? null}
                key={`${headingId}-calendar-${name}`}
                onDateSelect={(date) => {
                  if (inputRef.current) {
                    if (date) {
                      inputRef.current.value = date.toLocaleDateString("de");
                    } else {
                      inputRef.current.value = "";
                    }

                    onChange?.(date);

                    inputRef.current.focus();
                  }
                  setIsOpen(false);
                }}
              />
            </Box>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
};
