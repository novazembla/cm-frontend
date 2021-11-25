import { useState, useEffect, useRef, useCallback } from "react";
import { gql, useQuery } from "@apollo/client";

import { ListedEvent } from "~/components/ui/ListedEvent";
import { LoadingIcon } from "~/components/ui/LoadingIcon";
import { ErrorMessage } from "~/components/ui/ErrorMessage";

import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import {
  Box,
  chakra,
  Grid,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Table,
  Th,
  Td,
  Tr,
  Tbody,
  Thead,
  Stack,
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { FieldRadioGroup } from "~/components/forms/FieldRadioGroup";
import { FieldCheckboxGroup } from "~/components/forms/FieldCheckboxGroup";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { boolean, object, mixed, number } from "yup";

import {
  useSettingsContext,
  useMapContext,
  useConfigContext,
} from "~/provider";
import { getMultilangSortedList, getSeoAppTitle } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useRouter } from "next/router";
import useCalendar from "@veccu/react-calendar";

const ONE_DAY = 1000 * 60 * 60 * 24;
const LOOK_DAYS_AHEAD = 100; // how many days should the calendar look ahead.

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
  where: {
    dates: {
      some: {
        date: {
          lt: new Date(
            new Date().setHours(0, 0, 0, 0) + ONE_DAY * LOOK_DAYS_AHEAD
          ),
        },
      },
    },
  },
  orderBy: [
    {
      firstEventDate: "asc",
    },
  ],
  pageSize: 50,
  pageIndex: 0,
};

export const EventsFilterSchema = object().shape({});

