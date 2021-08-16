import React, {
  useState,
  ChangeEvent,
  useEffect,
  useMemo,
  useContext,
} from "react";
import { useTranslation } from "next-i18next";
import { yupResolver } from "@hookform/resolvers/yup";

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
  useWhyDidYouUpdate,
} from "@chakra-ui/react";

import { useSSRSaveMediaQuery } from "~/hooks";

import { InlineLanguageButtons } from "~/components/ui";
import { useLazyQuery, gql } from "@apollo/client";
import { useForm, Controller } from "react-hook-form";
import { useMapSetPinsContext, useQuickSearchSetSearchResultContext } from "~/provider";

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

// const debounce = (callback: Function, delay: number) => {
//   let timer: ReturnType<typeof setTimeout>;
//   return (...args: any) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => callback(args), delay);
//   };
// };

// TODO expand search capability
const searchQuery = gql`
  query quickSearch($search: String!) {
    quickSearch(search: $search) {
      module
      totalCount
      items {
        id
        type
        title
        excerpt
        slug
        geopoint {
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
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [triggerSearch, { data, loading, error }] = useLazyQuery(searchQuery, {
    variables: { search: "" },
  });
  const setMapPinsInContext = useMapSetPinsContext();
  const setQuickSearchResultInContext = useQuickSearchSetSearchResultContext();

  const { t } = useTranslation();

  const isMobile = useSSRSaveMediaQuery("(max-width: 55em)");

  const showLogo = !isMobile ? "block" : "none";

  const [searchTerm, setSearchTerm] = useState("");

  const {
    handleSubmit,
    getValues,
    register,
    control,
    formState: { isSubmitting, isValid, isDirty, errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(SearchFormSchema),
  });
  useWhyDidYouUpdate("header", {
    searchTerm,
    triggerSearch,
    setMapPinsInContext,
    setCurrentSearchTerm,
    currentSearchTerm,
    setQuickSearchResultInContext,

  })
  useEffect(() => {
    console.log("Updated search term ", currentSearchTerm, searchTerm);

    if (currentSearchTerm !== searchTerm) {
      if (searchTerm.length > 2) {
        console.log(`Trigger ${searchTerm}`);
        triggerSearch({
          variables: {
            search: searchTerm,
          },
        });
      } else {
        console.log("clearing results");
        setMapPinsInContext([]);
        setQuickSearchResultInContext({});
      }
      setCurrentSearchTerm(searchTerm);
    }
    
  }, [
    searchTerm,
    triggerSearch,
    setMapPinsInContext,
    setCurrentSearchTerm,
    currentSearchTerm,
    setQuickSearchResultInContext,
  ]);

  const searchResult = useMemo(() => {
    if (currentSearchTerm.length < 3)
      return [];

    console.log("DATA", data, error, data?.quickSearch);
    if (error || !data?.quickSearch || data?.quickSearch.length === 0)
      return [];

    console.log("return quicksearch data result", data.quickSearch);

    return data.quickSearch;
  }, [currentSearchTerm, data, error]);

  useEffect(() => {
    if (!loading) {
      console.log("useEffect: searchResult", searchResult);
      // if ()
      // // TODO: this needs to filter out pages and stuff like that as they only show in the sidebar
      // // const pins = searchResult.reduce(
      // //   (acc: any, module: any) => [
      // //     ...acc,
      // //     ...module.items.map((item: any) => ({
      // //       id: item.id,
      // //       type: "location",
      // //       lat: item.geopoint.lat,
      // //       lng: item.geopoint.lng,
      // //     })),
      // //   ],
      // //   []
      // // );

      console.log("RESULT", searchResult);

      // // setMapPinsInContext(pins);

      setQuickSearchResultInContext(searchResult.reduce(
        (acc: any, result: any) => ({
          ...acc,
          [result.module]: {
            totalCount: result.totalCount,
            items: result.items
          }
        }),
        {}
      ));
    }
  }, [loading, searchResult, setMapPinsInContext, setQuickSearchResultInContext]);

  const onSubmit = async (data: yup.InferType<typeof SearchFormSchema>) => {
    console.log("on submit");
    setSearchTerm(data.search);
  };

  return (
    <Box
      m="0"
      pr={{ base: 3, tw: 4 }}
      pl={{ base: 3, tw: 4 }}
      position="fixed"
      w="100%"
      h="auto"
      top="0"
      minH="40px"
      zIndex="overlay"
      bg="white"
      shadow="md"
    >
      <Grid
        bg="white"
        gap={6}
        templateColumns={{ base: "1fr 62px", tw: "260px 1fr 60px" }}
        alignItems="center"
        p={{ base: 2, tw: 3 }}
      >
        <Box display={showLogo}>
          <Heading as="h2" ml="2">
            <Link
              as={ActiveLink}
              activeClassName="active"
              href="/"
              color="black"
              textDecoration="none !important"
            >
              CultureMap
            </Link>
          </Heading>
        </Box>
        
        <Box w={{ base: "100%", tw: "40%" }} pl={{base:"60px", tw: "0"}} maxW="400px">
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <HStack>
              <FormControl
                isInvalid={(!isValid && isDirty) || "search" in errors}
                isRequired
              >
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
