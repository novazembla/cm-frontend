import { gql, useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";

import { ErrorMessage } from "~/components/ui/ErrorMessage";
import { ListedEvent } from "~/components/ui/ListedEvent";
import { LoadingIcon } from "~/components/ui/LoadingIcon";

import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  chakra,
  Flex,
  Grid,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Footer } from "~/components/app/Footer";
import { MainContent } from "~/components/app/MainContent";
import { FieldCheckboxGroup } from "~/components/forms/FieldCheckboxGroup";
import { FieldRadioGroup } from "~/components/forms/FieldRadioGroup";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { object } from "yup";

import useCalendar from "@veccu/react-calendar";
import NextHeadSeo from "next-head-seo";
import {
  useConfigContext,
  useMapContext,
  useSettingsContext,
} from "~/provider";
import {
  getMetaDescriptionContent,
  getMultilangSortedList,
  getSeoAppTitle,
} from "~/utils";
import FieldInput from "../forms/FieldInput";
import { PageTitle } from "../ui/PageTitle";

const ONE_DAY = 1000 * 60 * 60 * 24;

const padTo2Digits = (num: number) => {
  return num.toString().padStart(2, "0");
};

const formatDate = (date: Date) => {
  return [
    date.getFullYear(),
    padTo2Digits(date.getMonth() + 1),
    padTo2Digits(date.getDate()),
  ].join("-");
};

const eventsQuery = gql`
  query events($where: JSON, $orderBy: JSON, $pageIndex: Int, $pageSize: Int) {
    events(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalCount
      events {
        id
        title
        slug
        firstEventDate
        lastEventDate
        address
        terms {
          id
          taxonomyId
          name
        }
        dates {
          date
          begin
          end
        }
      }
    }
  }
`;

const initialQueryState = {
  where: {},
  orderBy: [
    {
      firstEventDate: "asc",
    },
  ],
  pageSize: 50,
  pageIndex: 0,
};

export const EventsFilterSchema = object().shape({});