export const ModuleComponentEvents = ({ ...props }) => {
  const router = useRouter();
  const cultureMap = useMapContext();
  const resultRef = useRef<HTMLDivElement>(null);
  const config = useConfigContext();

  const [currentQueryState, setCurrentQueryState] = useState<any>({
    where: initialQueryState.where,
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

  useEffect(() => {
    if (settings?.taxonomies?.eventType?.terms) {
      const keys = settings?.taxonomies?.eventType?.terms?.reduce(
        (acc: any, t: any) => {
          if (t._count?.events > 0) return [...acc, `eventType_${t.id}`];
          return acc;
        },
        []
      );

      setExtendedValidationSchema(
        EventsFilterSchema.concat(
          object().shape({
            eventType: mixed().when(keys, {
              is: (...args: any[]) => {
                return !!args.find((a) => a);
              },
              then: boolean(),
              otherwise: number()
                .typeError("validation.array.minOneItem")
                .required(),
            }),
          })
        )
      );
    }
  }, [settings]);

  const { t, i18n, getMultilangValue } = useAppTranslations();

  const { data, loading, error, fetchMore, refetch } = useQuery(eventsQuery, {
    notifyOnNetworkStatusChange: true,
    variables: {
      ...initialQueryState,
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
        if (terms?.length) {
          resetVars = {
            ...resetVars,
            customDate: null,
            eventDateRange: "all",
            ...terms.reduce(
              (acc: any, t: any) => ({
                ...acc,
                [`eventType_${t.id}`]: false,
              }),
              {}
            ),
          };
        }
        setActiveTermsET(terms);
      }

      reset(resetVars);
    }
  }, [settings?.taxonomies, reset]);

  useEffect(() => {
    let customDate = null;
    try {
      if (router?.query?.customDate)
        customDate = new Date(
          new Date(router?.query?.customDate as string).setHours(0, 0, 0, 0)
        );

      if (customDate && router?.query?.date === "ownDate") {
        setCustomDate(customDate);
        navigation.setDate(customDate);
      }
    } catch (err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (router.query) {
      const tois: string[] = router?.query?.tet
        ? Array.isArray(router.query.tet)
          ? router.query.tet
          : router.query.tet.split(",")
        : [];

      let customDate = null;
      try {
        if (router?.query?.customDate)
          customDate = new Date(
            new Date(router?.query?.customDate as string).setHours(0, 0, 0, 0)
          );

        if (customDate) {
          setCustomDate(customDate);
          // calendarNavigationSetDate(customDate);
        }
      } catch (err) {}

      reset({
        // TODO: date filter s: router?.query?.s ?? "",
        // cluster: router?.query?.cluster === "1",
        customDate,
        eventDateRange: router?.query?.date ?? "all",
        ...activeTermsET.reduce(
          (acc: any, t: any) => ({
            ...acc,
            [`eventType_${t.id}`]: tois.includes(t.id.toString()),
          }),
          {}
        ),
      });
    }
  }, [router.query, reset, activeTermsET]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const aDI = [];
    if (urlParams.get("date") && urlParams.get("date") !== "all") aDI.push(0);
    if (urlParams.get("tet")) aDI.push(1);

    setAccordionDefaultIndex(aDI);
  }, []);

  const watchVariables = JSON.stringify(watch());
  useEffect(() => {
    const allVars = watch();

    const terms = Object.keys(allVars).reduce((acc: any, key: any) => {
      if (key.indexOf("eventType_") > -1) {
        if (allVars[key]) {
          return [...acc, parseInt(key.split("_")[1])];
        }
      }
      return acc;
    }, []);

    const where: any = [];
    if (terms?.length) {
      where.push({
        terms: {
          some: {
            id: {
              in: terms,
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

    let newQueryState = {
      ...currentQueryState,
    };

    where.push({
      dates: {
        some: {
          date: {
            lt: new Date(
              new Date().setHours(0, 0, 0, 0) + ONE_DAY * LOOK_DAYS_AHEAD
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
    // } else {
    //   newQueryState = {
    //     ...newQueryState,
    //     where: {},
    //   };
    }

    if (JSON.stringify(currentQueryState) !== JSON.stringify(newQueryState)) {
      refetch({
        ...newQueryState,
        pageIndex: 0,
        pageSize: initialQueryState.pageSize,
      });

      const baseUrl = [
        location.protocol,
        "//",
        location.host,
        location.pathname,
      ].join("");

      const query = Object.keys(allVars).reduce(
        (acc: any, key: any) => {
          if (key.indexOf("eventType_") > -1) {
            if (allVars[key]) {
              acc.tet.push(parseInt(key.split("_")[1]));
            }
          }

          return acc;
        },
        {
          date: allVars?.eventDateRange ?? "all",
          customDate: allVars?.customDate
            ? formatDate(allVars?.customDate)
            : null,
          tet: [],
        }
      );

      const queryString = Object.keys(query)
        .reduce((acc: any, key: string) => {
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

      const as = window.history?.state?.as
        ? window.history?.state?.as.split("?")[0]
        : i18n.language === "en"
        ? "/events/"
        : "/veranstaltungen/";

      window.history.replaceState(
        {
          ...window.history.state,
          url: `${as}?${queryStringEncoded}`,
          as: `${as}?${queryString}`,
        },
        "",
        `${baseUrl}?${queryString}`
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
    router,
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
  return (
    <MainContent layerStyle="pageBg">
      <NextHeadSeo
        canonical={`${config.baseUrl}${
          i18n.language === "en" ? "/en/events" : "/veranstaltungen"
        }`}
        title={`${t("locations.title", "Map")} - ${getSeoAppTitle(t)}`}
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
        <Box layerStyle="page">
          <Box layerStyle="headingPullOut" mb="3">
            <chakra.h1 className="highlight" color="cm.text" fontWeight="bold">
              {t("page.title", "Events")}
            </chakra.h1>
          </Box>
          <FormProvider {...formMethods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              {accordionDefaultIndex && (
                <Accordion
                  allowToggle
                  allowMultiple
                  my="10"
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
                        type="checkbox"
                        defaultValue={(router?.query?.date as string) ?? "all"}
                        options={[
                          {
                            label: t("events.filter.eventDateRange.all", "All"),
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
                  {activeTermsET?.length > 0 && (
                    <AccordionItem>
                      <h2>
                        <AccordionButton className="tabbedFocus">
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
                      </h2>
                      <AccordionPanel pb={4}>
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
            </form>
          </FormProvider>
          <Flex
            textStyle="larger"
            mt="1em"
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
        <Footer />
      </Grid>
    </MainContent>
  );
};
