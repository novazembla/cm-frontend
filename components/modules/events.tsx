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
import { FieldCheckboxGroup } from "~/components/forms";
import { useAppTranslations } from "~/hooks";
import type * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { boolean, object, mixed, number } from "yup";

import { useSettingsContext } from "~/provider";
import { getMultilangSortedList } from "~/utils";

// @ts-ignore
//import VirtualScroller from "virtual-scroller/react";
// https://bvaughn.github.io/react-virtualized/#/components/Masonry
// TODO use react-virtualized

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
  const [currentQueryState, setCurrentQueryState] = useState<any>({
    where: initialQueryState.where,
    orderBy: initialQueryState.orderBy,
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasFormError, setHasFormError] = useState(false);
  const [isSchemaSet, setIsSchemaSet] = useState(false);
  const [extendedValidationSchema, setExtendedValidationSchema] =
    useState(EventsFilterSchema);

  const settings = useSettingsContext();

  useEffect(() => {
    if (settings?.taxonomies?.eventTypes?.terms && !isSchemaSet) {
      const keys = settings?.taxonomies?.eventTypes?.terms?.reduce(
        (acc: any, t: any) => {
          if (t._count?.events > 0) return [...acc, `eventType_${t.id}`];
          return acc;
        },
        []
      );

      setExtendedValidationSchema(
        EventsFilterSchema.concat(
          object().shape({
            [`eventType`]: mixed().when(keys, {
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
  }, [settings, isSchemaSet]);

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
    setError,
    watch,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  const showLoadMore =
    data?.events?.totalCount >
      initialQueryState?.pageSize +
        initialQueryState?.pageSize * currentPageIndex &&
    data?.events?.events?.length !== data?.events?.totalCount;

  const onSubmit = async (
    newData: yup.InferType<typeof extendedValidationSchema>
  ) => {
    setHasFormError(false);

    try {
    } catch (err) {
      setHasFormError(true);
    }
  };

  const activeTerms = settings?.taxonomies?.eventType?.terms?.reduce(
    (acc: any, t: any) => {
      if (t._count?.events > 0) return [...acc, t];

      return acc;
    },
    []
  );

  const watchVariables = JSON.stringify(watch());
  useEffect(() => {
    const allVars = watch();
    const terms = Object.keys(allVars).reduce((acc: any, key: any) => {
      if (key.indexOf("eventCategory_") > -1) {
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
      refetch({
        ...newQueryState,
        pageIndex: 0,
        pageSize: initialQueryState.pageSize,
      });
      setCurrentQueryState(newQueryState);
      setCurrentPageIndex(0);
    }
  }, [watchVariables, watch, refetch, currentQueryState]);

  let resultText = t("events.totalCount", "{{count}} event found", {
    count: data?.events?.totalCount ?? 0,
  });
  if (data?.events?.totalCount == 1)
    resultText = t("events.totalCountPlural", "{{count}} events found", {
      count: data?.events?.totalCount,
    });

  return (
    <MainContent layerStyle="pageBg" noMobileBottomPadding>
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
              <Accordion allowToggle allowMultiple my="10">
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
                  <AccordionPanel pb={4}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
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
                          elit, sed do eiusmod tempor incididunt ut labore et
                          dolore magna aliqua. Ut enim ad minim veniam, quis
                          nostrud exercitation ullamco laboris nisi ut aliquip
                          ex ea commodo consequat.
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </AccordionPanel>
                </AccordionItem>
                {activeTerms?.length > 0 && (
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
                            "events.filter.title.eventCategory",
                            "Type of event"
                          )}
                        </Box>
                        <AccordionIcon color="cm.accentLight" fontSize="2xl" />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <FieldCheckboxGroup
                        id="eventCategory"
                        name="eventCategory"
                        isRequired={false}
                        label={t(
                          "events.filter.title.eventCategory",
                          "Type of event"
                        )}
                        type="checkbox"
                        options={getMultilangSortedList(
                          activeTerms.map((term: any) => ({
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
            {loading && <LoadingIcon my="0" />}
            {!loading && !error && (
              <Box>
                {resultText}
              </Box>
            )}
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
