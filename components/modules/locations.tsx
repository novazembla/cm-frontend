import { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { LoadingIcon, ErrorMessage, CardLocation } from "~/components/ui";
import { Footer } from "~/components/app";
import {
  Box,
  chakra,
  Heading,
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

import { MainContent } from "~/components/ui";
import { useSettingsContext } from "~/provider";
import { getMultilangSortedList } from "~/utils";

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

      const keysTA = settings?.taxonomies?.typeOfOrganisation?.terms?.reduce(
        (acc: any, t: any) => {
          if (t._count?.locations > 0)
            return [...acc, `typeOfOrganisation_${t.id}`];
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

  const activeTermsToI = settings?.taxonomies?.typeOfInstitution?.terms?.reduce(
    (acc: any, t: any) => {
      if (t._count?.locations > 0) return [...acc, t];

      return acc;
    },
    []
  );
  const activeTermsToO = settings?.taxonomies?.typeOfOrganisation?.terms?.reduce(
    (acc: any, t: any) => {
      if (t._count?.locations > 0) return [...acc, t];

      return acc;
    },
    []
  );

  const activeTermsTA = settings?.taxonomies?.targetAudience?.terms?.reduce(
    (acc: any, t: any) => {
      if (t._count?.locations > 0) return [...acc, t];

      return acc;
    },
    []
  );

  const watchVariables = JSON.stringify(watch());
  useEffect(() => {
    const allVars = watch();

    console.log(allVars)
    // TODO: observe and/or filter
    const terms = Object.keys(allVars).reduce((acc: any, key: any) => {
      if (key.indexOf("typeOfInstitution_") > -1 || key.indexOf("typeOfOrganisation_") > -1 || key.indexOf("typeTargetAudience_") > -1) {
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
    // const terms = al
  }, [watchVariables, watch, refetch, currentQueryState]);

  return (
    <MainContent>
      <Box layerStyle="blurredLightGray">
        <Box px="20px" pt="0.5em">
          <Box mb="3">
            <chakra.h1 className="highlight" color="cm.text" fontWeight="bold">
              {t("locations.title", "Map")}
            </chakra.h1>
          </Box>
          <Box bg="#fff" borderRadius="lg" overflow="hidden" p="20px">
            <FormProvider {...formMethods}>
              <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Accordion allowToggle allowMultiple my="10">
                  {activeTermsToI?.length > 0 && (
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
                        <AccordionButton>
                          <Box
                            flex="1"
                            textAlign="left"
                            textStyle="headline"
                            fontWeight="bold"
                          >
                            {t(
                              "locations.filter.title.targetAudience",
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
                          id="typeTargetAudience"
                          name="typeTargetAudience"
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
                        <AccordionButton>
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
              </form>
            </FormProvider>

            {!loading && !error && (
              <Box
                textStyle="larger"
                my="1em"
                py="3"
                borderColor="cm.accentDark"
                borderTop="1px solid"
                borderBottom="1px solid"
              >
                {data?.locations?.totalCount}{" "}
                {t("page.locationcount", "Locations")}
              </Box>
            )}
          </Box>

          <Box>
            {error && <ErrorMessage type="dataLoad" />}

            {data?.locations?.locations?.length && (
              <Box size="md" mt="3">
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
              <Box>
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
                  color="white"
                  variant="solid"
                  colorScheme="red"
                >
                  Load more (DESIGN)
                </Button>
              </Box>
            )}
            {loading && <LoadingIcon />}
          </Box>
        </Box>
        <Footer />
      </Box>
    </MainContent>
  );
};
