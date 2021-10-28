import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { RemoveScroll } from "react-remove-scroll";

import {
  Flex,
  Box,
  VisuallyHidden,
  FormControl,
  FormLabel,
  Input,
  chakra,
  IconButton,
  HStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

import Search from "~/assets/svg/mobil_navigation_leiste_suche.svg";

import { useConfigContext, useQuickSearchContext } from "~/provider";
import { useIsBreakPoint, useAppTranslations } from "~/hooks";

import { useRouter } from "next/router";
import { useLazyQuery, gql } from "@apollo/client";
import { useForm, Controller } from "react-hook-form";
import { useMapContext } from "~/provider";

import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import type * as yup from "yup";

import { LoadingIcon, ErrorMessage } from "~/components/ui";

import { QuickSearchResult } from ".";

const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

const searchQuery = gql`
  query quickSearch($search: String!, $lang: String!) {
    quickSearch(search: $search, lang: $lang) {
      module
      totalCount
      items {
        id
        title
        type
        slug
        countTourStops
        heroImage {
          id
          status
          meta
          cropPosition
        }
        geopoint {
          lat
          lng
        }
        dates {
          date
          begin
          end
        }
        locations {
          id
          slug

          title
          lat
          lng
        }
      }
    }
  }
`;

export const SearchFormSchema = object().shape({
  search: string().min(3).required(),
});

export const QuickSearch = () => {
  const { t, i18n, getMultilangValue } = useAppTranslations();
  const config = useConfigContext();
  const router = useRouter();

  const { isQuickSearchOpen, onQuickSearchToggle } = useQuickSearchContext();
  const { isMobile, isTablet, isTabletWide, isDesktopAndUp } =
    useIsBreakPoint();


  const [isActiveSearch, setIsActiveSearch] = useState(false)

  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [triggerSearch, { data, loading, error }] = useLazyQuery(searchQuery, {
    variables: { search: "", lang: i18n.language },
    fetchPolicy: "network-only",
  });

  const [searchTerm, setSearchTerm] = useState("");
  
  const {
    handleSubmit,
    getValues,
    reset,
    control,
    setValue,
    formState: { isSubmitting, isValid, isDirty, errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(SearchFormSchema),
  });

  const cultureMap = useMapContext();

  useEffect(() => {
    if (currentSearchTerm !== searchTerm) {
      if (searchTerm.length > 2) {
        triggerSearch({
          variables: {
            search: searchTerm,
            lang: i18n.language,
          },
        });
      } else {
        
        if (cultureMap) cultureMap.clear();
        // setQuickSearchResultInContext({});
      }
      setCurrentSearchTerm(searchTerm);
    }
  }, [
    searchTerm,
    triggerSearch,
    cultureMap,
    setCurrentSearchTerm,
    currentSearchTerm,
    i18n.language,
    loading,
  ]);

  const contentLeft = useBreakpointValue({
    base: 0,
    xl: "50px",
    "2xl": "calc(8vw - 55px)",
  });

  useEffect(() => {
    if (loading && !isActiveSearch) {
      setIsActiveSearch(true);
    } 
  }, [
    loading, 
    isActiveSearch
  ]);

  // useEffect(() => {
  //   console.log(loading, data?.quickSearch, quickSearchResult, searchingForTerm);

  //   if (loading && searchingForTerm) {
      
      
      
      
  //     setSearchingForTerm(false);
  //     console.log(1);
      
  //   } 

  //   if (!loading && data?.quickSearch && !quickSearchResult) {

  //   } 
  // }, [
  //   data?.quickSearch,
  //   loading, 
  //   searchingForTerm,
  //   quickSearchResult,
  // ]);

  // const searchResult = useMemo(() => {
  //   if (currentSearchTerm.length < 3) return [];

  //   if (error || !data?.quickSearch || data?.quickSearch.length === 0)
  //     return [];

  //   return data.quickSearch;
  // }, [currentSearchTerm, data, error]);

  // useEffect(() => {
  //   if (!loading) {
  //     // TODO: can events be shown?
  //     const pins = searchResult.reduce((acc: any, result: any) => {
  //       if (result.module !== "location") return acc;

  //       return [
  //         ...acc,
  //         ...result.items.map((item: any) => ({
  //           id: item.id,
  //           type: "location",
  //           lat: item.geopoint.lat,
  //           lng: item.geopoint.lng,
  //         })),
  //       ];
  //     }, []);

  //     if (cultureMap) {
  //       cultureMap.clear();
  //       cultureMap.addMarkers(pins);
  //     }

  //     console.log(
  //       searchResult,
  //       searchResult.reduce(
  //         (acc: any, result: any) => ({
  //           ...acc,
  //           [result.module]: {
  //             totalCount: result.totalCount,
  //             items: result.items,
  //           },
  //         }),
  //         {}
  //       )
  //     );

  //     // setQuickSearchResultInContext(
  //     //   searchResult.reduce(
  //     //     (acc: any, result: any) => ({
  //     //       ...acc,
  //     //       [result.module]: {
  //     //         totalCount: result.totalCount,
  //     //         items: result.items,
  //     //       },
  //     //     }),
  //     //     {}
  //     //   )
  //     // );
  //   }
  // }, [loading, searchResult, cultureMap]);

  const onSubmit = async (newData: yup.InferType<typeof SearchFormSchema>) => {
    setSearchTerm(newData.search);
    if (!loading) {
      triggerSearch({
        variables: {
          search: newData.search,
          lang: i18n.language,
        },
      });
    }
  };

  useEffect(() => {
    setSearchTerm("");
    setIsActiveSearch(false);
    reset({
      search: "",
    });
  }, [isQuickSearchOpen, reset]);

  const isFieldInValid =
    (!isValid && isDirty) ||
    "search" in errors ||
    (searchTerm.length > 3 && (!data || data?.quickSearch?.length === 0));

  return (
    <AnimatePresence>
      {isQuickSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            top: 0,
            height: "100vh",
            width:
              isTabletWide || isDesktopAndUp
                ? isTabletWide
                  ? "66.66vw"
                  : "675px"
                : "100%",
            left: contentLeft,
            zIndex: 1100,
          }}
        >
          <RemoveScroll>
            <Flex
              w="100%"
              h="100vh"
              minH="100%"
              pt={{
                base: "60px",
                xl: "80px",
              }}
            >
              <Flex
                sx={{
                  a: {
                    display: "inline-block",
                    marginBottom: "0.3em",
                    _last: {
                      marginBottom: 0,
                    },
                    pb: "3px",
                    mt: "0.5em",
                    borderBottom: "1px solid #ff0",
                    borderColor: "cm.accentLight",
                  },
                }}
                layerStyle="page"
                w="100%"
                h="100vh"
                overflowY="auto"
                direction={{
                  base: "column",
                }}
              >
                <Box
                  position="relative"
                  pb={{
                    base: "100px",
                    md: "20px",
                  }}
                >
                  <Box position="sticky" top="0px">
                    <Box layerStyle="headingPullOut" mb="3">
                      <chakra.h1
                        className="highlight"
                        color="cm.text"
                        fontWeight="bold"
                      >
                        {t("quicksearch.title", "Search")}
                      </chakra.h1>
                    </Box>
                    <form noValidate onSubmit={handleSubmit(onSubmit)}>
                      <HStack>
                        <FormControl isInvalid={isFieldInValid} isRequired>
                          <VisuallyHidden>
                            <FormLabel>Search</FormLabel>
                          </VisuallyHidden>
                          <Controller
                            control={control}
                            name="search"
                            rules={{
                              required: true,
                            }}
                            render={({
                              field: { onChange, onBlur, value, name, ref },
                              fieldState: {
                                invalid,
                                isTouched,
                                isDirty,
                                error,
                              },
                              formState,
                            }) => (
                              <Input
                                pl="2"
                                onBlur={onBlur}
                                onChange={(
                                  event: ChangeEvent<HTMLInputElement>
                                ) => {
                                  onChange(event);

                                  debounce(() => {
                                    setSearchTerm(event.target.value);
                                  }, 500)(); // <<< debounce returns a function
                                }}
                                placeholder={t(
                                  "quicksearch.placeholder",
                                  "Keyword"
                                )}
                                ref={ref}
                                sx={{
                                  "[aria-invalid=true]": {
                                    borderTop: "10px",
                                    boxShadow: "0 0 0 1px #F56565 !important",
                                  },
                                }}
                              />
                            )}
                          />
                        </FormControl>
                        <IconButton
                          icon={<Search />}
                          type="submit"
                          aria-label="Search"
                          value="submit"
                        />
                      </HStack>
                    </form>
                  </Box>
                  <Box mt="2">
                    {loading && <LoadingIcon />}
                    {error && <ErrorMessage type="dataLoad" />}
                    {!loading &&
                      searchTerm.length > 2 &&
                      isActiveSearch && 
                      data?.quickSearch?.length > 0 && (
                        <QuickSearchResult result={data?.quickSearch} />
                      )}

                    {!loading &&
                      !error &&
                      !data?.quickSearch?.length &&
                      isActiveSearch && 
                      searchTerm.length > 2 && (
                        <Box>
                          {t(
                            "quicksearch.noResult",
                            "No result for your search"
                          )}
                        </Box>
                      )}
                  </Box>
                </Box>
              </Flex>
            </Flex>
          </RemoveScroll>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
