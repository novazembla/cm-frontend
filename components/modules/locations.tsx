import { useState, useEffect, useRef } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";

import { CardLocation } from "~/components/ui/CardLocation";
import { ErrorMessage } from "~/components/ui/ErrorMessage";
import { LoadingIcon } from "~/components/ui/LoadingIcon";
import dynamic from "next/dynamic";

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
import { FieldCheckboxGroup } from "~/components/forms/FieldCheckboxGroup";
import { FieldInput } from "~/components/forms/FieldInput";
import { FieldSwitch } from "~/components/forms/FieldSwitch";
import { useAppTranslations } from "~/hooks/useAppTranslations";

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { boolean, object, mixed, number } from "yup";
import { MainContent } from "~/components/app/MainContent";
import { Footer } from "~/components/app/Footer";
import { useSettingsContext, useMapContext } from "~/provider";
import { getMultilangSortedList, getSeoAppTitle } from "~/utils";
import NextHeadSeo from "next-head-seo";
import { useRouter } from "next/router";

import {
  locationsIdsQuery,
  locationsQuery,
  locationsInitialQueryState,
} from "./locationsShared";

import { PageTitle } from "../ui/PageTitle";

const LocationEmbedCodeLocations = dynamic(
  () => import("./locationEmbedCodeLocations")
);

export const LocationsFilterSchema = object().shape({});

