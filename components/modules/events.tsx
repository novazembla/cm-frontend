import { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { ListedEvent, LoadingIcon, ErrorMessage } from "~/components/ui";
import { Footer, MainContent } from "~/components/app";
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
} from "@chakra-ui/react";
import { FieldCheckboxGroup, FieldRadioGroup } from "~/components/forms";
import { useAppTranslations } from "~/hooks";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { boolean, object, mixed, number } from "yup";

import { useSettingsContext } from "~/provider";
import { getMultilangSortedList } from "~/utils";
import { useRouter } from "next/router";

// @ts-ignore
//import VirtualScroller from "virtual-scroller/react";
// https://bvaughn.github.io/react-virtualized/#/components/Masonry
// TODO use react-virtualized

const ONE_DAY = 1000 * 60 * 60 * 24;

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

export const ModuleComponentEvents = ({ ...props }) => {
  const router = useRouter();

  const [currentQueryState, setCurrentQueryState] = useState<any>({
    where: initialQueryState.where,
    orderBy: initialQueryState.orderBy,
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [extendedValidationSchema, setExtendedValidationSchema] =
    useState(EventsFilterSchema);

  const settings = useSettingsContext();

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

  const {
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const showLoadMore =
    data?.events?.totalCount >
      initialQueryState?.pageSize +
        initialQueryState?.pageSize * currentPageIndex &&
    data?.events?.events?.length !== data?.events?.totalCount;

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
    if (router.query) {
      const tois: string[] = router?.query?.tet
        ? Array.isArray(router.query.tet)
          ? router.query.tet
          : router.query.tet.split(",")
        : [];

      reset({
        // TODO: date filter s: router?.query?.s ?? "",
        // cluster: router?.query?.cluster === "1",
        eventDateRange: router?.query?.eventDateRange ?? "all",
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
    //if (urlParams.get("s")) aDI.push(0);
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
      console.log("process", allVars?.eventDateRange);

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

    let newQueryState = {
      ...currentQueryState,
    };

    if (where?.length) {
      newQueryState = {
        ...newQueryState,
        where: {
          AND: where,
        },
      };
    } else {
      newQueryState = {
        ...newQueryState,
        where: {},
      };
    }

    if (JSON.stringify(currentQueryState) !== JSON.stringify(newQueryState)) {
      console.log("change of choice");

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
          // TODO: custom date
          tet: [],
        }
      );

      const queryString = Object.keys(query)
        .reduce((acc: any, key: string) => {
          if (key === "date" && query[key])
            return [...acc, `date=${query[key]}`];
          // TODO: custom date

          if (Array.isArray(query[key]) && query[key]?.length)
            return [...acc, `${key}=${query[key].join(",")}`];

          return acc;
        }, [])
        .join("&");

      const queryStringEncoded = Object.keys(query)
        .reduce((acc: any, key: string) => {
          if (key === "date" && query[key])
            return [...acc, `date=${query[key]}`];
          // TODO: custom date

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

  return (
    <MainContent layerStyle="pageBg">
      <Grid
        w="100%"
        templateRows="1fr auto"
        templateColumns="100%"
        minH="100%"
        className="aaa"
      >
        <Box layerStyle="page" className="bbb">
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
                    <AccordionButton>
                      <Box
                        flex="1"
                        textAlign="left"
                        textStyle="headline"
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
                        defaultValue="all"
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
                        <Accordion allowToggle pt="4">
                          <AccordionItem>
                            <AccordionButton>
                              <Box
                                flex="1"
                                pl="8"
                                textAlign="left"
                                textStyle="larger"
                              >
                                {t(
                                  "events.filter.title.selectDay",
                                  "Select a date"
                                )}
                              </Box>
                              <AccordionIcon
                                color="cm.accentLight"
                                fontSize="2xl"
                              />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                              Lorem ipsum dolor sit amet, consectetur adipiscing
                              elit, sed do eiusmod tempor incididunt ut labore
                              et dolore magna aliqua. Ut enim ad minim veniam,
                              quis nostrud exercitation ullamco laboris nisi ut
                              aliquip ex ea commodo consequat.
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                  {activeTermsET?.length > 0 && (
                    <AccordionItem>
                      <h2>
                        <AccordionButton>
                          <Box
                            flex="1"
                            textAlign="left"
                            textStyle="headline"
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
          >
            {(!data || loading) && <LoadingIcon my="0" />}
            {!loading && !error && <Box>{resultText}</Box>}
            {error && <ErrorMessage type="dataLoad" />}
          </Flex>
          <Box w="100%">
            {data?.events?.events?.length && (
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

            {showLoadMore && !loading && !error && (
              <Box textAlign="center" mt="2em">
                <Button
                  onClick={() => {
                    const nextPageIndex = currentPageIndex + 1;
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