export const ModuleComponentEvents = ({ filter }: { filter?: string }) => {
  const cultureMap = useMapContext();
  const resultRef = useRef<HTMLDivElement>(null);
  const config = useConfigContext();

  const [isFiltered, setIsFiltered] = useState(false);
  const [currentQueryState, setCurrentQueryState] = useState<any>({
    where: {
      ...initialQueryState.where,
      dates: {
        some: {
          date: {
            lt: new Date(
              new Date().setHours(0, 0, 0, 0) +
                ONE_DAY * config.eventLookAheadDays
            ),
          },
        },
      },
    },
    orderBy: initialQueryState.orderBy,
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [extendedValidationSchema, setExtendedValidationSchema] =
    useState(EventsFilterSchema);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  const settings = useSettingsContext();

  const { headers, body, cursorDate, navigation } = useCalendar({
    defaultWeekStart: 1,
    defaultDate: customDate ?? undefined,
  });

  useEffect(() => {
    if (cultureMap) cultureMap.showCurrentView();
  }, [cultureMap]);

  const { t, i18n, getMultilangValue } = useAppTranslations();

  const { data, loading, error, fetchMore, refetch } = useQuery(eventsQuery, {
    notifyOnNetworkStatusChange: true,
    variables: {
      ...initialQueryState,
      where: {
        ...initialQueryState.where,
        dates: {
          some: {
            date: {
              lt: new Date(
                new Date().setHours(0, 0, 0, 0) +
                  ONE_DAY * config.eventLookAheadDays
              ),
            },
          },
        },
      },
      orderBy: [
        {
          firstEventDate: "asc",
        },
        {
          [`title_${i18n.language}`]: "asc",
        },
      ],
    },
  });

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(extendedValidationSchema),
  });

  const { handleSubmit, reset, getValues, setValue, watch } = formMethods;

  const onSubmit = async () => {};

  const [activeTermsET, setActiveTermsET] = useState([]);
  const [accordionDefaultIndex, setAccordionDefaultIndex] = useState<
    number[] | null
  >(null);

  useEffect(() => {
    let resetVars = {};
    if (settings?.taxonomies) {
      if (settings?.taxonomies?.eventType?.terms) {
        const terms = settings?.taxonomies?.eventType?.terms?.reduce(
          (acc: any, t: any) => {
            if (t._count?.events > 0) return [...acc, t];

            return acc;
          },
          []
        );
        resetVars = {
          ...resetVars,
          customDate: null,
          eventDateRange: "all",
          eventType: [],
        };
        setActiveTermsET(terms);
      }

      reset(resetVars);
    }
  }, [settings?.taxonomies, reset]);

  useEffect(() => {
    let customDate = null;
    try {
      const urlParams = new URLSearchParams(filter);

      if (urlParams.get("customDate"))
        customDate = new Date(
          new Date(urlParams.get("customDate") as string).setHours(0, 0, 0, 0)
        );

      if (customDate && urlParams.get("date") === "ownDate") {
        setCustomDate(customDate);
        navigation.setDate(customDate);
      }
    } catch (err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filter) {
      const urlParams = new URLSearchParams(filter);

      const tets: string[] = urlParams.get("tet")
        ? urlParams.get("tet")?.split(",") ?? []
        : [];

      let customDate = null;
      try {
        if (urlParams.get("customDate"))
          customDate = new Date(
            new Date(urlParams.get("customDate") as string).setHours(0, 0, 0, 0)
          );

        if (customDate) {
          setCustomDate(customDate);
          // calendarNavigationSetDate(customDate);
        }
      } catch (err) {}

      reset({
        s: urlParams.get("s") ?? "",
        customDate,
        eventDateRange: urlParams.get("date") ?? "all",
        eventType: tets.map((id) => id.toString()),
      });
    }
  }, [filter, reset, activeTermsET]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(filter);
    const aDI = [];
    if (urlParams.get("date") && urlParams.get("date") !== "all") aDI.push(0);
    if (urlParams.get("s")) aDI.push(1);
    if (urlParams.get("tet")) aDI.push(2);

    setAccordionDefaultIndex(aDI);
    setIsFiltered(aDI.length > 0);
  }, [filter]);

  const watchVariables = JSON.stringify(watch());
  useEffect(() => {
    const allVars = watch();

    const where: any = [];
    if ((allVars.eventType ?? [])?.length) {
      where.push({
        terms: {
          some: {
            id: {
              in: allVars.eventType.map((id: string) => parseInt(id)),
            },
          },
        },
      });
    }

    if (allVars?.eventDateRange && allVars?.eventDateRange !== "all") {
      if (allVars?.eventDateRange === "ownDate") {
        if (allVars?.customDate) {
          where.push({
            dates: {
              some: {
                AND: [
                  {
                    date: {
                      gte: allVars?.customDate.toISOString(),
                    },
                  },
                  {
                    date: {
                      lt: new Date(
                        allVars?.customDate.getTime() + ONE_DAY
                      ).toISOString(),
                    },
                  },
                ],
              },
            },
          });
        }
      } else {
        let begin = new Date(new Date().setHours(0, 0, 0, 0));
        let end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY);

        switch (allVars?.eventDateRange) {
          case "tomorrow":
            begin = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY);
            end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 2);
            break;

          case "weekend":
            switch (begin.getDay()) {
              case 1:
                begin = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 5);
                end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 7);
                break;

              case 2:
                begin = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 4);
                end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 6);
                break;

              case 3:
                begin = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 3);
                end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 5);
                break;

              case 4:
                begin = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 2);
                end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 4);
                break;

              case 5:
                begin = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY);
                end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 3);
                break;

              case 6:
                begin = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 7);
                end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 9);
                break;

              case 0:
                begin = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 6);
                end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 8);
                break;
            }
            break;

          case "7days":
            begin = new Date(new Date().setHours(0, 0, 0, 0));
            end = new Date(new Date().setHours(0, 0, 0, 0) + ONE_DAY * 7);
            break;
        }
        where.push({
          dates: {
            some: {
              AND: [
                {
                  date: {
                    gte: begin.toISOString(),
                  },
                },
                {
                  date: {
                    lt: end.toISOString(),
                  },
                },
              ],
            },
          },
        });
      }
    }

    if (allVars?.s?.trim() && allVars.s.trim().length > 2) {
      where.push({
        fullText: {
          contains: allVars.s,
          mode: "insensitive",
        },
      });
    }

    let newQueryState = {
      ...currentQueryState,
    };

    where.push({
      dates: {
        some: {
          date: {
            lt: new Date(
              new Date().setHours(0, 0, 0, 0) +
                ONE_DAY * config.eventLookAheadDays
            ),
          },
        },
      },
    });
    if (where?.length) {
      newQueryState = {
        ...newQueryState,
        where: {
          AND: where,
        },
      };
      //  } else {
      //   newQueryState = {
      //     ...newQueryState,
      //     where: {},
      //   };
    }

    if (where?.length > 1 || allVars?.eventDateRange !== "all") {
      setIsFiltered(true);
    } else {
      setIsFiltered(false);
    }

    if (JSON.stringify(currentQueryState) !== JSON.stringify(newQueryState)) {
      refetch({
        ...newQueryState,
        pageIndex: 0,
        pageSize: initialQueryState.pageSize,
      });

      const query: any = {
        s: allVars?.s?.trim() ?? "",
        date: allVars?.eventDateRange ?? "all",
        customDate: allVars?.customDate
          ? formatDate(allVars?.customDate)
          : null,
        tet: allVars.eventType ?? [],
      };

      const queryString = Object.keys(query)
        .reduce((acc: any, key: string) => {
          if (key === "s" && query[key]?.length)
            return [...acc, `s=${query[key]}`];

          if (key === "date" && query[key])
            return [...acc, `date=${query[key]}`];

          if (query["date"] === "ownDate" && key === "customDate" && query[key])
            return [...acc, `customDate=${query[key]}`];

          if (Array.isArray(query[key]) && query[key]?.length)
            return [...acc, `${key}=${query[key].join(",")}`];

          return acc;
        }, [])
        .join("&");

      const queryStringEncoded = Object.keys(query)
        .reduce((acc: any, key: string) => {
          if (key === "s" && query[key]?.length)
            return [...acc, `s=${encodeURIComponent(query[key])}`];

          if (key === "date" && query[key])
            return [...acc, `date=${query[key]}`];

          if (query["date"] === "ownDate" && key === "customDate" && query[key])
            return [...acc, `customDate=${query[key]}`];

          if (Array.isArray(query[key]) && query[key]?.length)
            return [
              ...acc,
              `${key}=${encodeURIComponent(query[key].join(","))}`,
            ];

          return acc;
        }, [])
        .join("&");

      let pathAs = i18n.language === "en" ? "/en/events" : "/veranstaltungen";

      if (window.history?.state?.as) {
        const lastElement = window.history?.state?.as.split("/").pop();

        if (lastElement !== "events" && lastElement !== "veranstaltungen") {
          pathAs = window.history?.state?.as.split("/").slice(0, -1).join("/");
        }
      }

      const baseUrl = [location.protocol, "//", location.host, pathAs].join("");

      window.history.replaceState(
        {
          ...window.history.state,
          url: `${pathAs}${queryStringEncoded ? `/${queryStringEncoded}` : ""}`,
          as: `${pathAs}${queryString ? `/${queryString}` : ""}`,
        },
        "",
        `${baseUrl}${queryString ? `/${queryString}` : ""}`
      );

      setCurrentQueryState(newQueryState);
      setCurrentPageIndex(0);
    }
  }, [
    watchVariables,
    watch,
    refetch,
    currentQueryState,
    i18n?.language,
    filter,
    config.eventLookAheadDays,
  ]);

  let resultText = t("events.totalCount", "{{count}} event found", {
    count: data?.events?.totalCount ?? 0,
  });
  if (data?.events?.totalCount == 1)
    resultText = t("events.totalCountPlural", "{{count}} events found", {
      count: data?.events?.totalCount,
    });

  useEffect(() => {
    if (
      !loading &&
      data?.events?.totalCount !== "undefined" &&
      currentPageIndex === 0
    ) {
      resultRef?.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [loading, data?.events?.totalCount, currentPageIndex]);

  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const urlParams = new URLSearchParams(filter);

  return (
    <MainContent>
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en" ? "/en/events" : "/veranstaltungen"
        }`}
        title={`${t("locations.title", "Map")} - ${getSeoAppTitle(t)}`}
        maxDescriptionCharacters={300}
        description={getMetaDescriptionContent(
          getMultilangValue(settings?.defaultMetaDesc)
        )}
      />
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH={{
          base: "calc(100vh - 60px)",
          xl: "calc(100vh - 80px)",
        }}
      >
        <Box layerStyle="pageBg">
          <Box layerStyle="page">
            <PageTitle h1 type="high" title={t("page.title", "Events")} />

            <FormProvider {...formMethods}>
              <form noValidate onSubmit={handleSubmit(onSubmit)}>
                {accordionDefaultIndex && (
                  <Accordion
                    allowToggle
                    allowMultiple
                    defaultIndex={accordionDefaultIndex}
                  >
                    <AccordionItem>
                      <AccordionButton className="tabbedFocus">
                        <Box
                          flex="1"
                          textAlign="left"
                          textStyle="larger"
                          fontWeight="bold"
                        >
                          {t("events.filter.title.dateRange", "Date (range)")}
                        </Box>
                        <AccordionIcon color="cm.accentLight" fontSize="2xl" />
                      </AccordionButton>
                      <AccordionPanel pb={4} pt={2}>
                        <FieldRadioGroup
                          id="eventDateRange"
                          name="eventDateRange"
                          isRequired={false}
                          label={t(
                            "events.filter.title.eventDateRange",
                            "Date range"
                          )}
                          defaultValue={
                            (urlParams.get("date") as string) ?? "all"
                          }
                          options={[
                            {
                              label: t(
                                "events.filter.eventDateRange.all",
                                "All"
                              ),
                              id: "all",
                            },
                            {
                              label: t(
                                "events.filter.eventDateRange.today",
                                "Today"
                              ),
                              id: "today",
                            },
                            {
                              label: t(
                                "events.filter.eventDateRange.tomorrow",
                                "Tomorrow"
                              ),
                              id: "tomorrow",
                            },
                            {
                              label: t(
                                "events.filter.eventDateRange.weekend",
                                "Upcoming weekend"
                              ),
                              id: "weekend",
                            },
                            {
                              label: t(
                                "events.filter.eventDateRange.next7days",
                                "Next 7 days"
                              ),
                              id: "7days",
                            },
                            {
                              label: t(
                                "events.filter.eventDateRange.chooseDate",
                                "Select own date"
                              ),
                              id: "ownDate",
                            },
                          ]}
                        />
                        {getValues("eventDateRange") === "ownDate" && (
                          <>
                            <Flex
                              w="100%"
                              justifyContent="space-between"
                              maxW="300px"
                              mt="1em"
                              mx="auto"
                              alignItems="center"
                              mb=""
                            >
                              <IconButton
                                aria-label={t(
                                  "event.calendar.previousMonth",
                                  "Previous month"
                                )}
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
                                {cursorDate.toLocaleDateString(i18n.language, {
                                  month: "long",
                                  year: "numeric",
                                })}
                              </Box>
                              <IconButton
                                variant="unstyled"
                                aria-label={t(
                                  "event.calendar.nextMonth",
                                  "Next month"
                                )}
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

                            <Table
                              w="100%"
                              maxW="300px"
                              variant="unstyled"
                              mx="auto"
                              mb="1em"
                            >
                              <Thead>
                                <Tr>
                                  {headers.weekDays.map(({ key, value }) => {
                                    return (
                                      <Th key={key} px="1" textAlign="center">
                                        <chakra.span
                                          textStyle="calendar"
                                          fontWeight="bold"
                                        >
                                          {value.toLocaleDateString(
                                            i18n.language,
                                            { weekday: "short" }
                                          )}
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
                                      {days.map(
                                        ({ key, value, isCurrentDate }) => {
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
                                                  {value.toLocaleDateString(
                                                    i18n.language,
                                                    { day: "numeric" }
                                                  )}
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
                                                  value.valueOf() ===
                                                  customDate?.valueOf()
                                                    ? "cm.accentLight"
                                                    : value.valueOf() ===
                                                      today.valueOf()
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
                                                onClick={() => {
                                                  setValue(
                                                    "customDate",
                                                    new Date(
                                                      value.setHours(0, 0, 0, 0)
                                                    )
                                                  );
                                                  setCustomDate(
                                                    new Date(
                                                      value.setHours(0, 0, 0, 0)
                                                    )
                                                  );
                                                }}
                                                aria-label={t(
                                                  "event.calendar.chooseDay",
                                                  "Select day {{dayAndMonth}}",
                                                  {
                                                    dayAndMonth: `${value.toLocaleDateString(
                                                      i18n.language,
                                                      {
                                                        day: "numeric",
                                                        year: "numeric",
                                                      }
                                                    )}`,
                                                  }
                                                )}
                                              >
                                                {value.toLocaleDateString(
                                                  i18n.language,
                                                  { day: "numeric" }
                                                )}
                                              </Button>
                                            </Td>
                                          );
                                        }
                                      )}
                                    </Tr>
                                  );
                                })}
                              </Tbody>
                            </Table>
                          </>
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                    <AccordionItem>
                      <AccordionButton pt="0" className="tabbedFocus">
                        <Box
                          flex="1"
                          textAlign="left"
                          textStyle="larger"
                          fontWeight="bold"
                        >
                          {t(
                            "locations.filter.title.keyword",
                            "Search by keyword"
                          )}
                        </Box>
                        <AccordionIcon color="cm.accentLight" fontSize="2xl" />
                      </AccordionButton>

                      <AccordionPanel pt={2} pb={4}>
                        <FieldInput
                          type="text"
                          name="s"
                          id="s"
                          label={t("quicksearch.placeholder", "Keyword")}
                          settings={{
                            hideLabel: true,
                            placeholder: t(
                              "quicksearch.placeholder",
                              "Keyword"
                            ),
                          }}
                        />
                      </AccordionPanel>
                    </AccordionItem>
                    {activeTermsET?.length > 0 && (
                      <AccordionItem>
                        <AccordionButton pt={0} className="tabbedFocus">
                          <Box
                            flex="1"
                            textAlign="left"
                            textStyle="larger"
                            fontWeight="bold"
                          >
                            {t(
                              "events.filter.title.eventType",
                              "Type of event"
                            )}
                          </Box>
                          <AccordionIcon
                            color="cm.accentLight"
                            fontSize="2xl"
                          />
                        </AccordionButton>

                        <AccordionPanel pt={2} pb={4}>
                          <FieldCheckboxGroup
                            id="eventType"
                            name="eventType"
                            isRequired={false}
                            label={t(
                              "events.filter.title.eventType",
                              "Type of event"
                            )}
                            type="checkbox"
                            options={getMultilangSortedList(
                              activeTermsET.map((term: any) => ({
                                label: term.name,
                                id: term.id,
                              })),
                              "label",
                              getMultilangValue
                            )}
                          />
                        </AccordionPanel>
                      </AccordionItem>
                    )}
                  </Accordion>
                )}

                <Flex pt={2} justifyContent="flex-end" w="100%">
                  <Button
                    variant="ghost"
                    disabled={!isFiltered}
                    onClick={() => {
                      reset({
                        s: "",
                        customDate: null,
                        eventDateRange: "all",
                        eventType: [],
                      });
                    }}
                  >
                    {t("form.filter.reset", "Reset all filters")}
                  </Button>
                </Flex>
              </form>
            </FormProvider>
            <Box pt="1.5em">
              <Flex
                textStyle="larger"
                borderColor="cm.accentDark"
                borderTop="1px solid"
                borderBottom="1px solid"
                justifyContent={loading ? "center" : "flex-start"}
                h="50px"
                alignItems="center"
                ref={resultRef}
              >
                {(!data || loading) && <LoadingIcon my="0" />}
                {!loading && !error && <Box>{resultText}</Box>}
                {error && <ErrorMessage type="dataLoad" />}
              </Flex>
            </Box>
            <Box w="100%">
              {data?.events?.events?.length > 0 && (
                <Box size="md" mt="3" w="100%">
                  {data?.events?.events.map((event: any) => (
                    <ListedEvent key={`event-${event.id}`} event={event} />
                  ))}
                  {/* <VirtualScroller
                scrollableContainer={scrollContainerRef.current}
                items={data?.events?.events}
                itemComponent={Event}
              /> */}
                </Box>
              )}

              {data?.events?.totalCount > data?.events?.events?.length &&
                !loading &&
                !error && (
                  <Box textAlign="center" mt="2em">
                    <Button
                      onClick={() => {
                        const nextPageIndex = Math.floor(
                          data?.events?.events?.length /
                            initialQueryState?.pageSize
                        );
                        fetchMore({
                          variables: {
                            pageIndex: nextPageIndex,
                          },
                        });
                        setCurrentPageIndex(nextPageIndex);
                      }}
                      variant="ghost"
                    >
                      {t("events.loadMore", "Load more events")}
                    </Button>
                  </Box>
                )}

              {loading && currentPageIndex > 0 && <LoadingIcon />}
            </Box>
          </Box>
        </Box>
        <Box>
          <Footer />
        </Box>
      </Grid>
    </MainContent>
  );
};