export const ModuleComponentLocations = ({
  type = "listing",
}: {
  type: string;
}) => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const resultRef = useRef<HTMLDivElement>(null);
  const cultureMap = useMapContext();

  const router = useRouter();
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [currentMapView, setCurrentMapView] = useState("clustered");
  const [iframeQuery, setIframeQuery] = useState("");

  const [currentQueryState, setCurrentQueryState] = useState<any>({
    where: locationsInitialQueryState.where,
    orderBy: [
      {
        [`title_${i18n.language}`]: "asc",
      },
    ],
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [extendedValidationSchema, setExtendedValidationSchema] = useState(
    LocationsFilterSchema
  );

  const settings = useSettingsContext();

  useEffect(() => {
    if (settings?.taxonomies?.typeOfInstitutions?.terms) {
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
  }, [settings]);

  const { data, loading, error, fetchMore, refetch } = useQuery(
    locationsQuery,
    {
      notifyOnNetworkStatusChange: true,
      variables: {
        ...locationsInitialQueryState,
        orderBy: [
          {
            [`title_${i18n.language}`]: "asc",
          },
        ],
      },
    }
  );

  const [layzLocationIdsQuery, layzLocationIdsQueryResult] = useLazyQuery(
    locationsIdsQuery,
    {
      variables: {
        where: locationsInitialQueryState.where,
      },
    }
  );

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(extendedValidationSchema),
  });

  const { handleSubmit, reset, watch } = formMethods;

  const onSubmit = async () => {};

  const [activeTermsToI, setActiveTermsToI] = useState([]);
  const [activeTermsToO, setActiveTermsToO] = useState([]);
  const [activeTermsTA, setActiveTermsTA] = useState([]);
  const [accordionDefaultIndex, setAccordionDefaultIndex] = useState<
    number[] | null
  >(null);

  useEffect(() => {
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
      if (settings?.taxonomies?.typeOfOrganisation?.terms) {
        const terms = settings?.taxonomies?.typeOfOrganisation?.terms?.reduce(
          (acc: any, t: any) => {
            if (t._count?.locations > 0) return [...acc, t];

            return acc;
          },
          []
        );

        setActiveTermsToO(terms);

        if (terms?.length) {
          resetVars = {
            ...resetVars,
            ...terms.reduce(
              (acc: any, t: any) => ({
                ...acc,
                [`typeOfOrganisation_${t.id}`]: false,
              }),
              {}
            ),
          };
        }
      }
      if (settings?.taxonomies?.targetAudience?.terms) {
        const terms = settings?.taxonomies?.targetAudience?.terms?.reduce(
          (acc: any, t: any) => {
            if (t._count?.locations > 0) return [...acc, t];

            return acc;
          },
          []
        );

        setActiveTermsTA(terms);

        if (terms?.length) {
          resetVars = {
            ...resetVars,
            s: "",
            cluster: true,
            and: false,
            ...terms.reduce(
              (acc: any, t: any) => ({
                ...acc,
                [`targetAudience_${t.id}`]: false,
              }),
              {}
            ),
          };
        }
      }

      reset(resetVars);
    }
  }, [settings?.taxonomies, reset]);

  useEffect(() => {
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
        s: router?.query?.s ?? "",
        cluster: !(router?.query?.cluster === "0"),
        and: router?.query?.and === "1",
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
  }, [router.query, reset, activeTermsToI, activeTermsToO, activeTermsTA]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const aDI = [];
    if (urlParams.get("s")) aDI.push(0);
    if (urlParams.get("toi")) aDI.push(1);
    if (urlParams.get("ta")) aDI.push(2);
    if (urlParams.get("too")) aDI.push(3);
    if (urlParams.get("and") === "1" || urlParams.get("cluster") === "0")
      aDI.push(4);

    if (urlParams.get("cluster") === "0") {
      setCurrentMapView("unclustered");
      cultureMap?.setView("unclustered");
    }
    cultureMap?.showCurrentView();

    setAccordionDefaultIndex(aDI);
    setIsFiltered(aDI.length > 0);

    return () => {
      cultureMap?.setCurrentViewData(undefined, true);
      cultureMap?.showCurrentView();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      isFiltered &&
      !layzLocationIdsQueryResult.loading &&
      !layzLocationIdsQueryResult.error &&
      layzLocationIdsQueryResult.data?.locationIds?.ids &&
      cultureMap &&
      cultureMap?.setCurrentViewData
    ) {
      if (layzLocationIdsQueryResult.data?.locationIds?.ids?.length) {
        cultureMap?.setFilteredViewData(
          layzLocationIdsQueryResult.data?.locationIds?.ids.map(
            (id: any) => `loc-${id}`
          )
        );
      } else {
        cultureMap?.setFilteredViewData([]);
      }
      cultureMap?.fitToCurrentViewBounds();
      cultureMap?.showCurrentView();
    }
  }, [
    layzLocationIdsQueryResult.loading,
    layzLocationIdsQueryResult.error,
    layzLocationIdsQueryResult.data,
    cultureMap,
    isFiltered,
    currentMapView,
  ]);

  const watchVariables = JSON.stringify(watch());
  useEffect(() => {
    const allVars = watch();

    let where: any = [];
    let termsWhere: any = [];
    let allTerms: any[] = [];
    const termsToI = Object.keys(allVars).reduce((acc: any, key: any) => {
      if (key.indexOf("typeOfInstitution_") > -1) {
        if (allVars[key]) {
          return [...acc, parseInt(key.split("_")[1])];
        }
      }
      return acc;
    }, []);
    if (termsToI?.length) {
      allTerms = [...allTerms, ...termsToI];
      if (allVars?.and === "1" || allVars?.and === true) {
        termsWhere = [
          ...termsWhere,
          ...termsToI.map((t: number) => ({
            terms: {
              some: {
                id: {
                  in: [t],
                },
              },
            },
          })),
        ];
      }
    }

    const termsToO = Object.keys(allVars).reduce((acc: any, key: any) => {
      if (key.indexOf("typeOfOrganisation_") > -1) {
        if (allVars[key]) {
          return [...acc, parseInt(key.split("_")[1])];
        }
      }
      return acc;
    }, []);
    if (termsToO?.length) {
      allTerms = [...allTerms, ...termsToO];
      if (allVars?.and === "1" || allVars?.and === true) {
        termsWhere = [
          ...termsWhere,
          ...termsToO.map((t: number) => ({
            terms: {
              some: {
                id: {
                  in: [t],
                },
              },
            },
          })),
        ];
      }
    }

    const termsTA = Object.keys(allVars).reduce((acc: any, key: any) => {
      if (key.indexOf("targetAudience_") > -1) {
        if (allVars[key]) {
          return [...acc, parseInt(key.split("_")[1])];
        }
      }
      return acc;
    }, []);
    if (termsTA?.length) {
      allTerms = [...allTerms, ...termsTA];
      if (allVars?.and === "1" || allVars?.and === true) {
        termsWhere = [
          ...termsWhere,
          ...termsTA.map((t: number) => ({
            terms: {
              some: {
                id: {
                  in: [t],
                },
              },
            },
          })),
        ];
      }
    }

    if (allTerms?.length && (allVars?.and === "0" || allVars?.and === false)) {
      termsWhere.push({
        terms: {
          some: {
            id: {
              in: allTerms,
            },
          },
        },
      });
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

    if (termsWhere?.length) {
      if (allVars?.and === "1" || allVars?.and === true) {
        where.push({
          AND: termsWhere,
        });
      } else {
        where.push({
          OR: termsWhere,
        });
      }
    }

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

    if (allVars?.cluster) {
      cultureMap?.setView("clustered");
      setCurrentMapView("clustered");
    } else {
      cultureMap?.setView("unclustered");
      setCurrentMapView("unclustered");
    }

    if (JSON.stringify(currentQueryState) !== JSON.stringify(newQueryState)) {
      refetch({
        ...newQueryState,
        pageIndex: 0,
        pageSize: locationsInitialQueryState.pageSize,
      });

      if (where.length > 0) {
        layzLocationIdsQuery({
          variables: {
            where: newQueryState.where,
          },
        });
        setIsFiltered(true);
      } else {
        cultureMap?.setCurrentViewData(undefined, true);
        cultureMap?.showCurrentView();
        setIsFiltered(false);
      }
      setCurrentQueryState(newQueryState);
      setCurrentPageIndex(0);
    }

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
        s: allVars?.s?.trim() ?? "",
        and: allVars?.and === "1" || allVars?.and === true,
        cluster: allVars?.cluster === "1" || allVars?.cluster === true,
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

        if (key === "cluster" && !query[key]) return [...acc, `cluster=0`];

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

        if (key === "cluster" && !query[key]) return [...acc, `cluster=0`];

        if (Array.isArray(query[key]) && query[key]?.length)
          return [...acc, `${key}=${encodeURIComponent(query[key].join(","))}`];

        return acc;
      }, [])
      .join("&");

    if (type === "listing") {
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
    }

    if (type === "embed") {
      setIframeQuery(queryString);
    }
  }, [
    watchVariables,
    cultureMap,
    watch,
    refetch,
    layzLocationIdsQuery,
    currentQueryState,
    i18n?.language,
    router,
    type,
  ]);

  let resultText = t("locations.totalCount", "{{count}} location found", {
    count: data?.locations?.totalCount ?? 0,
  });
  if (data?.locations?.totalCount == 1)
    resultText = t("locations.totalCountPlural", "{{count}} locations found", {
      count: data?.locations?.totalCount,
    });

  useEffect(() => {
    if (
      !loading &&
      isFiltered &&
      data?.locations?.totalCount !== "undefined" &&
      currentPageIndex === 0
    ) {
      resultRef?.current?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
    }
  }, [loading, data?.locations?.totalCount, currentPageIndex, isFiltered]);

  return (
    <MainContent layerStyle="lightGray">
      <NextHeadSeo
        canonical={`${i18n.language === "en" ? "/en/map" : "/karte"}`}
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
        <Box px="20px" pt="0.5em">
          <PageTitle title={t("locations.title", "Map")} type="short" />
          <Box
            bg="#fff"
            borderRadius="lg"
            overflow="hidden"
            p={{
              base: "20px",
              md: "30px",
              "2xl": "35px",
            }}
          >
            <FormProvider {...formMethods}>
              <form noValidate onSubmit={handleSubmit(onSubmit)}>
                {accordionDefaultIndex && (
                  <Accordion
                    allowToggle
                    allowMultiple
                    defaultIndex={accordionDefaultIndex}
                  >
                    <AccordionItem>
                      <h2>
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
                          <AccordionIcon
                            color="cm.accentLight"
                            fontSize="2xl"
                          />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb="1em">
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
                    {activeTermsToI?.length > 0 && (
                      <AccordionItem>
                        <h2>
                          <AccordionButton pt="0" className="tabbedFocus">
                            <Box
                              flex="1"
                              textAlign="left"
                              textStyle="larger"
                              fontWeight="bold"
                            >
                              {t(
                                "locations.filter.title.typeOfInstitution",
                                "Type of institution"
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
                              "Type of institution"
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
                          <AccordionButton pt="0" className="tabbedFocus">
                            <Box
                              flex="1"
                              textAlign="left"
                              textStyle="larger"
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
                              "Target audience"
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
                          <AccordionButton pt="0" className="tabbedFocus">
                            <Box
                              flex="1"
                              textAlign="left"
                              textStyle="larger"
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
                              "Type of organisation"
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

                    <AccordionItem>
                      <h2>
                        <AccordionButton pt="0" className="tabbedFocus">
                          <Box
                            flex="1"
                            textAlign="left"
                            textStyle="larger"
                            fontWeight="bold"
                          >
                            {t(
                              "locations.filter.title.settings",
                              "Other settings"
                            )}
                          </Box>
                          <AccordionIcon
                            color="cm.accentLight"
                            fontSize="2xl"
                          />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Flex flexWrap="wrap">
                          <Flex
                            w={{ base: "100%", md: "50%" }}
                            justifyItems="center"
                            pr={{ md: "10px" }}
                            pb={{ base: "10px", md: "0" }}
                          >
                            <FieldSwitch
                              name="and"
                              label={
                                <span>
                                  {t(
                                    "locations.filter.andRelationship",
                                    "Locations must match all the given terms"
                                  )}
                                </span>
                              }
                              defaultChecked={false}
                            />
                          </Flex>
                          <Flex
                            w={{ base: "100%", md: "50%" }}
                            justifyItems="center"
                            pl={{ md: "10px" }}
                          >
                            <FieldSwitch
                              name="cluster"
                              label={
                                <span>
                                  {t(
                                    "locations.filter.clusterResult",
                                    "Cluster result on map"
                                  )}
                                </span>
                              }
                              defaultChecked={true}
                            />
                          </Flex>
                        </Flex>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                )}
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
          </Box>

          {type === "listing" && (
            <Box>
              {data?.locations?.locations?.length > 0 && (
                <Box size="md" mt="20px">
                  {data?.locations?.locations.map((location: any) => (
                    <Box key={`location-${location.id}`} pb="20px">
                      <CardLocation location={location} />
                    </Box>
                  ))}
                </Box>
              )}

              {data?.locations?.totalCount >
                data?.locations?.locations?.length &&
                !loading &&
                !error && (
                  <Box textAlign="center" mt="2em">
                    <Button
                      onClick={() => {
                        const nextPageIndex = Math.floor(
                          data?.locations?.locations?.length /
                            locationsInitialQueryState?.pageSize
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
                      {t("locations.loadMore", "Load more locations")}
                    </Button>
                  </Box>
                )}
            </Box>
          )}

          {type === "embed" && (
            <LocationEmbedCodeLocations query={iframeQuery} />
          )}
        </Box>
        <Footer noBackground />
      </Grid>
    </MainContent>
  );
};
