import {
  Box,
  Flex,
  HStack,
  IconButton,
  Input,
  Table,
  Td,
  Th,
  Thead,
  VisuallyHidden,
} from "@chakra-ui/react";

import { FloatingFocusManager } from "@floating-ui/react";
import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { HiOutlineTrash } from "react-icons/hi";
import { MdPlusOne } from "react-icons/md";

import { isValidDate, parseDateToTime } from "~/utils";
import { DatePicker } from "../forms/DatePicker";
import TimeField from "../forms/TimeField";

export const SuggestEventDates = () => {
  const { t } = useTranslation();
  const [isOpenFieldArray, setIsOpenFieldArray] = useState<
    Record<string, boolean>
  >({});

  const { control, getValues } = useFormContext();

  const { fields, remove, insert } = useFieldArray({
    control,
    name: "dates",
    keyName: "fieldId",
  });

  return (
    <Box>
      <Table position="relative" w="100%">
        <Thead>
          <tr>
            <Th
              pl="0"
              borderColor="cm.accentDark"
              fontSize="md"
              color="gray.800"
            >
              {t(
                "module.events.forms.eventdates.table.column.date.label",
                "Date"
              )}
            </Th>
            <Th
              pl="0"
              borderColor="cm.accentDark"
              fontSize="md"
              color="gray.800"
            >
              {t("module.events.forms.event.table.column.begin.label", "Begin")}
            </Th>
            <Th
              pl="0"
              borderColor="cm.accentDark"
              fontSize="md"
              color="gray.800"
            >
              {t("module.events.forms.event.table.column.end.label", "End")}
            </Th>
            <Th
              textAlign="center"
              px="0"
              borderColor="cm.accentDark"
              fontSize="md"
              color="gray.800"
              _last={{
                position: "sticky",
                right: 0,
                p: 0,
                "> div": {
                  p: 4,
                  h: "100%",
                  bg: "rgba(255,255,255,0.9)",
                },
              }}
            >
              {t("table.label.actions", "Actions")}
            </Th>
          </tr>
        </Thead>
        <tbody>
          {fields.map((f, index) => {
            const field = f as any;
            return (
              <tr key={f.fieldId}>
                <Td
                  pl="0"
                  borderColor={
                    fields.length === index + 1
                      ? "transparent"
                      : "cm.accentDark"
                  }
                >
                  <Controller
                    control={control}
                    name={`dates[${index}].date`}
                    defaultValue={field.date}
                    render={({
                      field: { onChange, onBlur, value, name, ref },
                    }) => {
                      const date = isValidDate(value) ? value : field.date;
                      if (date instanceof Date) {
                        date.setHours(0, 0, 0, 0);
                      }

                      return (
                        <DatePicker
                          onChange={onChange}
                          value={date}
                          name={name}
                        />
                      );
                    }}
                  />
                </Td>
                <Td
                  pl="0"
                  borderColor={
                    fields.length === index + 1
                      ? "transparent"
                      : "cm.accentDark"
                  }
                  width="100px"
                >
                  {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                  <label htmlFor={`dates${index}begin`}>
                    <VisuallyHidden>
                      {t(
                        "module.events.forms.event.field.begin.label",
                        "Begin"
                      )}
                    </VisuallyHidden>
                    <Controller
                      control={control}
                      name={`dates[${index}].begin`}
                      defaultValue={
                        isValidDate(field.begin)
                          ? field.begin
                          : new Date(new Date().setHours(10, 0, 0, 0))
                      }
                      render={({
                        field: { onChange, onBlur, value, name, ref },
                      }) => {
                        const time = parseDateToTime(value, "10:00");
                        return (
                          <TimeField
                            onChange={(event, time) => {
                              const date = getValues(`dates[${index}].date`);
                              const hm = time.split(":");
                              if (isValidDate(date)) {
                                onChange(
                                  new Date(
                                    date.setHours(
                                      parseInt(hm[0]),
                                      parseInt(hm[1]),
                                      0,
                                      0
                                    )
                                  )
                                );
                              } else {
                                onChange(
                                  new Date(
                                    new Date().setHours(
                                      parseInt(hm[0]),
                                      parseInt(hm[1]),
                                      0,
                                      0
                                    )
                                  )
                                );
                              }
                            }}
                            input={<Input id={`dates${index}end`} />}
                            value={time}
                          />
                        );
                      }}
                    />
                  </label>
                </Td>
                <Td
                  pl="0"
                  borderColor={
                    fields.length === index + 1
                      ? "transparent"
                      : "cm.accentDark"
                  }
                  width="100px"
                >
                  {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                  <label htmlFor={`dates${index}end`}>
                    <VisuallyHidden>
                      {t("module.events.forms.event.field.end.label", "End")}
                    </VisuallyHidden>
                    <Controller
                      control={control}
                      name={`dates[${index}].end`}
                      defaultValue={
                        isValidDate(field.end)
                          ? field.end
                          : new Date(new Date().setHours(18, 0, 0, 0))
                      }
                      render={({
                        field: { onChange, onBlur, value, name, ref },
                      }) => {
                        const time = parseDateToTime(value, "18:00");
                        return (
                          <TimeField
                            onChange={(event, time) => {
                              const date = getValues(`dates[${index}].date`);
                              const hm = time.split(":");
                              if (isValidDate(date)) {
                                onChange(
                                  new Date(
                                    date.setHours(
                                      parseInt(hm[0]),
                                      parseInt(hm[1]),
                                      0,
                                      0
                                    )
                                  )
                                );
                              } else {
                                onChange(
                                  new Date(
                                    new Date().setHours(
                                      parseInt(hm[0]),
                                      parseInt(hm[1]),
                                      0,
                                      0
                                    )
                                  )
                                );
                              }
                            }}
                            input={<Input id={`dates${index}end`} />}
                            value={time}
                          />
                        );
                      }}
                    />
                  </label>
                </Td>
                <Td
                  px="0"
                  borderColor={
                    fields.length === index + 1
                      ? "transparent"
                      : "cm.accentDark"
                  }
                  _last={{
                    p: 0,
                    "> div": {
                      p: 0,
                      h: "100%",
                    },
                  }}
                >
                  <Flex justifyContent="center">
                    <HStack mx="auto">
                      <IconButton
                        aria-label={t(
                          "module.events.forms.event.field.dates.removedate",
                          "Remove"
                        )}
                        title={t(
                          "module.events.forms.event.field.dates.removedate",
                          "Remove"
                        )}
                        borderRadius="100%"
                        fontSize="xl"
                        colorScheme="red"
                        variant="outline"
                        icon={<HiOutlineTrash />}
                        onClick={() => remove(index)}
                        isDisabled={fields.length === 1}
                      />

                      <IconButton
                        aria-label={t(
                          "module.events.forms.event.field.dates.clone",
                          "Clone current line"
                        )}
                        title={t(
                          "module.events.forms.event.field.dates.clone",
                          "Clone current line"
                        )}
                        variant="outline"
                        borderRadius="100%"
                        icon={<MdPlusOne />}
                        fontSize="xl"
                        onClick={() => {
                          const values = getValues(`dates[${index}]`);
                          const oneDayInMs = 60 * 60 * 24 * 1000;

                          insert(index + 1, {
                            date: isValidDate(values.date)
                              ? new Date(values.date.getTime() + oneDayInMs)
                              : new Date(),
                            begin: isValidDate(values.begin)
                              ? new Date(values.begin.getTime() + oneDayInMs)
                              : new Date(new Date().setHours(10, 0, 0, 0)),
                            end: isValidDate(values.end)
                              ? new Date(values.end.getTime() + oneDayInMs)
                              : new Date(new Date().setHours(18, 0, 0, 0)),
                          });
                        }}
                      />
                    </HStack>
                  </Flex>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Box>
  );
};
