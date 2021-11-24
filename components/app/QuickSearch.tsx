import { useState, useEffect, ChangeEvent, useRef } from "react";
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

import { useQuickSearchContext } from "~/provider";
import { useIsBreakPoint } from "~/hooks/useIsBreakPoint";
import { useAppTranslations } from "~/hooks/useAppTranslations";


import { useLazyQuery, gql } from "@apollo/client";
import { useForm, Controller } from "react-hook-form";
import { useMapContext } from "~/provider";

import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import type * as yup from "yup";

import { LoadingIcon } from "~/components/ui/LoadingIcon";
import { ErrorMessage } from "~/components/ui/ErrorMessage";
import { SVG } from "~/components/ui/SVG";

import { QuickSearchResult } from "./QuickSearchResult";
import FocusLock from "react-focus-lock";

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

// TODO: You can now use inputmode=“none” on up to date browsers. See:
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/inputmode

export const QuickSearch = () => {
  const { t, i18n } = useAppTranslations();
  const inputFieldRef = useRef<HTMLInputElement | null>(null);

  const { isQuickSearchOpen, onQuickSearchToggle } = useQuickSearchContext();
  const { isMobile, isTablet, isTabletWide, isDesktopAndUp } =
    useIsBreakPoint();

  const [isActiveSearch, setIsActiveSearch] = useState(false);

  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [triggerSearch, { data, loading, error }] = useLazyQuery(searchQuery, {
    variables: { search: "", lang: i18n.language },
    fetchPolicy: "network-only",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const {
    handleSubmit,
    reset,
    control,
    formState: { isValid, isDirty, errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(SearchFormSchema),
  });

  const cultureMap = useMapContext();

  useEffect(() => {
    const qSEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isQuickSearchOpen) onQuickSearchToggle();
      }
    };

    if (typeof document !== "undefined") {
      document.body.addEventListener("keyup", qSEscape);
    }

    return () => {
      if (typeof document !== "undefined") {
        document.body.removeEventListener("keyup", qSEscape);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuickSearchOpen]);

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
        // TODO: is it possible to show results in map for QS?
        // if (cultureMap) cultureMap.clear();
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
  }, [loading, isActiveSearch]);

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

    if (isQuickSearchOpen && inputFieldRef.current && !isMobile) {
      inputFieldRef.current.focus();
    }
  }, [isQuickSearchOpen, reset, isMobile]);

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
            height: "calc(var(--vh) * 100)",
            width:
              isTabletWide || isDesktopAndUp
                ? isTabletWide
                  ? "66.66vw"
                  : "675px"
                : isTablet
                ? "80vw"
                : "100vw",
            left: contentLeft,
            zIndex: 1100,
          }}
          id="search"
        >
          <RemoveScroll>
            <FocusLock>
              <Flex
                w="100%"
                h="100%"
                minH="100%"
                layerStyle="pageBg"
                overflowY="auto"
              >
                <Flex
                  pt={{
                    base: "77px",
                    xl: "97px",
                  }}
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
                      base: "60px",
                      md: "20px",
                    }}
                  >
                    <Box top="0px">
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
                        <HStack
                          pt={{
                            md: "20px",
                          }}
                        >
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
                                field: { onChange, onBlur, ref },
                              }) => {
                                return (
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
                                    ref={(e: HTMLInputElement) => {
                                      ref(e);
                                      inputFieldRef.current = e; // you can still assign to ref
                                    }}
                                    sx={{
                                      "[aria-invalid=true]": {
                                        borderTop: "10px",
                                        boxShadow:
                                          "0 0 0 1px #F56565 !important",
                                      },
                                    }}
                                  />
                                );
                              }}
                            />
                          </FormControl>
                          <IconButton
                            variant="unstyled"
                            icon={
                              <SVG
                                type="arrow-right"
                                width="45px"
                                height="25px"
                              />
                            }
                            borderRadius="0"
                            p="0"
                            className="svgHover"
                            paddingInlineStart="0"
                            paddingInlineEnd="0"
                            w="50px"
                            h="25px"
                            type="submit"
                            aria-label="Search"
                            value="submit"
                            padding="0"
                            bg="transparent"
                            _focus={{
                              outline: "solid 2px #E42B20",
                              outlineOffset: "5px",
                            }}
                          />
                        </HStack>
                      </form>
                    </Box>
                    <Box mt="2">
                      {loading && <LoadingIcon />}
                      {error && <ErrorMessage type="dataLoad" />}
                      {!loading && searchTerm.length > 2 && isActiveSearch && (
                        <Box>
                          {data?.quickSearch?.length > 0 && (
                            <Box
                              my="1em"
                              textStyle="categoriesHighlight"
                              textTransform="uppercase"
                              color="cm.text"
                              fontWeight="bold"
                            >
                              {t("quicksearch.found", "found ...")}
                            </Box>
                          )}
                          {data?.quickSearch?.length > 0 && (
                            <QuickSearchResult result={data?.quickSearch} />
                          )}
                        </Box>
                      )}

                      {!loading &&
                        !error &&
                        data?.quickSearch?.length === 0 &&
                        isActiveSearch &&
                        searchTerm.length > 2 && (
                          <Box
                            my="1em"
                            textStyle="categoriesHighlight"
                            textTransform="uppercase"
                            color="cm.text"
                            fontWeight="bold"
                          >
                            {t(
                              "quicksearch.noResult",
                              "No result for your search"
                            )}
                          </Box>
                        )}
                    </Box>
                    {!isMobile && (
                      <IconButton
                        aria-label={t(
                          "menu.button.closeSearch",
                          "Close search"
                        )}
                        icon={<SVG type="cross" width="60px" height="60px" />}
                        position="absolute"
                        top="0px"
                        right="-20px"
                        borderRadius="0"
                        p="0"
                        className="svgHover tabbedVisible"
                        paddingInlineStart="0"
                        paddingInlineEnd="0"
                        padding="0"
                        bg="transparent"
                        w="30px"
                        h="30px"
                        minW="30px"
                        overflow="hidden"
                        onClick={() => {
                          onQuickSearchToggle();
                        }}
                        transition="background-color 0.3s"
                        _hover={{
                          bg: "transparent",
                        }}
                        _active={{
                          bg: "transparent",
                        }}
                        _focus={{
                          bg: "transparent",
                          outline: "solid 2px #E42B20",
                          outlineOffset: "5px",
                        }}
                        transform={
                          isMobile
                            ? "translateY(-5px) translateX(5px)"
                            : undefined
                        }
                      />
                    )}
                  </Box>
                </Flex>
              </Flex>
            </FocusLock>
          </RemoveScroll>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
