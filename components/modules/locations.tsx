import { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { LoadingIcon, ErrorMessage, CardLocation } from "~/components/ui";
import { useIsPresent } from "framer-motion";
import { Footer } from "~/components/app";
import {
  Box,
  Flex,
  chakra,
  Grid,
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

import { MainContent } from "~/components/app";
import { useSettingsContext } from "~/provider";
import { getMultilangSortedList } from "~/utils";
import { useRouter } from "next/router";

// @ts-ignore
//import VirtualScroller from "virtual-scroller/react";
// https://bvaughn.github.io/react-virtualized/#/components/Masonry
// TODO use react-virtualized

const locationsQuery = gql`
  query locations(
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    locations(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalCount
      locations {
        id
        title
        slug
        description
        primaryTerms {
          id
          taxonomyId
          name
        }
        terms {
          id
          taxonomyId
          name
        }
        heroImage {
          id
          status
          meta
          alt
          credits
        }
      }
    }
  }
`;

const initialQueryState = {
  where: {},
  orderBy: [
    {
      id: "asc",
    },
  ],
  pageSize: 50,
  pageIndex: 0,
};

export const LocationsFilterSchema = object().shape({});

export const ModuleComponentLocations = ({ ...props }) => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const isPresent = useIsPresent();

  const router = useRouter();

  const [currentQueryState, setCurrentQueryState] = useState<any>({
    where: initialQueryState.where,
    orderBy: [
      {
        [`title_${i18n.language}`]: "asc",
      },
    ],
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasFormError, setHasFormError] = useState(false);
  const [isSchemaSet, setIsSchemaSet] = useState(false);
  const [extendedValidationSchema, setExtendedValidationSchema] = useState(
    LocationsFilterSchema
  );

  const settings = useSettingsContext();

  useEffect(() => {
    if (settings?.taxonomies?.typeOfInstitutions?.terms && !isSchemaSet) {
      const keysToI = settings?.taxonomies?.typeOfInstitutions?.terms?.reduce(
        (acc: any, t: any) => {
          if (t._count?.locations > 0)
            return [...acc, `typeOfInstitution_${t.id}`];
          return acc;
        },
        []
      );

      const keysTA = settings?.taxonomies?.targetAudience?.terms?.reduce(
        (acc: any, t: any) => {
          if (t._count?.locations > 0)
            return [...acc, `targetAudience_${t.id}`];
          return acc;
        },
        []
      );

      const keysToO = settings?.taxonomies?.typeOfOrganisation?.terms?.reduce(
        (acc: any, t: any) => {
          if (t._count?.locations > 0)
            return [...acc, `typeOfOrganisation_${t.id}`];
          return acc;
        },
        []
      );

      setExtendedValidationSchema(
        LocationsFilterSchema.concat(
          object().shape({
            ...(keysToI?.length > 0
              ? {
                  typeOfInstitution: mixed().when(keysToI, {
                    is: (...args: any[]) => {
                      return !!args.find((a) => a);
                    },
                    then: boolean(),
                    otherwise: number()
                      .typeError("validation.array.minOneItem")
                      .required(),
                  }),
                }
              : {}),
            ...(keysTA?.length > 0
              ? {
                  targetAudience: mixed().when(keysTA, {
                    is: (...args: any[]) => {
                      return !!args.find((a) => a);
                    },
                    then: boolean(),
                    otherwise: number()
                      .typeError("validation.array.minOneItem")
                      .required(),
                  }),
                }
              : {}),
            ...(keysToO?.length > 0
              ? {
                  typeOfOrganisation: mixed().when(keysToO, {
                    is: (...args: any[]) => {
                      return !!args.find((a) => a);
                    },
                    then: boolean(),
                    otherwise: number()
                      .typeError("validation.array.minOneItem")
                      .required(),
                  }),
                }
              : {}),
          })
        )
      );
    }
  }, [settings, isSchemaSet]);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    locationsQuery,
    {
      notifyOnNetworkStatusChange: true,
      variables: {
        ...initialQueryState,
        orderBy: [
          {
            [`title_${i18n.language}`]: "asc",
          },
        ],
      },
    }
  );

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
    data?.locations?.totalCount >
      initialQueryState?.pageSize +
        initialQueryState?.pageSize * currentPageIndex &&
    data?.locations?.locations?.length !== data?.locations?.totalCount;

  const onSubmit = async (
    newData: yup.InferType<typeof extendedValidationSchema>
  ) => {
    setHasFormError(false);

    try {
    } catch (err) {
      setHasFormError(true);
    }
  };

  const [activeTermsToI, setActiveTermsToI] = useState([]);
  const [activeTermsToO, setActiveTermsToO] = useState([]);
  const [activeTermsTA, setActiveTermsTA] = useState([]);
  const [accordionDefaultIndex, setAccordionDefaultIndex] = useState<
    number[] | null
  >(null);

  useEffect(() => {
    if (!isPresent) return;

    let resetVars = {};
    if (settings?.taxonomies) {
      if (settings?.taxonomies?.typeOfInstitution?.terms) {
        const terms = settings?.taxonomies?.typeOfInstitution?.terms?.reduce(
          (acc: any, t: any) => {
            if (t._count?.locations > 0) return [...acc, t];

            return acc;
          },
          []
        );
        if (terms?.length) {
          resetVars = {
            ...resetVars,
            ...terms.reduce(
              (acc: any, t: any) => ({
                ...acc,
                [`typeOfInstitution_${t.id}`]: false,
              }),
              {}
            ),
          };
        }
        setActiveTermsToI(terms);
      }
      if (settings?.taxonomies?.typeOfOrganisation?.terms)
        setActiveTermsToO(
          settings?.taxonomies?.typeOfOrganisation?.terms?.reduce(
            (acc: any, t: any) => {
              if (t._count?.locations > 0) return [...acc, t];

              return acc;
            },
            []
          )
        );

      if (settings?.taxonomies?.targetAudience?.terms)
        setActiveTermsTA(
          settings?.taxonomies?.targetAudience?.terms?.reduce(
            (acc: any, t: any) => {
              if (t._count?.locations > 0) return [...acc, t];

              return acc;
            },
            []
          )
        );

      reset(resetVars);
    }
  }, [settings?.taxonomies, reset, isPresent]);

  useEffect(() => {
    if (!isPresent) return;

    if (router.query) {
      const tois: string[] = router?.query?.toi
        ? Array.isArray(router.query.toi)
          ? router.query.toi
          : router.query.toi.split(",")
        : [];

      const toos: string[] = router?.query?.too
        ? Array.isArray(router.query.too)
          ? router.query.too
          : router.query.too.split(",")
        : [];

      const tas: string[] = router?.query?.ta
        ? Array.isArray(router.query.ta)
          ? router.query.ta
          : router.query.ta.split(",")
        : [];

      reset({
        ...activeTermsToI.reduce(
          (acc: any, t: any) => ({
            ...acc,
            [`typeOfInstitution_${t.id}`]: tois.includes(t.id.toString()),
          }),
          {}
        ),
        ...activeTermsToO.reduce(
          (acc: any, t: any) => ({
            ...acc,
            [`typeOfOrganisation_${t.id}`]: toos.includes(t.id.toString()),
          }),
          {}
        ),
        ...activeTermsTA.reduce(
          (acc: any, t: any) => ({
            ...acc,
            [`targetAudience_${t.id}`]: tas.includes(t.id.toString()),
          }),
          {}
        ),
      });
    }
  }, [
    router.query,
    reset,
    activeTermsToI,
    activeTermsToO,
    activeTermsTA,
    isPresent,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const aDI = [];
    if (urlParams.get("s")) aDI.push(0);
    if (urlParams.get("toi")) aDI.push(1);
    if (urlParams.get("ta")) aDI.push(2);
    if (urlParams.get("too")) aDI.push(3);
    if (
      urlParams.get("and") === "1" ||
      !urlParams.get("cluster") ||
      urlParams.get("cluster") === "0"
    )
      aDI.push(4);

    setAccordionDefaultIndex(aDI);
  }, []);

  const watchVariables = JSON.stringify(watch());

  useEffect(() => {
    if (!isPresent) return;

    const allVars = watch();

    // TODO: observe and/or filter
    const terms = Object.keys(allVars).reduce((acc: any, key: any) => {
      if (
        key.indexOf("typeOfInstitution_") > -1 ||
        key.indexOf("typeOfOrganisation_") > -1 ||
        key.indexOf("targetAudience_") > -1
      ) {
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

      const baseUrl = [
        location.protocol,
        "//",
        location.host,
        location.pathname,
      ].join("");

      const query = Object.keys(allVars).reduce(
        (acc: any, key: any) => {
          if (key.indexOf("typeOfInstitution_") > -1) {
            if (allVars[key]) {
              acc.toi.push(parseInt(key.split("_")[1]));
            }
          }
          if (key.indexOf("typeOfOrganisation_") > -1) {
            if (allVars[key]) {
              acc.too.push(parseInt(key.split("_")[1]));
            }
          }
          if (key.indexOf("targetAudience_") > -1) {
            if (allVars[key]) {
              acc.ta.push(parseInt(key.split("_")[1]));
            }
          }
          return acc;
        },
        {
          s: "",
          and: false,
          cluster: true,
          toi: [],
          ta: [],
          too: [],
        }
      );

      const queryString = Object.keys(query)
        .reduce((acc: any, key: string) => {
          if (key === "s" && query[key]?.length)
            return [...acc, `s=${query[key]}`];

          if (key === "and" && query[key]) return [...acc, `and=1`];

          if (key === "cluster" && query[key]) return [...acc, `cluster=1`];

          if (Array.isArray(query[key]) && query[key]?.length)
            return [...acc, `${key}=${query[key].join(",")}`];

          return acc;
        }, [])
        .join("&");

      const queryStringEncoded = Object.keys(query)
        .reduce((acc: any, key: string) => {
          if (key === "s" && query[key]?.length)
            return [...acc, `s=${encodeURIComponent(query[key])}`];

          if (key === "and" && query[key]) return [...acc, `and=1`];

          if (key === "cluster" && query[key]) return [...acc, `cluster=1`];

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
        ? "/map/"
        : "/karte/";

      window.history.replaceState(
        {
          ...window.history.state,
          url: `${as}?${queryStringEncoded}`,
          as: `${as}?${queryString}`,
        },
        "",
        `${baseUrl}?${queryString}`
      );

      // router.replace(
      //   {
      //     pathname: router.pathname,
      //     query: {
      //       toi: Object.keys(allVars).reduce((acc: any, key: any) => {
      //         if (key.indexOf("typeOfInstitution_") > -1) {
      //           if (allVars[key]) {
      //             return [...acc, parseInt(key.split("_")[1])];
      //           }
      //         }
      //         return acc;
      //       }, []),
      //       ta: Object.keys(allVars).reduce((acc: any, key: any) => {
      //         if (key.indexOf("targetAudience_") > -1) {
      //           if (allVars[key]) {
      //             return [...acc, parseInt(key.split("_")[1])];
      //           }
      //         }
      //         return acc;
      //       }, []),
      //       too: Object.keys(allVars).reduce((acc: any, key: any) => {
      //         if (key.indexOf("typeOfOrganisation_") > -1) {
      //           if (allVars[key]) {
      //             return [...acc, parseInt(key.split("_")[1])];
      //           }
      //         }
      //         return acc;
      //       }, []),
      //     },
      //   },
      //   undefined,
      //   { shallow: true, scroll: false }
      // );
      setCurrentQueryState(newQueryState);
      setCurrentPageIndex(0);
    }
    // const terms = al
  }, [
    watchVariables,
    watch,
    refetch,
    currentQueryState,
    i18n?.language,
    router,
    isPresent,
  ]);

  console.log(accordionDefaultIndex);

  return (
    <MainContent layerStyle="blurredLightGray" noMobileBottomPadding>
      <Grid w="100%" templateRows="1fr auto" templateColumns="100%" minH="100%">
        <Box px="20px" pt="0.5em">
          <Box mb="3">
            <chakra.h1 className="highlight" color="cm.text" fontWeight="bold">
              {t("locations.title", "Map")}
            </chakra.h1>
          </Box>
          <Box
            bg="#fff"
            borderRadius="lg"
            overflow="hidden"
            p={{
              base: "20px",
              md: "35px",
            }}
          >
            <FormProvider {...formMethods}>
              <form noValidate onSubmit={handleSubmit(onSubmit)}>
                {accordionDefaultIndex && (
                  <Accordion
                    allowToggle
                    allowMultiple
                    mb="10"
                    defaultIndex={accordionDefaultIndex}
                  >
                    <AccordionItem>
                      <h2>
                        <AccordionButton pt="0">
                          <Box
                            flex="1"
                            textAlign="left"
                            textStyle="headline"
                            fontWeight="bold"
                          >
                            {t(
                              "locations.filter.title.keyword",
                              "Search by keyword"
                            )}
                          </Box>
                          <AccordionIcon
                            color="cm.accentLight"
                            fontSize="2xl"
                          />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>Keyword search</AccordionPanel>
                    </AccordionItem>
                    {activeTermsToI?.length > 0 && (
                      <AccordionItem>
                        <h2>
                          <AccordionButton pt="0">
                            <Box
                              flex="1"
                              textAlign="left"
                              textStyle="headline"
                              fontWeight="bold"
                            >
                              {t(
                                "locations.filter.title.typeOfInstitution",
                                "Type of location"
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
                            id="typeOfInstitution"
                            name="typeOfInstitution"
                            isRequired={false}
                            label={t(
                              "locations.filter.title.typeOfInstitution",
                              "Type of location"
                            )}
                            type="checkbox"
                            options={getMultilangSortedList(
                              activeTermsToI.map((term: any) => ({
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
                    {activeTermsTA?.length > 0 && (
                      <AccordionItem>
                        <h2>
                          <AccordionButton pt="0">
                            <Box
                              flex="1"
                              textAlign="left"
                              textStyle="headline"
                              fontWeight="bold"
                            >
                              {t(
                                "locations.filter.title.targetAudience",
                                "Target audience"
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
                            id="targetAudience"
                            name="targetAudience"
                            isRequired={false}
                            label={t(
                              "locations.filter.title.targetAudience",
                              "Targe audience"
                            )}
                            type="checkbox"
                            options={getMultilangSortedList(
                              activeTermsTA.map((term: any) => ({
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
                    {activeTermsToO?.length > 0 && (
                      <AccordionItem>
                        <h2>
                          <AccordionButton pt="0">
                            <Box
                              flex="1"
                              textAlign="left"
                              textStyle="headline"
                              fontWeight="bold"
                            >
                              {t(
                                "locations.filter.title.typeOfOrganisation",
                                "Type of organisation"
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
                            id="typeOfOrganisation"
                            name="typeOfOrganisation"
                            isRequired={false}
                            label={t(
                              "locations.filter.title.typeOfOrganisation",
                              "Type of location"
                            )}
                            type="checkbox"
                            options={getMultilangSortedList(
                              activeTermsToO.map((term: any) => ({
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
              {loading && <LoadingIcon my="0" />}
              {!loading && !error && (
                <Box>
                  {t("locations.totalCount", "{{count}} locations found", {
                    count: data?.locations?.totalCount,
                  })}
                </Box>
              )}
              {error && <ErrorMessage type="dataLoad" />}
            </Flex>
          </Box>

          <Box>
            {data?.locations?.locations?.length && (
              <Box size="md" mt="20px">
                {data?.locations?.locations.map((location: any) => (
                  <Box key={`location-${location.id}`} pb="20px">
                    <CardLocation location={location} />
                  </Box>
                ))}
                {/* <VirtualScroller
                scrollableContainer={scrollContainerRef.current}
                items={data?.locations?.locations}
                itemComponent={Location}
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
                  {t("locations.loadMore", "Load more locations")}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        <Footer noBackground />
      </Grid>
    </MainContent>
  );
};
