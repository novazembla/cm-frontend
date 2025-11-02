import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  chakra,
  Flex,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { useCalendar } from '@h6s/calendar/dist/index.js';
import { useTranslation } from "next-i18next";

export const Calendar = ({
  defaultDate,
  onDateSelect,
}: {
  defaultDate: Date | null;
  onDateSelect: (date: Date) => void;
}) => {
  const { i18n, t } = useTranslation();
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  const nonNullDefaultDate = defaultDate ? defaultDate : new Date();

  const { headers, body, cursorDate, navigation } = useCalendar({
    defaultWeekStart: 1,
    defaultDate: nonNullDefaultDate,
  });

  return (
    <>
      <Flex
        w="100%"
        justifyContent="space-between"
        maxW="300px"
        mx="auto"
        alignItems="center"
        mb=""
      >
        <IconButton
          aria-label={t("event.calendar.previousMonth", "Previous month")}
          className="tabbedFocus"
          icon={<ChevronLeftIcon />}
          onClick={navigation.toPrev}
          variant="unstyled"
          color="cm.accentLight"
          fontSize="2xl"
          _hover={{
            bg: "transparent",
            color: "cm.accentDark",
          }}
          _active={{
            color: "cm.accentDark",
          }}
        />
        <Box textStyle="navigation">
          {cursorDate.toLocaleDateString(i18n?.language ?? "de", {
            month: "long",
            year: "numeric",
          })}
        </Box>
        <IconButton
          variant="unstyled"
          aria-label={t("event.calendar.nextMonth", "Next month")}
          className="tabbedFocus"
          icon={<ChevronRightIcon />}
          onClick={navigation.toNext}
          color="cm.accentLight"
          fontSize="2xl"
          _hover={{
            bg: "transparent",
            color: "cm.accentDark",
          }}
          _active={{
            color: "cm.accentDark",
          }}
        />
      </Flex>

      <Table w="100%" maxW="300px" variant="unstyled" mx="auto">
        <Thead>
          <Tr>
            {headers.weekdays.map(({ key, value }) => {
              return (
                <Th key={key} px="1" textAlign="center">
                  <chakra.span textStyle="calendar" fontWeight="bold">
                    {value.toLocaleDateString(i18n?.language ?? "de", {
                      weekday: "short",
                    })}
                  </chakra.span>
                </Th>
              );
            })}
          </Tr>
        </Thead>
        <Tbody>
          {body.value.map(({ key, value: days }) => {
            return (
              <Tr key={key}>
                {days.map(({ key, value, isCurrentDate }) => {
                  if (value < today)
                    return (
                      <Td
                        pt="0"
                        px="1"
                        pb="2"
                        key={key}
                        color="#999"
                        textStyle="calendar"
                        textAlign="center"
                      >
                        <Box
                          w="30px"
                          h="30px"
                          border="1px solid"
                          lineHeight="30px"
                          borderColor="transparent"
                          borderRadius="20"
                          textStyle="calendar"
                          textAlign="center"
                          mx="auto"
                        >
                          {value.toLocaleDateString(i18n?.language ?? "de", {
                            day: "numeric",
                          })}
                        </Box>
                      </Td>
                    );
                  return (
                    <Td
                      key={key}
                      textStyle="calendar"
                      textAlign="center"
                      pt="0"
                      px="1"
                      pb="2"
                    >
                      <Button
                        variant="unstyled"
                        w="30px"
                        h="30px"
                        minW="30px"
                        mx="auto"
                        border="1px solid"
                        fontSize={{
                          base: "13px",
                          md: "17px",
                        }}
                        lineHeight="24px"
                        borderColor={
                          value.valueOf() === defaultDate?.valueOf()
                            ? "cm.accentLight"
                            : value.valueOf() === today?.valueOf()
                            ? "cm.accentDark"
                            : "transparent"
                        }
                        borderRadius="20"
                        fontWeight="normal"
                        transition="all 0.3s"
                        className="tabbedFocus"
                        _hover={{
                          bg: "transparent",
                          color: "cm.text",
                          borderColor: "cm.accentLight",
                        }}
                        _active={{
                          bg: "cm.accentLight",
                          color: "white",
                          borderColor: "cm.accenLight",
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          event.preventDefault();
                          
                          onDateSelect?.(value);
                        }}
                        aria-label={t(
                          "event.calendar.chooseDay",
                          "Select day {{dayAndMonth}}",
                          {
                            dayAndMonth: `${value.toLocaleDateString(
                              i18n?.language ?? "de",
                              {
                                day: "numeric",
                                year: "numeric",
                              }
                            )}`,
                          }
                        )}
                      >
                        {value.toLocaleDateString(i18n?.language ?? "de", {
                          day: "numeric",
                        })}
                      </Button>
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
};
