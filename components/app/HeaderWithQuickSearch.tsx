import React, { useState, ChangeEvent, useEffect, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";

import { ActiveLink } from "~/components/ui";
import { object, string } from "yup";
import type * as yup from "yup";

import { HiOutlineSearch } from "react-icons/hi";

import {
  Heading,
  Grid,
  Link,
  Box,
  VisuallyHidden,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  HStack,
} from "@chakra-ui/react";

import { useSSRSaveMediaQuery } from "~/hooks";

import { InlineLanguageButtons } from "~/components/ui";
import { useLazyQuery, gql } from "@apollo/client";
import { useForm, Controller } from "react-hook-form";
import {
  useMapContext,
  useQuickSearchSetSearchResultContext,
} from "~/provider";

const menuLinkStyling = {
  bg: "#fff",
  color: "wine.500",
};

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

export const Header = (/* props */) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [triggerSearch, { data, loading, error }] = useLazyQuery(searchQuery, {
    variables: { search: "", lang: i18n.language },
  });
  const cultureMap = useMapContext();
  const setQuickSearchResultInContext = useQuickSearchSetSearchResultContext();

  const isMobile = useSSRSaveMediaQuery("(max-width: 55em)");

  const showLogo = !isMobile ? "block" : "none";

  const [searchTerm, setSearchTerm] = useState("");

  const {
    handleSubmit,
    getValues,
    register,
    control,
    setValue,
    formState: { isSubmitting, isValid, isDirty, errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(SearchFormSchema),
  });

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
        setQuickSearchResultInContext({});
      }
      setCurrentSearchTerm(searchTerm);
    }
  }, [
    searchTerm,
    triggerSearch,
    cultureMap,
    setCurrentSearchTerm,
    currentSearchTerm,
    setQuickSearchResultInContext,
    i18n.language,
  ]);

  const searchResult = useMemo(() => {
    if (currentSearchTerm.length < 3) return [];

    if (error || !data?.quickSearch || data?.quickSearch.length === 0)
      return [];

    console.log("QS", data.quickSearch);

    return data.quickSearch;
  }, [currentSearchTerm, data, error]);

  console.log("data");

  useEffect(() => {
    if (!loading) {
      // TODO: can events be shown?
      const pins = searchResult.reduce((acc: any, result: any) => {
        if (result.module !== "location") return acc;

        return [
          ...acc,
          ...result.items.map((item: any) => ({
            id: item.id,
            type: "location",
            lat: item.geopoint.lat,
            lng: item.geopoint.lng,
          })),
        ];
      }, []);

      if (cultureMap) {
        cultureMap.clear();
        cultureMap.addMarkers(pins);
      }

      console.log(searchResult, 
        searchResult.reduce(
        (acc: any, result: any) => ({
          ...acc,
          [result.module]: {
            totalCount: result.totalCount,
            items: result.items,
          },
        }),
        {}
      ));

      setQuickSearchResultInContext(
        searchResult.reduce(
          (acc: any, result: any) => ({
            ...acc,
            [result.module]: {
              totalCount: result.totalCount,
              items: result.items,
            },
          }),
          {}
        )
      );
    }
  }, [loading, searchResult, cultureMap, setQuickSearchResultInContext]);

  const onSubmit = async (data: yup.InferType<typeof SearchFormSchema>) => {
    setSearchTerm(data.search);
  };

  useEffect(() => {
    setSearchTerm("");
  }, [router.asPath, setSearchTerm]);

  const isFieldInValid =
    (!isValid && isDirty) ||
    "search" in errors ||
    (searchTerm.length > 3 && (!data || data?.quickSearch?.length === 0));

  return (
    <Box
      m="0"
      pr={{ base: 3, md: 4 }}
      pl={{ base: 3, md: 4 }}
      position="fixed"
      w="100%"
      top="0"
      h={{
        base: "60px",
        md:"80px",
        xl:  "100",
        xl2:  "80px",
      }}
      zIndex="overlay"
      layerStyle="blurredWhite"
    >
      <Grid
        gap={6}
        templateColumns={{ base: "1fr 80px", md: "260px 1fr 80px" }}
        alignItems="center"
        p={{ base: 2, md: 3 }}
      >
        <Box display={showLogo}>
          <Heading as="h2" ml="2" fontSize="38px">
            <Link
              as={ActiveLink}
              activeClassName="active"
              href="/"
              color="black"
              textDecoration="none !important"
            >
              {t("header.logo", "CultureMap")}
            </Link>
          </Heading>
        </Box>

        <Box
          w={{ base: "100%", md: "40%" }}
          pl={{ base: "60px", md: "0" }}
          maxW="400px"
        >
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
                    fieldState: { invalid, isTouched, isDirty, error },
                    formState,
                  }) => (
                    <Input
                      pl="2"
                      onBlur={onBlur}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        onChange(event);

                        debounce(() => {
                          setSearchTerm(event.target.value);
                        }, 300)(); // <<< debounce returns a
                      }}
                      placeholder={t("search", "Search")}
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
                icon={<HiOutlineSearch />}
                type="submit"
                aria-label="Search"
                value="submit"
              />
            </HStack>
          </form>
        </Box>
        <Box>
          <InlineLanguageButtons />
        </Box>
      </Grid>
    </Box>
  );
};
