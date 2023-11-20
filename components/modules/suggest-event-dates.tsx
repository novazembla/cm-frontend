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
  chakra,
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
      <Table
        position="relative"
        w="100%"
        display={{ base: "block", md: "table" }}
      >
        <Thead>
          <chakra.tr display={{ base: "none", md: "table-row" }}>
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
          </chakra.tr>
        </Thead>
        <tbody>
          {fields.map((f, index) => {
            const field = f as any;
            return (
              <chakra.tr
                key={f.fieldId}
                display={{ base: "flex", md: "table-row" }}
                flexWrap="wrap"
                borderBottom={{
                  base: "var(--chakra-borders-1px)",
                  md: "none",
                }}
                borderColor="cm.accentDark"
                paddingBottom={{
                  base: "2",
                  md: "none",
                }}
                _last={{
                  border:"none",

                  "> td": {
                    border:"none"
                  }
                }}
              >
                <Td
                  pl="0"
                  borderColor={
                    fields.length === index + 1
                      ? "transparent"
                      : "cm.accentDark"
                  }
                  display={{ base: "flex", md: "table-cell" }}
                  flexDirection="column"
                  w={{ base: "100%", md: "50%" }}
                  paddingRight={{ base: "0", md: "4" }}
                  paddingBottom={{ base: "0", md: "4" }}
                  borderBottom={{
                    base: "none",
                    md: "var(--chakra-borders-1px)",
                  }}
                >
                  <VisuallyHidden display={{ base: "none", md: "block" }}>
                    {t(
                      "module.events.forms.eventdates.table.column.date.label",
                      "Date"
                    )}
                  </VisuallyHidden>
                  <Box
                    paddingBottom="1"
                    display={{ md: "none" }}
                    fontSize="smaller"
                  >
                    {t(
                      "module.events.forms.eventdates.table.column.date.label",
                      "Date"
                    )}
                  </Box>
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
                  display={{ base: "flex", md: "table-cell" }}
                  flexDirection="column"
                  w={{ base: "30%", md: "100px" }}
                  paddingRight={{ base: "2", md: "4" }}
                  borderBottom={{
                    md: "var(--chakra-borders-1px)",
                  }}
                >
                  {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                  <label htmlFor={`dates${index}begin`}>
                    <VisuallyHidden display={{ base: "none", md: "block" }}>
                      {t(
                        "module.events.forms.event.table.column.begin.label",
                        "Begin"
                      )}
                    </VisuallyHidden>
                    <Box
                      paddingBottom="1"
                      display={{ md: "none" }}
                      fontSize="smaller"
                    >
                      {t(
                        "module.events.forms.event.table.column.begin.label",
                        "Begin"
                      )}
                    </Box>
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
                  display={{ base: "flex", md: "table-cell" }}
                  flexDirection="column"
                  w={{ base: "30%", md: "100px" }}
                  paddingRight={{ base: "2", md: "4" }}
                  borderBottom={{
                    md: "var(--chakra-borders-1px)",
                  }}
                >
                  {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                  <label htmlFor={`dates${index}end`}>
                    <VisuallyHidden display={{ base: "none", md: "block" }}>
                      {t("module.events.forms.event.field.end.label", "End")}
                    </VisuallyHidden>
                    <Box
                      paddingBottom="1"
                      display={{ md: "none" }}
                      fontSize="smaller"
                    >
                      {t("module.events.forms.event.field.end.label", "End")}
                    </Box>
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
                  display={{ base: "flex", md: "table-cell" }}
                  flexDirection="column"
                  alignItems="center"
                  w={{ base: "40%", md: "100px" }}
                  paddingRight={{ base: "2", md: "4" }}
                  borderBottom={{
                    md: "var(--chakra-borders-1px)",
                  }}
                >
                  <VisuallyHidden display={{ base: "none", md: "block" }}>
                    {t("table.label.actions", "Actions")}
                  </VisuallyHidden>
                  <Box
                    paddingBottom="1"
                    display={{ md: "none" }}
                    fontSize="smaller"
                  >
                    {t("table.label.actions", "Actions")}
                  </Box>
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
              </chakra.tr>
            );
          })}
        </tbody>
      </Table>
    </Box>
  );
};
